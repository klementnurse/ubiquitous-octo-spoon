import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as faker from 'faker'
import { testRender } from '../../test'
import PreferenceSelection from './PreferenceSelection'

const MAX_NUMBER = 65535

describe('<PreferenceSelection />', () => {
  const preferenceOptions = [
    { id: faker.datatype.number(MAX_NUMBER), name: faker.random.words(10) },
    { id: faker.datatype.number(MAX_NUMBER), name: faker.random.words(10) },
    { id: faker.datatype.number(MAX_NUMBER), name: faker.random.words(10) }
  ]
  const defaultOptionLabel = 'Unsubscribe from all lists'

  let onPreferenceSelected: jest.Mock

  interface SetupParams {
    preference?: number[]
    showAlert?: boolean
  }

  const setup = ({ preference = [], showAlert = false }: SetupParams = {}) => {
    onPreferenceSelected = jest.fn()

    testRender(
      <PreferenceSelection
        preference={preference}
        preferenceOptions={preferenceOptions}
        onPreferenceSelected={onPreferenceSelected}
        showAlert={showAlert}
      />
    )
  }

  it('should should render a list of preference options', () => {
    setup()

    expect(
      screen.getByRole('checkbox', { name: defaultOptionLabel })
    ).toBeInTheDocument()

    preferenceOptions.forEach(preference => {
      expect(
        screen.getByRole('checkbox', { name: preference.name })
      ).toBeInTheDocument()
    })
  })

  it('should remind the user to select a preference', () => {
    setup({ showAlert: true })

    expect(
      screen.getByText(/Please select a list to unsubscribe from/i)
    ).toBeInTheDocument()
  })

  describe('when selecting preferences', () => {
    describe('when adding a preference', () => {
      beforeEach(() => {
        setup()
        const firstOption = screen.getByRole('checkbox', {
          name: preferenceOptions[0].name
        })

        userEvent.click(firstOption)
      })

      it('should callback with the correct preferences', () => {
        const expectedPreferences = [preferenceOptions[0].id]

        expect(onPreferenceSelected).toHaveBeenCalledTimes(1)
        expect(onPreferenceSelected).toHaveBeenNthCalledWith(
          1,
          expectedPreferences
        )
      })
    })

    describe('when removing a preference', () => {
      beforeEach(() => {
        setup({ preference: [preferenceOptions[0].id] })
        const firstOption = screen.getByRole('checkbox', {
          name: preferenceOptions[0].name
        })

        userEvent.click(firstOption)
      })

      it('should callback with the correct preferences', () => {
        const expectedPreferences: number[] = []

        expect(onPreferenceSelected).toHaveBeenCalledTimes(1)
        expect(onPreferenceSelected).toHaveBeenNthCalledWith(
          1,
          expectedPreferences
        )
      })
    })

    describe('when adding the default ("all lists") preference', () => {
      beforeEach(() => {
        setup()
        const defaultOption = screen.getByRole('checkbox', {
          name: defaultOptionLabel
        })

        userEvent.click(defaultOption)
      })

      it('should callback with the correct preferences', () => {
        const expectedPreferences = preferenceOptions.map(
          preference => preference.id
        )

        expect(onPreferenceSelected).toHaveBeenCalledTimes(1)
        expect(onPreferenceSelected).toHaveBeenNthCalledWith(
          1,
          expectedPreferences
        )
      })
    })
  })
})
