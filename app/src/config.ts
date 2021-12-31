/**
 * This file should not contain any secret.
 */

interface Config {
  /**
   * URL to that will be prefixed to all API requests.
   */
  apiUrl: string

  /**
   * Timeout for Axios requests in MS.
   */
  requestTimeout: number

  /**
   * Number of times to retry failing Axios requests.
   * The total amount of requests attempted will be 1 greater than this number.
   */
  requestRetries: number
}

const thirtySecondsInMs = 30000

const DEFAULT_CONFIG = {
  apiUrl: '',
  requestTimeout: thirtySecondsInMs,
  requestRetries: 2
}

export default (function (): Config {
  if (process.env.REACT_APP_TARGET_ENV === 'development') {
    return {
      ...DEFAULT_CONFIG,
      /* Use local path + CRA proxy to avoid CORS issues.
      @see https://create-react-app.dev/docs/proxying-api-requests-in-development */
      apiUrl: ''
    }
  }

  if (process.env.REACT_APP_TARGET_ENV === 'staging') {
    return { ...DEFAULT_CONFIG, apiUrl: '//api.optoutdomain.optizmo.reviews' }
  }

  if (process.env.REACT_APP_TARGET_ENV === 'production') {
    return { ...DEFAULT_CONFIG, apiUrl: '//api.optoutsystem.com' }
  }

  return DEFAULT_CONFIG
})()
