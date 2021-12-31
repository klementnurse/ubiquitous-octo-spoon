import { Helmet } from 'react-helmet'

const NotFound = () => (
  <>
    <Helmet>
      <title>Invalid or Corrupted Opt-Out link</title>
    </Helmet>
    <div>
      We could not find the right page. This may be due to an invalid or corrupt
      Opt-Out Link.
    </div>
  </>
)

export default NotFound
