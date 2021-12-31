import qs from 'qs'
import { Redirect, useLocation } from 'react-router-dom'
import { formatInternationalPhone } from '../../utils'
import Advertisement from './Advertisement'
import Spinner from '../common/Spinner'
import { useAppContext } from '../../contexts/AppContext'
import CreativeFeedbackCollection from './CreativeFeedbackCollection'

/**
 * Opt-out submission state is passed to the Confirmation screen via location.state.
 */
interface LocationState {
  /**
   * Opt-out email address. Either this or @see sms will be present.
   */
  email?: string

  /**
   * Opt-out photo number. Either this or @see email will be present.
   */
  sms?: string

  /**
   * Show an inline advertiser, or redirect to an external ad site if the campaignMailer
   * is configured to do so.
   */
  showAd?: boolean

  /**
   * If the opt-out submission process determined the opt-out email address should
   * collect creative feedback, a form to do so is shown.
   * Does not apply for SMS opt-outs.
   */
  collectFeedback?: boolean
}

/**
 * Display an opt-out confirmation message, or potentially redirect to advertising.
 * This screen doesn't try to load any data, instead it depends on state passed
 * from <Landing />. Directly accessing the route will result in "not found" state.
 */
const Confirmation = () => {
  const { state } = useLocation<LocationState>()
  const { campaignMailer, pageData } = useAppContext()

  if (!state?.email && !state?.sms) {
    return <Redirect to='/notfound' />
  }

  const { email, sms, showAd, collectFeedback } = state

  if (showAd && campaignMailer?.optoutAdRedirectUrl) {
    const paramsObject: {
      utm_source: string
      utm_medium: string
      utm_campaign: string

      /**
       * Source client id - slightly obfuscated.
       */
      sc: number

      /**
       * Target client id - slightly obfuscated.
       */
      tc?: number
    } = {
      utm_source: 'live',
      utm_medium: 'traffic',
      utm_campaign: 'one',
      sc: campaignMailer?.sourceClientId
    }

    // Only append the targetClientId param if its a submailer access key
    if (campaignMailer?.targetClientId) {
      paramsObject.tc = campaignMailer?.targetClientId
    }

    const params = qs.stringify(paramsObject)
    const redirectUrl = `${campaignMailer?.optoutAdRedirectUrl}${
      campaignMailer?.optoutAdRedirectUrl.match(/\?/) ? '&' : '?'
    }${params}`
    window.location.replace(redirectUrl)

    return <Spinner />
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>{pageData?.confirmation?.title}</h2>

      <div style={{ paddingTop: 16 }} />

      <strong>Successfully unsubscribed:</strong>
      <p>
        {email ? email : null}
        {sms ? formatInternationalPhone(sms) : null}
      </p>

      {pageData?.confirmation?.content ? (
        <div
          className='text-muted'
          dangerouslySetInnerHTML={{
            __html: pageData.confirmation.content
          }}
          style={{ paddingTop: 16 }}
        />
      ) : null}

      {collectFeedback ? (
        <div data-testid='confirmation__creative-feedback-collection'>
          <CreativeFeedbackCollection />
        </div>
      ) : undefined}

      {showAd ? (
        <div data-testid='confirmation__advertisement'>
          <Advertisement />
        </div>
      ) : null}
    </div>
  )
}

export default Confirmation
