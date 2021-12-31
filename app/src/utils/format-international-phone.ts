import { parsePhoneNumber } from 'libphonenumber-js'

/**
 * Format an international phone number with libphonenumber-js.
 */
export const formatInternationalPhone = (phone: string) => {
  let phoneToParse = phone.trim()
  if (phoneToParse[0] !== '+') {
    phoneToParse = `+${phoneToParse}`
  }
  let parsed

  try {
    parsed = parsePhoneNumber(phoneToParse)
  } catch (error) {
    return phone.trim()
  }

  if (parsed && parsed.isValid()) {
    return parsed.formatInternational()
  }

  return phone.trim()
}
