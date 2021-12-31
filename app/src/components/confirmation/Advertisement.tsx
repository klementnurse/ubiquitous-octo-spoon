import { useEffect } from 'react'
import { useAppContext } from '../../contexts/AppContext'

const defaultAdUrl =
  'https://www.commissionsoup.com/api/offers/v2.ashx?c=19695&thm=213'

/**
 * Adjust ad iframe's height according a event sent by iframe payload
 * { data: ['setHeight, 123] }
 * This is done according to CommissionSoup's dev team
 */
const adjustIframeHeight = (event: { data: [string, number] }) => {
  const eventName = event.data[0]
  const iframe = document.getElementById('ad-iframe')

  if (iframe && eventName === 'setHeight') {
    iframe.style.height = event.data[1] + 'px'
  }
}

/**
 * Display an iframe with CommissionSoup ads. The iframe automatically adjusts its
 * height to contain the ads.
 */
const Advertisement = () => {
  const { campaignMailer } = useAppContext()

  useEffect(() => {
    window.addEventListener('message', adjustIframeHeight)

    return () => {
      window.removeEventListener('message', adjustIframeHeight)
    }
  }, [])

  if (!campaignMailer) {
    return null
  }

  const { sourceClientId, jailedAdvertiserId, campaignId, mailerId } =
    campaignMailer
  // This is as per DEV-3353
  const adUrl = `${defaultAdUrl}&s=${sourceClientId}&s2=${jailedAdvertiserId}&s3=${campaignId}&s4=${mailerId}&s5=1`

  return (
    <div>
      <iframe
        style={{
          width: 1,
          minWidth: '100%',
          border: 'none'
        }}
        id='ad-iframe'
        src={adUrl}
        title='Advertising content'
      />
    </div>
  )
}

export default Advertisement
