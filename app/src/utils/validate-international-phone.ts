import { parsePhoneNumber } from 'libphonenumber-js'

/**
 * Validate a phone number with libphonenumber-js.
 *
 * @param {string} phone international phone number, can include formatting
 * @param {array} [countryCodes=[]] optionally limit phone number to these country codes
 *                                  @see https://en.wikipedia.org/wiki/List_of_country_calling_codes
 * @returns {boolean} is the phone number valid
 */
export const validateInternationalPhone = (
  phone: string,
  acceptedCountryCodes: string[] = []
) => {
  let phoneToValidate = phone.trim()
  if (phoneToValidate[0] !== '+') {
    phoneToValidate = `+${phoneToValidate}`
  }
  let parsed

  try {
    parsed = parsePhoneNumber(phoneToValidate)
  } catch (error) {
    return false
  }

  if (!parsed.isValid()) {
    return false
  }

  // Check the number against an optional list of accepted country codes.
  if (
    acceptedCountryCodes.length &&
    (!parsed.country ||
      !acceptedCountryCodes
        .map(code => code.toUpperCase())
        .includes(parsed.country.toUpperCase()))
  ) {
    return false
  }

  return true
}
