import faker from 'faker'
import { OptoutPageResponse } from '../contracts'

const MAX_WORDS = 20

export const generateOptoutPageResponse = (
  optoutPageResponse?: Partial<OptoutPageResponse>
): OptoutPageResponse => ({
  logo: faker.internet.url(),
  style: {},
  landing: {
    title: faker.random.words(MAX_WORDS),
    content: faker.random.words(MAX_WORDS),
    contentBelowEmail: false
  },
  confirmation: {
    title: faker.random.words(MAX_WORDS),
    content: faker.random.words(MAX_WORDS)
  },
  privacy: {
    url: faker.internet.url(),
    content: faker.random.words(MAX_WORDS)
  },
  redirect: {
    append_email: '',
    url: faker.internet.url()
  },
  ...optoutPageResponse
})
