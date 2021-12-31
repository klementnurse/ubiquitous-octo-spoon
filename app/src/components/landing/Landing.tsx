import { useCallback, useEffect } from 'react'
import { useLocation, useParams, useHistory } from 'react-router-dom'
import qs from 'qs'
import Spinner from '../common/Spinner'
import { OptoutType } from '../../contracts'
import ErrorMessage from './ErrorMessage'
import LandingForm from './LandingForm'
import { useLandingData } from './useLandingData'
import * as Sentry from '@sentry/browser'
import { validateEmail, validateInternationalPhone } from '../../utils'

interface LandingPageParams {
  /**
   * Opt-out key in the legacy format.
   * TODO: Discover what makes this a legacy key vs whatever is not legacy.
   */
  legacyKey: string
}

export interface LandingPageProps {}

/**
 * Load critical path data (campaign mailer, page data) for opting-out, and processes
 * opt-out submissions.
 *
 * If the critical path data cannot be loaded a basic fallback form is displayed,
 * which captures opt-outs to Sentry.
 *
 * This is the only component that is currently capable of loading the required
 * data, as has access to the legacy key (MAK) required by the data endpoints.
 */
const Landing = () => {
  const history = useHistory()
  const { legacyKey } = useParams<LandingPageParams>()
  const location = useLocation()
  const { campaignMailer, submitOptout, hasLoaded, submitting, fatalError } =
    useLandingData(legacyKey)
  const query = qs.parse(location.search, { ignoreQueryPrefix: true })
  const oneClickOptout = query.email

  const submit = useCallback(
    async (email: string, sms: string, preference: number[]) => {
      const { collectFeedback, showAd } = await submitOptout(
        email,
        sms,
        preference
      )

      /* We always redirect to the confirmation page, regardless of whether the
      request succeeded or not. */
      history.push({
        pathname: '/confirmation',
        state: {
          email,
          sms,
          showAd,
          collectFeedback
        }
      })
    },
    [history, submitOptout]
  )

  /* The one-click opt-out feature discards invalid opt-outs. Because we do not surface
  submission errors back to the end user, it is the responsibility of our clients
  to ensure one-click opt-outs are correct. */
  useEffect(() => {
    const optoutType = campaignMailer?.optoutType || OptoutType.Email

    if (oneClickOptout && hasLoaded && !fatalError) {
      // Validate one-click opt-out.
      const isValid =
        (optoutType === OptoutType.Email &&
          validateEmail(oneClickOptout.toString())) ||
        (optoutType === OptoutType.SMS &&
          validateInternationalPhone(oneClickOptout.toString()))

      if (isValid) {
        // Submit valid opt-out
        submit(
          optoutType === OptoutType.Email ? (oneClickOptout as string) : '',
          optoutType === OptoutType.SMS ? (oneClickOptout as string) : '',
          []
        )
      } else if (campaignMailer) {
        /* Discard invalid opt-out and log relevant info to Sentry.
        User is then presented with the manual opt-out page.
        Logging when there is no campaign mailer is handled by useLandingData. */
        const { campaignId, mailerId, cmaId, sourceClientId, optoutType } =
          campaignMailer
        Sentry.captureMessage('Invalid one-click opt-out discarded', {
          contexts: {
            'discarded one-click opt-out': {
              oneClickOptout,
              campaignId,
              mailerId,
              cmaId,
              sourceClientId,
              optoutType
            }
          }
        })
      }
    }
  }, [oneClickOptout, campaignMailer, submit, hasLoaded, fatalError])

  const handleSubmit = (email: string, sms: string, preference: number[]) => {
    submit(email, sms, preference)
  }

  if (fatalError) {
    return <ErrorMessage message={fatalError} />
  }

  if (!hasLoaded) {
    return <Spinner />
  }

  return <LandingForm submitting={submitting} onSubmit={handleSubmit} />
}

export default Landing
