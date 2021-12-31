import React from 'react'
import { Input, FormGroup, Label, Alert } from 'reactstrap'
import { PreferenceOption } from '../../contracts'

export interface PreferenceSelectionProps {
  /**
   * List of selected preference IDs.
   */
  preference: number[]

  /**
   * List of available preferences.
   */
  preferenceOptions?: PreferenceOption[]

  /**
   * Display a notice informing the user that they should select a preference.
   */
  showAlert: boolean

  /**
   * Callback when a user changes their list of preferences.
   */
  onPreferenceSelected(newPreference: number[]): void
}

/**
 * For group lists that support it, allow the user to select a number of collection
 * lists (Preferences) to be unsubscribed from.
 */
const PreferenceSelection = ({
  preference,
  preferenceOptions = [],
  showAlert,
  onPreferenceSelected
}: PreferenceSelectionProps) => {
  /* Preference type with custom "all" field to signify rendering the
  "Unsubscribe from all lists" option. */
  type PreferenceOptionWithAll = PreferenceOption & { all?: boolean }

  const defaultOption: PreferenceOptionWithAll = {
    id: 0,
    name: 'Unsubscribe from all lists',
    all: true
  }

  const handleOptionChange = (
    option: PreferenceOptionWithAll,
    checked: boolean
  ) => {
    if (option.all) {
      if (checked) {
        onPreferenceSelected(preferenceOptions.map(option => option.id))
      } else {
        onPreferenceSelected([])
      }
    } else {
      if (checked) {
        onPreferenceSelected(preference.concat(option.id))
      } else {
        onPreferenceSelected(preference.filter(id => id !== option.id))
      }
    }
  }

  const renderOption = (option: PreferenceOptionWithAll) => {
    const { id, name, all } = option

    let checked = all
      ? preference.length === preferenceOptions.length
      : preference.includes(id)

    return (
      <FormGroup check key={option.id || 'all'}>
        <Label check>
          <Input
            type='checkbox'
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleOptionChange(option, event.target.checked)
            }
            checked={checked}
          />{' '}
          {all ? <strong>{name}</strong> : name}
        </Label>
      </FormGroup>
    )
  }

  if (!preferenceOptions.length) {
    return null
  }

  return (
    <>
      <h6>Which emails would you like to unsubscribe from?</h6>

      {showAlert && (
        <Alert color='danger'>Please select a list to unsubscribe from</Alert>
      )}

      {preferenceOptions.map(option => renderOption(option))}

      {renderOption(defaultOption)}
    </>
  )
}

export default PreferenceSelection
