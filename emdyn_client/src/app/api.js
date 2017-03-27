import { SubmissionError } from 'redux-form'
import keys from 'lodash/keys'
import { notification } from 'antd'

var store

// FIXME make it as middleware
export function configure(s) { store = s }

export default function (endpoint) {
  return new API(endpoint)
}

let API_URL = '/api/v1/'
if (document && document.body) {
  API_URL = document.body.dataset.apiBaseUrl
}

class API {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  request(method = 'GET', data = {} /*, options*/ ) {
    const authToken = store.getState().session.token;
    const Authorization = authToken ? 'JWT ' + authToken : '';

    return fetch(
        `${API_URL}${this.endpoint}/`,
        {
          method,
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            Authorization
          }
        }
      )
      .then(response => {
        return response.json()
          .then(function (body) {
            if (response.ok) {
              return body;
            }

            // handle errors
            var errors = {};
            keys(body).forEach(key => {
              let eKey = key
              if (key == 'non_field_errors' || key == 'detail' || key == 'errors') {
                eKey = '_error'
                notification.error({ message: body[key] });
              }
              if (Array.isArray(body[key])) {
                errors[eKey] = body[key][0];
              } else {
                errors[eKey] = body[key];
              }
            })

            throw new SubmissionError(errors)
          })
      })
    //)
  }

  post(data) {
    return this.request('POST', data)
  }

  get() {
    return this.request()
  }

  // TODO
  //patch
  //put
  //delete
}
