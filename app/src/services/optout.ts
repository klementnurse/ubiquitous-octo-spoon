import axios, { AxiosError } from 'axios'
import merge from 'lodash.merge'
import {
  OptoutType,
  OptoutPageResponse,
  SubmitEmailRequest
} from '../contracts'
import { PageData } from '../contracts/page-data'
import { generateDefaultPageData } from '../utils'

export const submitOptout = async (
  campaignId: number,
  request: SubmitEmailRequest
) => {
  const res = await axios.post<void>(
    `/campaigns/${campaignId}/optout-emails`,
    request
  )

  return res.data
}

export const fetchPageData = async (
  campaignId: number,
  optoutType: OptoutType
): Promise<PageData> => {
  const defaultData = generateDefaultPageData(optoutType)

  try {
    const response = await axios.get<OptoutPageResponse>(
      `/campaigns/${campaignId}/optout-page`
    )
    // Transform data to frontend contract.
    const responseData: PageData = {
      style: response.data.style,
      logo: response.data.logo ?? undefined,
      redirect: {
        url: response.data.redirect.url ?? undefined,
        appendEmail: response.data.redirect.append_email ?? undefined
      },
      confirmation: {
        title: response.data.confirmation.title ?? undefined,
        content: response.data.confirmation.content ?? undefined
      },
      landing: {
        title: response.data.landing.title ?? undefined,
        content: response.data.landing.content ?? undefined,
        contentBelowEmail: response.data.landing.contentBelowEmail ?? undefined
      },
      privacy: {
        url: response.data.privacy.url ?? undefined,
        content: response.data.privacy.url ?? undefined
      },
      preference: response.data.preference
    }
    const data = merge(defaultData, responseData)

    return data
  } catch (error) {
    const axiosError = error as AxiosError
    const status = axiosError.response ? axiosError.response.status : null

    if (status && status >= 400 && status < 500) {
      throw axiosError
    }

    // All other errors will fallback to returning default PageData.
  }

  return defaultData
}
