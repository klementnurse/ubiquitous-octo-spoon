import axios from 'axios'
import Qs from 'qs'

import config from './config'
import globalState from './globalState'

/**
 * Cuts all api requests over to the api proxy in cloudfront. This is called when the client app can not establish
 * a connection with the production api for reasons out of our control such as blacklisting, extensions blocking,
 * tls issues.
 *
 * This is a circuit breaker approach and once triggered, the fallback domain will be used for the remainder
 * of the session.
 */
export const fallbackToApiProxy = () => {
  axios.defaults.baseURL = `https://dd8e7oi3be60r.cloudfront.net`
}

export const initAxios = () => {
  axios.defaults.baseURL = config.apiUrl
  axios.defaults.withCredentials = true
  axios.defaults.timeout = config.requestTimeout

  axios.defaults.paramsSerializer = function (params) {
    return Qs.stringify(params, { arrayFormat: 'indices' })
  }

  axios.interceptors.request.use(
    config => {
      if (globalState.noCache) {
        if (!config.params) {
          config.params = {}
        }
        config.params.noCache = 1
      }
      if (globalState.accessToken) {
        config.headers['Authorization'] = `Bearer ${globalState.accessToken}`
      }
      return config
    },
    error => {
      console.error('Request error', error)
      return Promise.reject(error)
    }
  )

  axios.interceptors.response.use(
    config => {
      return config
    },
    error => {
      if (!error.response || error.response.status >= 500) {
        console.error(error)
        return Promise.reject(error)
      }

      return Promise.reject(error)
    }
  )
}
