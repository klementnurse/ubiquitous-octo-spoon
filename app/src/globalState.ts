/**
 * contains some global variable used site-wide
 * could use Cookie, don't think it is necessary
 * TODO: in the future, change these to RxJS subject
 */

interface GlobalState {
  /**
   * JWT token fetched by optout-key, and used in Opt-Out submission.
   */
  accessToken?: string

  /**
   * Prevent requests from being cached.
   */
  noCache: boolean
}

const globalState: GlobalState = {
  accessToken: undefined,
  noCache: false
}

export default globalState
