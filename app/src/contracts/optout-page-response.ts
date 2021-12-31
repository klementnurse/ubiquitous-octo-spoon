/**
 * Contracts lifted from the monorepo.
 * @see https://gitlab.grit.work/optizmo/monorepo/-/blob/master/services/api/src/service/optout/optout-page-service.ts#L26
 */

export interface StyleResult {
  header?: string
  container?: string
  body?: string
  content?: string
  footer?: string
  'footer-a'?: string
}

export interface PreferenceOption {
  name: string
  id: number
}

/**
 * Some tweaks to the monorepo contract, turns out most of these properties can
 * be null.
 */
export interface OptoutPageResponse {
  style: StyleResult
  logo: string | null
  redirect: {
    url: string | null
    append_email: string | null
  }
  confirmation: {
    title: string | null
    content: string | null
  }
  landing: {
    title: string | null
    content: string | null
    contentBelowEmail: boolean | null
  }
  privacy: {
    url: string | null
    content: string | null
  }
  preference?: PreferenceOption[]
}
