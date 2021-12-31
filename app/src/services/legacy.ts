import axios, { AxiosError } from 'axios'
import {
  CampaignMailer,
  OptoutKeyResponse,
  OptoutType,
  ServerUnavailableError
} from '../contracts'
import globalState from '../globalState'

/**
 * Verifies and fetches details about the optout campaign to display to the user
 * @param key Optout key to verify
 * @returns
 */
const verifyKey = async (key: string) => {
  try {
    const response = await axios.post<OptoutKeyResponse>(
      '/auth/legacy/optout-key',
      {
        key
      }
    )
    // Transform data to frontend contract.
    const data: CampaignMailer = {
      token: response.data.token,
      campaignId: response.data.campaign_id,
      mailerId: response.data.mailer_id,
      cmaId: response.data.cma_id,
      jailedAdvertiserId: response.data.jailed_advertiser_id,
      optoutAdRatio: response.data.optout_ad_ratio,
      optoutAdRedirectUrl: response.data.optout_ad_redirect_url,
      sourceClientId: response.data.source_client_id,
      targetClientId: response.data.target_client_id,
      optoutType: response.data.optout_type || OptoutType.Email,
      legacyKey: key
    }

    globalState.accessToken = data.token

    return data
  } catch (error) {
    const axiosError = error as AxiosError
    const status = axiosError.response ? axiosError.response.status : null

    if (status && status >= 400 && status < 500) {
      throw error
    }

    // Indicate the app should fallback to basic collection mode.
    throw new ServerUnavailableError(
      'Failed to communicate with server while fetching CampaignMailer.'
    )
  }
}

const simpleToken = async () => {
  const res = await axios.get('/legacy/simple-token')
  return res.data.token
}

export { verifyKey, simpleToken }
