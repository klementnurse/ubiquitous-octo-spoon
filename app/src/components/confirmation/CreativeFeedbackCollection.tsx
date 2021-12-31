import { useEffect, useState } from 'react'
import { InputGroup, InputGroupText, Input } from 'reactstrap'
import { useAppContext } from '../../contexts/AppContext'
import { simpleToken } from '../../services/legacy'

export const generateFeedbackForwardEmail = (
  token: string,
  legacyKey: string
) => `clb_${token}_${legacyKey}@optout-feedback.com`

/**
 * Provide the opt-out user with a unique email address to forward the received
 * marketing email (creative) for us to analyse.
 */
const CreativeFeedbackCollection = () => {
  const [targetEmail, setTargetEmail] = useState<string | undefined>()
  const { campaignMailer } = useAppContext()

  useEffect(() => {
    if (!campaignMailer) {
      return
    }

    const { legacyKey } = campaignMailer

    const fetchData = async () => {
      try {
        const token = await simpleToken()
        const email = generateFeedbackForwardEmail(token, legacyKey)
        setTargetEmail(email)
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
  }, [campaignMailer])

  if (!targetEmail) {
    return null
  }

  return (
    <div
      style={{
        textAlign: 'left'
      }}
      data-testid='creative-feedback-collection'
    >
      <hr />
      <h5>
        Please Forward The Email : <span className='text-muted'>Optional</span>
      </h5>
      <p>
        Sometimes we use companies to send emails on our behalf. Forwarding the
        email helps us determine if the correct email was sent to you and if
        there were any issues in the sending process.
      </p>

      <InputGroup>
        <InputGroupText>Forward To: </InputGroupText>
        <Input
          readOnly={true}
          value={targetEmail}
          data-testid='creative-feedback-collection__forward-email'
        />
      </InputGroup>

      <div style={{ paddingTop: 8 }} />
      <i className='text-muted'>
        Just note that this is not a required process for unsubscribing, you
        have already been unsubscribed. Also this email will only work for the
        next 48 hours, so please forward the email asap.
      </i>
    </div>
  )
}

export default CreativeFeedbackCollection
