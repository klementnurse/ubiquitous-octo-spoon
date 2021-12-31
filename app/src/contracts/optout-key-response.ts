/**
 * Contracts lifted from the monorepo.
 * @see https://gitlab.grit.work/optizmo/monorepo/-/blob/master/packages/contracts/src/api/auth/auth-optout-key-response.ts#L12
 */

export enum OptoutType {
  Email = 'email',
  SMS = 'sms'
}

export interface OptoutKeyResponse {
  mailer_id: number
  campaign_id: number
  cma_id: number
  jailed_advertiser_id: number | undefined
  optout_ad_ratio: number
  optout_ad_redirect_url: string | undefined
  source_client_id: number
  target_client_id: number | undefined
  token: string
  optout_type: OptoutType
}
