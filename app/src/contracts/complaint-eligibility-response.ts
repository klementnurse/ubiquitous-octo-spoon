/**
 * Contracts lifted from the monorepo.
 * @see https://gitlab.grit.work/optizmo/monorepo/-/blob/master/services/api/src/service/complaint-service.ts#L13
 */

export interface ComplaintEligibilityResponse {
  eligible: boolean
  reason?: string
  token?: string
}
