import { formatInternationalPhone } from './format-international-phone'

describe('formatInternationalPhone', () => {
  it('should return a formatted phone number', () => {
    const internationalNumber = '18084534343'
    expect(formatInternationalPhone(internationalNumber)).toBe(
      '+1 808 453 4343'
    )
  })

  it('account for + prefix', () => {
    const internationalNumber = '+18084534343'
    expect(formatInternationalPhone(internationalNumber)).toBe(
      '+1 808 453 4343'
    )
  })

  it("should return the original number if it couldn't be formatted", () => {
    const incorrectNumber = '123'
    expect(formatInternationalPhone(incorrectNumber)).toBe('123')
  })
})
