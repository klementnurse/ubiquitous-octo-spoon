import { PreferenceOption, StyleResult } from '.'

/**
 * Remap response data into a format friendlier on the frontend. We can also ensure
 * there are values for everything.
 */
export interface PageData {
  style: StyleResult
  logo?: string
  redirect: {
    url?: string
    appendEmail?: string
  }
  confirmation: {
    title?: string
    content?: string
  }
  landing: {
    title?: string
    content?: string
    contentBelowEmail?: boolean
  }
  privacy: {
    url?: string
    content?: string
  }
  preference?: PreferenceOption[]
}
