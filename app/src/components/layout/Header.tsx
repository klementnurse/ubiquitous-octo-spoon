import { cssToJS } from '../../utils'
import layoutStyles from './layout.module.css'
import { useAppContext } from '../../contexts/AppContext'

export const optoutLogoStoragePath = 'http://www.optout-imgs.net/optouts/'

const logoURL = (logo: string) => {
  if (
    logo.startsWith('data:') ||
    logo.startsWith('http:') ||
    logo.startsWith('https:')
  ) {
    return logo
  }
  /**
   * A legacy problem...
   */
  return `${optoutLogoStoragePath}${logo}`
}

const Header = () => {
  const { pageData } = useAppContext()

  if (!pageData?.logo) {
    return null
  }

  const headerStyle = pageData?.style?.header

  return (
    <div
      className={layoutStyles.header}
      style={cssToJS(headerStyle)}
      data-testid='header'
    >
      <img
        style={{
          padding: 0,
          margin: 0
        }}
        alt=''
        src={logoURL(pageData.logo)}
      />
    </div>
  )
}

export default Header
