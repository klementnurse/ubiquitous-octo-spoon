/**
 * Server was un-reachable for some reason, expected to be 5xx range errors.
 */
export class ServerUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerUnavailableError'
  }
}
