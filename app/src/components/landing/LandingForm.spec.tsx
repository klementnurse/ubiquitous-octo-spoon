import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as faker from 'faker'
import { AppContextInitialState } from '../../contexts/AppContext'
import { OptoutType } from '../../contracts'
import {
  testRender,
  generatePageData,
  generateCampaignMailer
} from '../../test'
import LandingForm, { LandingFormProps } from './LandingForm'

const MAX_NUMBER = 65535

describe('<LandingForm />', () => {
  const handleSubmit = jest.fn()

  const setup = (
    { ...props }: Partial<LandingFormProps> = {},
    state: AppContextInitialState = {}
  ) => {
    testRender(<LandingForm onSubmit={handleSubmit} {...props} />, state)
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should display title and content', () => {
    const title = faker.lorem.sentence()
    const content = faker.lorem.paragraph()
    setup(
      {},
      {
        pageData: generatePageData({
          landing: {
            title,
            content,
            contentBelowEmail: false
          }
        })
      }
    )

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByText(content)).toBeInTheDocument()
    // By default, content is displayed above form.
    expect(
      screen.getByTestId('landing-form__content-above')
    ).toBeInTheDocument()
  })

  it('can display content underneath the form', () => {
    const title = faker.lorem.sentence()
    const content = faker.lorem.paragraph()
    setup(
      {},
      {
        pageData: generatePageData({
          landing: {
            title,
            content,
            contentBelowEmail: true
          }
        })
      }
    )

    expect(
      screen.getByTestId('landing-form__content-below')
    ).toBeInTheDocument()
  })

  describe('when collecting email opt-outs', () => {
    const validEmail = faker.internet.email()
    const invalidEmail = 'dingus.com'

    it('should display an email form', () => {
      setup(
        {},
        {
          campaignMailer: generateCampaignMailer({
            optoutType: OptoutType.Email
          })
        }
      )

      const submitButton = screen.getByRole('button', { name: 'Unsubscribe' })
      userEvent.click(submitButton)

      expect(
        screen.getByText(/Please enter a valid email address/i)
      ).toBeInTheDocument()
      expect(handleSubmit).not.toHaveBeenCalled()

      const emailInput = screen.getByLabelText('Email Address')
      userEvent.type(emailInput, invalidEmail)
      userEvent.click(submitButton)

      expect(
        screen.getByText(/Please enter a valid email address/i)
      ).toBeInTheDocument()
      expect(handleSubmit).not.toHaveBeenCalled()

      userEvent.clear(emailInput)
      userEvent.type(emailInput, validEmail)
      userEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalledWith(validEmail, '', [])
    })
  })

  describe('when collecting sms opt-outs', () => {
    const validPhone = '18083333333'
    const invalidPhone = '808'

    it('should display a phone number form', () => {
      setup(
        {},
        {
          campaignMailer: generateCampaignMailer({
            optoutType: OptoutType.SMS
          })
        }
      )

      const submitButton = screen.getByRole('button', { name: 'Unsubscribe' })
      userEvent.click(submitButton)

      expect(
        screen.getByText(/Please enter a valid US\/UK phone number/i)
      ).toBeInTheDocument()
      expect(handleSubmit).not.toHaveBeenCalled()

      // The selector component's input doesn't expose a proper label.
      const smsInput = screen.getByRole('textbox')
      userEvent.type(smsInput, invalidPhone)
      userEvent.click(submitButton)

      expect(
        screen.getByText(/Please enter a valid US\/UK phone number/i)
      ).toBeInTheDocument()
      expect(handleSubmit).not.toHaveBeenCalled()

      userEvent.clear(smsInput)
      userEvent.type(smsInput, validPhone)
      userEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalledWith('', validPhone, [])
    })

    it('should reject non US/UK phone numbers', () => {
      const australianPhone = '614687482023'
      setup(
        {},
        {
          campaignMailer: generateCampaignMailer({
            optoutType: OptoutType.SMS
          })
        }
      )

      const submitButton = screen.getByRole('button', { name: 'Unsubscribe' })
      // The selector component's input doesn't expose a proper label.
      const smsInput = screen.getByRole('textbox')
      userEvent.clear(smsInput)
      userEvent.type(smsInput, australianPhone)
      userEvent.click(submitButton)

      expect(
        screen.getByText(/Please enter a valid US\/UK phone number/i)
      ).toBeInTheDocument()
      expect(handleSubmit).not.toHaveBeenCalled()
    })
  })

  describe('when preferences are enabled', () => {
    const preferenceOptions = [
      { id: faker.datatype.number(MAX_NUMBER), name: faker.random.words(10) },
      { id: faker.datatype.number(MAX_NUMBER), name: faker.random.words(10) },
      { id: faker.datatype.number(MAX_NUMBER), name: faker.random.words(10) }
    ]

    it('should show a list of preference options', () => {
      const email = faker.internet.email()
      setup(
        {},
        {
          campaignMailer: generateCampaignMailer({
            optoutType: OptoutType.Email
          }),
          pageData: generatePageData({
            preference: preferenceOptions
          })
        }
      )

      expect(
        screen.getByText(/Which emails would you like to unsubscribe from/i)
      ).toBeInTheDocument()

      const submitButton = screen.getByRole('button', { name: 'Unsubscribe' })
      userEvent.click(submitButton)

      expect(
        screen.getByText(/Please select a list to unsubscribe from/i)
      ).toBeInTheDocument()
      expect(handleSubmit).not.toHaveBeenCalled()

      const firstPreference = screen.getByLabelText(preferenceOptions[0].name)
      userEvent.click(firstPreference)
      // Email required for form to pass validation.
      const emailInput = screen.getByLabelText('Email Address')
      userEvent.type(emailInput, email)
      userEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalledWith(email, '', [
        preferenceOptions[0].id
      ])
    })

    it('should not show the preference center for SMS optouts', () => {
      setup(
        {},
        {
          campaignMailer: generateCampaignMailer({
            optoutType: OptoutType.SMS
          }),
          pageData: generatePageData({
            preference: preferenceOptions
          })
        }
      )

      expect(
        screen.queryByText(/Which emails would you like to unsubscribe from/i)
      ).not.toBeInTheDocument()
    })
  })
})
