const Spinner = () => {
  return (
    <div
      className='fa-7x text-muted'
      style={{
        textAlign: 'center',
        padding: 48
      }}
      data-testid='spinner'
    >
      <i className='fas fa-circle-notch fa-spin' />
    </div>
  )
}

export default Spinner
