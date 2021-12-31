import { ReactNode } from 'react'
import { Alert } from 'reactstrap'

export interface ErrorMessageProps {
  /**
   * Message that will be displayed in the error alert. This can be text or another
   * React component.
   */
  message: ReactNode
}

/**
 * Display an alert containing an error message.
 */
const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return <Alert color='danger'>{message}</Alert>
}

export default ErrorMessage
