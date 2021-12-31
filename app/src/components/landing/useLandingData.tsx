import { ReactNode, useCallback, useEffect, useState } from 'react'
import retry from 'async-retry'
import * as Sentry from '@sentry/browser'
import { useAppContext } from '../../contexts/AppContext'
import {
  CampaignMailer,
  OptoutType,
  PageData,
  ServerUnavailableError
} from '../../contracts'
import { verifyKey } from '../../services/legacy'
import { fetchPageData, submitOptout } from '../../services/optout'
import config from '../../config'
import NotFound from '../common/NotFound'
import { generateDefaultPageData } from '../../utils'
import { fallbackToApiProxy } from '../../initAxios'

const CREATIVE_COLLECTION_RATIO = 0.4

/**
 * Calculate whether to collect creative feedback for an email address.
 * This is deterministic.
 */
const whetherCollect = (email: string) => {
  const [name, org] = email.split('@')
  if (!org.match(/^(yahoo|gmail|hotmail|live|aol|optestmo)/i)) {
    return false
  }
  if (name === 'testclb') {
    return true
  }
  if (name === 'testnotclb') {
    return false
  }

  // Non-deterministic. Use shortcut email names above for testing.
  return Math.random() < CREATIVE_COLLECTION_RATIO
}

/**
 * Calculate whether we should redirect to ads.
 * This is not deterministic.
 */
export const whetherShowAd = (ratio: number) => {
  return Math.random() < ratio
}

/**
 * As a last resort, capture an attempted Opt-Out to Sentry. At the very least we
 * will have the optout and the key (MAK). If the CampaignMailer was fetched, we
 * will have all the data required to easily replay the Opt-Out.
 */
const captureFailedSubmissionToSentry = (
  key: string,
  message: string,
  emailOptout?: string,
  smsOptout?: string,
  campaignId?: number,
  mailerId?: number,
  cmaId?: number
) => {
  Sentry.captureMessage(`Sentry Opt-Out Collection - ${message}`, {
    contexts: {
      'attempted optout': {
        emailOptout,
        smsOptout,
        key,
        campaignId,
        mailerId,
        cmaId
      }
    }
  })
}

export interface LandingDataResult {
  /**
   * Is the critical path data being loaded?
   * @default false
   */
  loading: boolean

  /**
   * Has critical path data finished loading? If so, it may have failed or succeeded.
   * @default false
   */
  hasLoaded: boolean

  /**
   * Was there a fatal error loading the critical path data? This will block rendering
   * and will not fallback to a basic form.
   * Note, this will not be set if there was an error submitting the opt-out, the
   * consumer doesn't need to know about that as it is handled silently.
   */
  fatalError: ReactNode

  /**
   * Is the opt-out being submitted?
   */
  submitting: boolean

  /**
   * If the CampaignMailer has been loaded, it is available here.
   * Technically it will also be available via `useAppContext()`, but it's also
   * here for convenience.
   */
  campaignMailer: CampaignMailer | undefined

  /**
   * If the PageData has been loaded, it is available here.
   * Technically it will also be available via `useAppContext()`, but it's also
   * here for convenience.
   */
  pageData: PageData | undefined

  /**
   * Submit an Opt-Out to the API for processing. If the submission fails the error
   * is handled silently, but logged to Sentry.
   * The consumer is responsible for taking action afterwards i.e. redirecting to
   * the confirmation page.
   */
  submitOptout: (
    email: string,
    sms: string,
    preference: number[]
  ) => Promise<{
    showAd: boolean
    collectFeedback: boolean
  }>
}

/**
 * Hook extracting data fetching/saving logic to improve the readability of
 * the <Landing /> component.
 * Technically any component can use this if it has access to a key (MAK).
 */
export const useLandingData = (key: string): LandingDataResult => {
  const { campaignMailer, pageData, setCampaignMailer, setPageData } =
    useAppContext()
  const [submitting, setSubmitting] = useState(false)
  const [campaignMailerLoading, setCampaignMailerLoading] = useState(false)
  const [campaignMailerHasLoaded, setCampaignMailerHasLoaded] = useState(false)
  const [campaignMailerError, setCampaignMailerError] = useState<ReactNode>()
  const [pageDataLoading, setPageDataLoading] = useState(false)
  const [pageDataHasLoaded, setPageDataHasLoaded] = useState(false)
  const [pageDataError, setPageDataError] = useState<ReactNode>()

  useEffect(() => {
    if (campaignMailer) {
      setCampaignMailerHasLoaded(true)
      return
    }

    const fetchData = async () => {
      setCampaignMailerLoading(true)
      const fallbackAttempts = 3
      const totalAttempts = config.requestRetries + fallbackAttempts
      Sentry.setContext('api_fallback', {
        fallback: false
      })

      try {
        const result = await retry(
          async (bail, attempt) => {
            // 'attempt' is indexed from 1
            const isFallbackAttempt = attempt > config.requestRetries
            if (isFallbackAttempt) {
              fallbackToApiProxy()
              Sentry.setContext('api_fallback', {
                fallback: true
              })
            }

            try {
              return await verifyKey(key)
            } catch (error) {

              // For "fatal" 4xx range errors, we don't need to retry.
              if (!(error instanceof ServerUnavailableError)) {
                bail(error as Error)
                return
              }

              throw error
            }
          },
          {
            maxTimeout: config.requestTimeout,
            retries: totalAttempts
          }
        )

        if (result) {
          setCampaignMailer(result)
        }
      } catch (error) {
        if (!(error instanceof ServerUnavailableError)) {
          setCampaignMailerError(<NotFound />)
        }
      } finally {
        setCampaignMailerLoading(false)
        setCampaignMailerHasLoaded(true)
      }
    }

    fetchData()
  }, [key, campaignMailer, setCampaignMailer])

  useEffect(() => {
    if (pageData) {
      setPageDataHasLoaded(true)
      return
    }

    /* This request is dependant on the Campaign Mailer token. We need to wait for
    it to either load and succeed, or fail so we can fall back to default page data. */
    if (!campaignMailerHasLoaded) {
      return
    }

    if (!campaignMailer) {
      // Without a Campaign Mailer we default to Email optouts.
      setPageData(generateDefaultPageData(OptoutType.Email))
      setPageDataHasLoaded(true)
      return
    }

    const fetchData = async () => {
      setPageDataLoading(true)

      try {
        const result = await fetchPageData(
          campaignMailer.campaignId,
          campaignMailer.optoutType
        )
        setPageData(result)
      } catch (error) {
        setPageDataError('This opt-out link is no longer active')
      } finally {
        setPageDataLoading(false)
        setPageDataHasLoaded(true)
      }
    }

    fetchData()
  }, [campaignMailer, campaignMailerHasLoaded, pageData, setPageData])

  const submit = useCallback(
    async (email: string, sms: string, preference: number[]) => {
      setSubmitting(true)

      if (!campaignMailer) {
        /* If the Campaign Mailer has failed to load, immediately fall back capturing
        the opt-out via Sentry. We cannot use submitOptout() as the contract expects
        data we cannot provide. */
        captureFailedSubmissionToSentry(
          key,
          'Opt-Out key failed to load',
          // Without a Campaign Mailer we are assumed to be collecting Email addresses.
          email
        )

        return {
          showAd: false,
          collectFeedback: false
        }
      }

      const {
        campaignId,
        mailerId,
        cmaId,
        optoutAdRatio,
        sourceClientId,
        optoutType
      } = campaignMailer
      const showAd = whetherShowAd(optoutAdRatio)

      try {
        await retry(
          async () => {
            await submitOptout(campaignId, {
              mailerId,
              email: optoutType === OptoutType.Email ? email : undefined,
              sms: optoutType === OptoutType.SMS ? sms : undefined,
              cmaId,
              preference,
              sourceClientId,
              wasRedirectedToAds: showAd
            })
          },
          {
            maxTimeout: config.requestTimeout,
            retries: config.requestRetries,
            onRetry: error => {
              Sentry.captureException(error)
            }
          }
        )
      } catch (error) {
        /* From the user's point of view an optout request will ALWAYS succeed i.e.
        errors are handled silently. */
        console.error(error)
        Sentry.captureException(error)
        captureFailedSubmissionToSentry(
          key,
          'submitOptout() failed to complete request',
          email,
          sms,
          campaignId,
          mailerId,
          cmaId
        )
      } finally {
        setSubmitting(false)
      }

      const collectFeedback =
        !showAd && optoutType === OptoutType.Email && whetherCollect(email)

      return {
        showAd,
        collectFeedback
      }
    },
    [key, campaignMailer]
  )

  return {
    loading: campaignMailerLoading || pageDataLoading,
    hasLoaded: campaignMailerHasLoaded && pageDataHasLoaded,
    // Campaign Mailer error takes precedence over a Page Data error.
    fatalError: campaignMailerError || pageDataError,
    submitting,
    campaignMailer,
    pageData,
    submitOptout: submit
  }
}
