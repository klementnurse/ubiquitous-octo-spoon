import { PreferenceOption } from '../contracts'

/**
 * If preference options are available, validate at least one has been selected.
 *
 * @param {array} preference Array of preference IDs.
 * @param {array} preferenceOptions Array of PreferenceOption.
 * @returns {boolean} Preferences valid?
 */
export const validatePreference = (
  preference: number[],
  preferenceOptions: PreferenceOption[]
) => {
  if (!preferenceOptions?.length) {
    return true
  }

  if (preference.length > 0) {
    return true
  }

  return false
}
