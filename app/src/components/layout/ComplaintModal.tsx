import React, { useState } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  Fade,
  Button,
  Input,
  InputGroup,
  FormFeedback,
  Alert,
  ModalProps
} from 'reactstrap'

import { validateEmail } from '../../utils'
import { checkEligibility } from '../../services/complaint'
import { useAppContext } from '../../contexts/AppContext'
import { ComplaintEligibilityResponse } from '../../contracts'

export const generateComplaintForwardEmail = (
  token: string,
  email: string,
  legacyKey: string
) => {
  const ofcEmail = email.replace(/@/, '{a}')
  return `${token}_${ofcEmail}_${legacyKey}@optout-complaint.com`
}

const FormStep1 = ({
  campaignId,
  email,
  emailValidate,
  checkingEligibility,
  eligibility,
  onEmailChange,
  onEmailValidateChange,
  onCheckingEligibilityChange,
  onEligibilityChange
}: {
  campaignId: number
  email: string
  emailValidate: EmailValidateOptions
  checkingEligibility: boolean
  eligibility?: ComplaintEligibilityResponse
  onEmailChange(newEmail: string): void
  onEmailValidateChange(newEmailValidate: EmailValidateOptions): void
  onCheckingEligibilityChange(newCheckingEligibility: boolean): void
  onEligibilityChange(newEligibility: ComplaintEligibilityResponse): void
}) => {
  const checkEmail = async () => {
    if (validateEmail(email)) {
      onEmailValidateChange('valid')
      onCheckingEligibilityChange(true)

      try {
        const res = await checkEligibility(campaignId, { email })
        onEligibilityChange(res)
        onCheckingEligibilityChange(false)
      } catch (error) {
        console.error(error)
      }
    } else {
      onEmailValidateChange('invalid')
    }
  }

  const handleFocus = () => {
    onEmailValidateChange(undefined)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    checkEmail()
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(event.target.value)
  }

  const form = (
    <form onSubmit={handleSubmit}>
      <InputGroup
        style={{
          maxWidth: 500
        }}
      >
        <Input
          type='email'
          name='email'
          placeholder='Email Address'
          value={email}
          onFocus={handleFocus}
          onChange={handleChange}
          valid={emailValidate === 'valid'}
          invalid={emailValidate === 'invalid'}
          data-testid='complaint-modal__email-input'
        />
        <Button disabled={checkingEligibility}>
          {checkingEligibility ? 'Checking...' : 'Check Your Email'}
        </Button>
      </InputGroup>
      {emailValidate === 'invalid' ? (
        <FormFeedback style={{ display: 'block' }}>
          Please enter a valid email address.
        </FormFeedback>
      ) : null}
    </form>
  )

  let result = null

  if (eligibility) {
    if (eligibility.eligible) {
      result = (
        <Alert color='success'>
          The email address {email} is found. Please proceed to the next step.
        </Alert>
      )
    } else {
      result = <Alert color='warning'>{eligibility.reason}</Alert>
    }
  }

  return (
    <>
      <h6> 1. Check Your Email Address </h6>
      <p>Enter your email below to check if your email has been added.</p>

      {eligibility ? result : form}
    </>
  )
}

const FormStep2 = ({
  legacyKey,
  email,
  token
}: {
  legacyKey: string
  email: string
  token: string
}) => {
  const forwardEmail = generateComplaintForwardEmail(token, email, legacyKey)

  return (
    <>
      <h6>2. Forward The Email To</h6>
      <p>
        Please forward a copy of the email you received to the below email
        address so we can complete the complaint process. Just note that this
        email will only work for the next 48 hours, so please forward the email
        asap.
      </p>

      <Input
        readOnly
        value={forwardEmail}
        data-testid='complaint-modal__forward-email'
      />

      {/* spacer */}
      <div style={{ paddingTop: 16 }} />

      <strong>Why do I need to do this?</strong>
      <p>
        <small className='text-muted'>
          Sometimes emails are forwarded from another email account to your
          primary one. If you don&apos;t use the forwarding email to Opt-Out you
          will continue to receive emails. Forwarding the email helps us
          determine the exact email address and stop emails from being sent
          again.
        </small>
      </p>
    </>
  )
}

type EmailValidateOptions = 'valid' | 'invalid' | undefined

export interface ComplaintModalProps extends ModalProps {
  /**
   * When the modal is toggled internally. Does not track whether open or not.
   */
  onToggle(): void
}

/**
 * Modal with two-step form. Step 1 accepts and email address and checks if it is
 * eligible to lodge a complaint, Step 2 gives information on how to lodge the complaint.
 */
const ComplaintModal = ({ onToggle, ...modalProps }: ComplaintModalProps) => {
  const [email, setEmail] = useState('')
  const [emailValidate, setEmailValidate] = useState<EmailValidateOptions>()
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [eligibility, setEligibility] = useState<
    ComplaintEligibilityResponse | undefined
  >()
  const { campaignMailer } = useAppContext()

  if (!campaignMailer || !campaignMailer.legacyKey) {
    return null
  }

  const { legacyKey, campaignId } = campaignMailer

  const reset = () => {
    setEmail('')
    setEmailValidate(undefined)
    setCheckingEligibility(false)
    setEligibility(undefined)
  }

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail)
  }

  const handleEmailValidateChange = (
    newEmailValidate: EmailValidateOptions
  ) => {
    setEmailValidate(newEmailValidate)
  }

  const handleCheckingEligibilityChange = (newCheckingEligibility: boolean) => {
    setCheckingEligibility(newCheckingEligibility)
  }

  const handleEligibilityChange = (
    newEligibility: ComplaintEligibilityResponse
  ) => {
    setEligibility(newEligibility)
  }

  const handleToggleModal = () => {
    onToggle()
  }

  return (
    <Modal
      size={'lg'}
      toggle={handleToggleModal}
      {...modalProps}
      onClosed={reset}
    >
      <ModalHeader toggle={handleToggleModal}>
        Still receiving emails after unsubscribing?
      </ModalHeader>
      <ModalBody>
        If you have unsubscribed and you are still receiving emails from us,
        please follow the below two steps to issue a complaint.
        <hr />
        <FormStep1
          campaignId={campaignId}
          email={email}
          emailValidate={emailValidate}
          checkingEligibility={checkingEligibility}
          eligibility={eligibility}
          onEmailChange={handleEmailChange}
          onEmailValidateChange={handleEmailValidateChange}
          onCheckingEligibilityChange={handleCheckingEligibilityChange}
          onEligibilityChange={handleEligibilityChange}
        />
        {eligibility?.eligible && eligibility?.token ? (
          <Fade>
            <hr />

            <FormStep2
              legacyKey={legacyKey}
              email={email}
              token={eligibility.token}
            />
          </Fade>
        ) : null}
      </ModalBody>
    </Modal>
  )
}

export default ComplaintModal
