import { oneLine } from 'common-tags'
import { OptoutType, PageData } from '../contracts'

/**
 * Default page customization data if some or all of it could not be fetched.
 */
export const generateDefaultPageData = (optoutType: OptoutType): PageData => {
  const defaultPageTitle = oneLine`
    Please specify
    ${optoutType === OptoutType.Email ? 'an email address' : 'a phone number'}
    that you would like removed.
  `

  const defaultPageData = {
    style: {},
    landing: {
      title: defaultPageTitle,
      contentBelowEmail: false
    },
    confirmation: {
      title: `We are sorry to see you go.`
    },
    privacy: {},
    redirect: {}
  }

  return defaultPageData
}
