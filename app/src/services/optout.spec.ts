import nock from 'nock'
import * as faker from 'faker'
import { generateOptoutPageResponse } from '../test'
import { OptoutType } from '../contracts'
import { fetchPageData } from './optout'

describe('fetchPageData', () => {
  it('should override default data with response data', async () => {
    const campaignId = faker.datatype.number()
    const optoutPageResponse = generateOptoutPageResponse()
    const scope = nock('http://localhost')
      .get(`/campaigns/${campaignId}/optout-page`)
      .reply(200, optoutPageResponse, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const result = await fetchPageData(campaignId, OptoutType.Email)
    expect(result.landing.title).toBe(optoutPageResponse.landing.title)

    scope.done()
  })

  it('should fall back to default data when missing response data', async () => {
    const campaignId = faker.datatype.number()
    const optoutPageResponse = generateOptoutPageResponse()
    optoutPageResponse.landing.title = null
    const scope = nock('http://localhost')
      .get(`/campaigns/${campaignId}/optout-page`)
      .reply(200, optoutPageResponse, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const result = await fetchPageData(campaignId, OptoutType.Email)
    expect(result.landing.title).toMatch(/Please specify an email address/i)

    scope.done()
  })

  describe('when the request fails for an expected reason', () => {
    it('should throw an exception', async () => {
      const campaignId = faker.datatype.number()
      const scope = nock('http://localhost')
        .get(`/campaigns/${campaignId}/optout-page`)
        .reply(403)

      await expect(
        async () => await fetchPageData(campaignId, OptoutType.Email)
      ).rejects.toThrow()

      scope.done()
    })
  })

  describe('when the request fails for unexpected reasons', () => {
    it('should fall back to default data', async () => {
      const campaignId = faker.datatype.number()
      const scope = nock('http://localhost')
        .get(`/campaigns/${campaignId}/optout-page`)
        .reply(500)

      const result = await fetchPageData(campaignId, OptoutType.Email)
      expect(result.landing.title).toMatch(/Please specify an email address/i)

      scope.done()
    })
  })
})
