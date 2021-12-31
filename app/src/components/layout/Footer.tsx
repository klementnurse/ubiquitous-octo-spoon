import { cssToJS } from '../../utils'
import styles from './layout.module.css'
import PrivacyLink from './PrivacyLink'
import ComplaintLink from './ComplaintLink'
import { useAppContext } from '../../contexts/AppContext'
import { OptoutType } from '../../contracts'

const Footer = () => {
  const { campaignMailer, pageData } = useAppContext()

  const footerStyle = pageData?.style?.footer
  const footerLinkStyle = pageData?.style && pageData.style['footer-a']
  const showComplaintLink = campaignMailer?.optoutType === OptoutType.Email

  return (
    <div
      className={styles.footer}
      style={cssToJS(footerStyle)}
      data-testid='footer'
    >
      <PrivacyLink
        style={cssToJS(footerLinkStyle)}
        link={pageData?.privacy?.url}
        content={pageData?.privacy?.content}
      />

      {showComplaintLink ? (
        <ComplaintLink style={cssToJS(footerLinkStyle)} />
      ) : null}
    </div>
  )
}

export default Footer
