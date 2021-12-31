/**
 * Contracts lifted from the monorepo.
 * @see https://gitlab.grit.work/optizmo/monorepo/-/blob/master/packages/contracts/src/api/campaigns/campaigns-submit-email-request.ts#L8
 */

export interface SubmitEmailRequest {
  email?: string
  sms?: string
  mailerId: number
  cmaId: number
  preference?: number[]
  sourceClientId: number
  wasRedirectedToAds: boolean
}
