import faker from 'faker'
import { PageData } from '../contracts'

const MAX_WORDS = 20

export const generatePageData = (pageData?: Partial<PageData>): PageData => ({
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
    appendEmail: '',
    url: faker.internet.url()
  },
  ...pageData
})
