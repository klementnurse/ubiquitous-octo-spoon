import faker from 'faker'
import { CampaignMailer, OptoutType } from '../contracts'

const MAX_NUMBER = 65535

export const generateCampaignMailer = (
  campaignMailer?: Partial<CampaignMailer>
): CampaignMailer => ({
  campaignId: faker.datatype.number({ min: 1, max: MAX_NUMBER }),
  cmaId: faker.datatype.number({ min: 1, max: MAX_NUMBER }),
  mailerId: faker.datatype.number({ min: 1, max: MAX_NUMBER }),
  jailedAdvertiserId: faker.datatype.number({ min: 1, max: MAX_NUMBER }),
  optoutAdRatio: faker.datatype.float({ min: 0, max: 1 }),
  optoutAdRedirectUrl: faker.internet.url(),
  sourceClientId: faker.datatype.number({ min: 1, max: MAX_NUMBER }),
  targetClientId: faker.datatype.number({ min: 1, max: MAX_NUMBER }),
  token: faker.datatype.uuid(),
  optoutType: OptoutType.Email,
  legacyKey: faker.datatype.uuid(),
  ...campaignMailer
})
