import React, { useState } from 'react'
import {
  Button,
  Input,
  Row,
  Col,
  Container,
  FormFeedback,
  FormGroup,
  Label
} from 'reactstrap'
import clsx from 'clsx'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/bootstrap.css'
import {
  validateEmail,
  validateInternationalPhone,
  validatePreference
} from '../../utils'
import { useAppContext } from '../../contexts/AppContext'
import PreferenceSelection from './PreferenceSelection'
import styles from './LandingForm.module.css'
import { OptoutType } from '../../contracts'

const ACCEPTED_SMS_COUNTRY_CODES = ['US', 'GB']

export interface LandingFormProps {
  submitting?: boolean
  onSubmit(email: string, sms: string, preferences: number[]): void
}

/**
 * Landing screen form, allowing the user to Opt-Out with email or SMS number.
 * Container component (<Landing />) is responsible for loading/submitting async
 * logic.
 * Campaign Mailer may or may not be present at this point. If it is not, we assume
 * we're opting out Email addresses.
 */
const LandingForm = ({ submitting = false, onSubmit }: LandingFormProps) => {
  const { campaignMailer, pageData } = useAppContext()
  const [email, setEmail] = useState('')
  /* We accept, validate, and display internationally formatted numbers (i.e. 18081231231)
  on the frontend. The backend accepts US/UK numbers in international, or national,
  lengths without any formatting. */
  const [sms, setSms] = useState('')
  const [preference, setPreference] = useState<number[]>([])
  const [validation, setValidation] = useState<Record<string, boolean>>({
    email: true,
    sms: true,
    preference: true
  })

  // Email is the default Opt-Out type if Campaign Mailer can't load.
  const optoutType = campaignMailer?.optoutType || OptoutType.Email

  const validate = () => {
    if (optoutType === OptoutType.Email) {
      const validEmail = validateEmail(email)
      const validPreference = validatePreference(
        preference,
        pageData?.preference || []
      )

      setValidation({
        ...validate,
        email: validEmail,
        preference: validPreference
      })

      return validEmail && validPreference
    } else {
      const validSms = validateInternationalPhone(
        sms,
        ACCEPTED_SMS_COUNTRY_CODES
      )

      setValidation({
        ...validate,
        sms: validSms
      })

      return validSms
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (validate()) {
      onSubmit(email, sms, preference)
    }
  }

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail)
  }

  const handleSmsChange = (newSms: string) => {
    setSms(newSms)
  }

  const handlePreferenceChange = (newPreference: number[]) => {
    setPreference(newPreference)
    setValidation({ ...validation, preference: true })
  }

  const renderSmsInput = () => {
    const hasError = !validation.sms

    return (
      <FormGroup>
        <PhoneInput
          country={'us'}
          /* The backend only knows how to sanitise numbers from these countries.
          The component requires the codes to be lowercase for some reason. */
          onlyCountries={ACCEPTED_SMS_COUNTRY_CODES.map(code =>
            code.toLowerCase()
          )}
          value={sms}
          placeholder=''
          inputProps={{
            autoFocus: true
          }}
          containerClass={styles['phone-input-container']}
          inputClass={clsx(styles['phone-input'], hasError && 'is-invalid')}
          dropdownClass={styles['phone-dropdown']}
          onChange={handleSmsChange}
        />
        {hasError ? (
          <FormFeedback
            tooltip
            /* Force tooltip to display - default styles expect this element to
            be adjacent sibling to the input. */
            style={{ display: 'block' }}
          >
            Please enter a valid US/UK phone number.
          </FormFeedback>
        ) : null}
      </FormGroup>
    )
  }

  const renderEmailInput = () => {
    const hasError = !validation.email

    return (
      <FormGroup>
        <Label for='email' className='d-none'>
          Email Address
        </Label>
        <Input
          type='email'
          name='email'
          id='email'
          placeholder='Email Address'
          autoFocus
          value={email}
          onFocus={() => setValidation({ ...validation, email: true })}
          onChange={event => handleEmailChange(event.target.value)}
          valid={!hasError}
          invalid={hasError}
        />
        {hasError ? (
          <FormFeedback tooltip>
            Please enter a valid email address.
          </FormFeedback>
        ) : null}
      </FormGroup>
    )
  }

  const renderCTA = () => {
    if (submitting) {
      return (
        <Button type='submit' block disabled>
          Unsubscribing&nbsp;&nbsp;
          <i className='fas fa-spinner fa-spin' />
        </Button>
      )
    }

    return (
      <Button type='submit' color='primary' block>
        Unsubscribe
      </Button>
    )
  }

  const showPreferenceCenter =
    // Preference center only currently displays for email opt-outs.
    optoutType === OptoutType.Email && pageData?.preference?.length

  return (
    <div data-testid='landing-form'>
      <h2>{pageData?.landing?.title}</h2>

      {pageData?.landing?.content && !pageData?.landing?.contentBelowEmail ? (
        <div data-testid='landing-form__content-above'>
          <div dangerouslySetInnerHTML={{ __html: pageData.landing.content }} />
        </div>
      ) : null}

      <Container style={{ padding: '16px 0' }}>
        <form onSubmit={handleSubmit}>
          <Row className='justify-content-center'>
            <Col sm={10} md={7}>
              {optoutType === OptoutType.Email ? renderEmailInput() : null}
              {optoutType === OptoutType.SMS ? renderSmsInput() : null}
            </Col>
          </Row>

          {/* spring */}
          <div style={{ paddingTop: 16 }} />

          <Row className='justify-content-center'>
            <Col sm={5} md={3}>
              {renderCTA()}
            </Col>
          </Row>
        </form>

        {/** This feature is only being used by one client... or zero */}
        {pageData?.landing?.content && pageData?.landing?.contentBelowEmail ? (
          <div data-testid='landing-form__content-below'>
            <div
              style={{ paddingTop: 16 }}
              dangerouslySetInnerHTML={{ __html: pageData.landing.content }}
            />
          </div>
        ) : null}

        {showPreferenceCenter && pageData?.preference ? (
          <>
            <div style={{ paddingTop: 16 }} />

            <PreferenceSelection
              preferenceOptions={pageData.preference}
              preference={preference}
              showAlert={!validation.preference}
              onPreferenceSelected={handlePreferenceChange}
            />
          </>
        ) : null}
      </Container>
    </div>
  )
}

export default LandingForm
