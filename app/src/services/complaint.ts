import axios from 'axios'
import {
  ComplaintEligibilityRequest,
  ComplaintEligibilityResponse
} from '../contracts'

const checkEligibility = async (
  campaignId: number,
  request: ComplaintEligibilityRequest
) => {
  const res = await axios.get<ComplaintEligibilityResponse>(
    `/campaigns/${campaignId}/complaints/eligibility`,
    {
      params: request
    }
  )
  return res.data
}

export { checkEligibility }
