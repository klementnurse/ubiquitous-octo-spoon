import { validateInternationalPhone } from './validate-international-phone'

describe('validateInternationalPhone', () => {
  it('should validate international numbers', () => {
    const validNumber = '18084534343'
    expect(validateInternationalPhone(validNumber)).toBe(true)

    const invalidNumber = '8084534343'
    expect(validateInternationalPhone(invalidNumber)).toBe(false)
  })

  it('should validate country codes', () => {
    const usNumber = '18084534343'
    expect(validateInternationalPhone(usNumber, ['us'])).toBe(true)

    const australianNumber = '61468748023'
    expect(validateInternationalPhone(australianNumber, ['us'])).toBe(false)
  })

  it('account for + prefix', () => {
    const validNumber = '+18084534343'
    expect(validateInternationalPhone(validNumber)).toBe(true)
  })
})
