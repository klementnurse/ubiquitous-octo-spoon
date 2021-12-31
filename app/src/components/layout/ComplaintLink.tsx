import { CSSProperties, useState } from 'react'
import ComplaintModal from './ComplaintModal'
import { useAppContext } from '../../contexts/AppContext'
import { Button } from 'reactstrap'

export interface ComplaintLinkProps {
  /**
   * Extra CSS styling for the link. Used for page customisation.
   */
  style?: CSSProperties
}

/**
 * Link to a modal for collecting complaints.
 */
const ComplaintLink = ({ style }: ComplaintLinkProps) => {
  const [showModal, setShowModal] = useState(false)
  const { campaignMailer } = useAppContext()

  const toggleModal = () => {
    setShowModal(!showModal)
  }

  if (!campaignMailer?.campaignId) {
    return null
  }

  return (
    <>
      <ComplaintModal isOpen={showModal} onToggle={toggleModal} />
      <Button color='link' size='sm' style={style} onClick={toggleModal}>
        Still receiving email after unsubscribing?
      </Button>
    </>
  )
}

export default ComplaintLink
