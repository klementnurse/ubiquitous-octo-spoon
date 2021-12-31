import { OptoutKeyResponse } from './optout-key-response'

/**
 * Remap response data into a format friendlier on the frontend.
 */
export interface CampaignMailer {
  token: OptoutKeyResponse['token']
  campaignId: OptoutKeyResponse['campaign_id']
  mailerId: OptoutKeyResponse['mailer_id']
  cmaId: OptoutKeyResponse['cma_id']
  jailedAdvertiserId: OptoutKeyResponse['jailed_advertiser_id']
  optoutAdRatio: OptoutKeyResponse['optout_ad_ratio']
  optoutAdRedirectUrl: OptoutKeyResponse['optout_ad_redirect_url']
  sourceClientId: OptoutKeyResponse['source_client_id']
  targetClientId: OptoutKeyResponse['target_client_id']
  optoutType: OptoutKeyResponse['optout_type']

  /**
   * Extra property storing the key used to request the CM.
   */
  legacyKey: string
}
