import { CSSProperties, useState } from 'react'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'

export interface PrivacyLinkProps {
  /**
   * Privacy content to display in a modal.
   */
  content?: string

  /**
   * Link to an external privacy page url instead of displaying the privacy content
   * in a modal.
   */
  link?: string

  /**
   * Extra CSS styling for the link. Used for page customisation.
   */
  style?: CSSProperties
}

/**
 * Display a link to either an external privacy page, or a modal window with privacy
 * content. If neither are provided, no link is shown.
 */
const PrivacyLink = ({ content, link, style }: PrivacyLinkProps) => {
  const [showModal, setShowModal] = useState(false)

  const toggleModal = (event: React.MouseEvent) => {
    event.preventDefault()
    setShowModal(!showModal)
  }

  if (link) {
    return (
      <a href={link} target='_blank' rel='noreferrer' style={style}>
        Privacy
      </a>
    )
  }

  if (!content) {
    // Empty <div /> required for parent flex-container to properly layout children.
    return <div></div>
  }

  return (
    <>
      <Modal isOpen={showModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Privacy Statement</ModalHeader>
        <ModalBody>{content}</ModalBody>
      </Modal>
      {
        // eslint-disable-next-line jsx-a11y/anchor-is-valid -- Too scared to change this to a <button />.
        <a href='#' style={style} onClick={toggleModal}>
          Privacy Statement
        </a>
      }
    </>
  )
}

export default PrivacyLink
