import { ReactNode } from 'react'
import { cssToJS } from '../../utils'
import { useAppContext } from '../../contexts/AppContext'
import useCustomBodyStyling from '../../hooks/useBodyStyling'
import Footer from './Footer'
import Header from './Header'
import style from './layout.module.css'

/**
 * Layout component for all routes. Provides header, content, footer.
 */
const AppLayout = ({ children }: { children: ReactNode }) => {
  const { pageData } = useAppContext()
  useCustomBodyStyling()

  const containerStyle = pageData?.style?.container
  const contentStyle = pageData?.style?.content

  return (
    <>
      <div
        className={style.container}
        style={cssToJS(containerStyle)}
        data-testid='app-layout'
      >
        <Header />

        <div className={style.content} style={cssToJS(contentStyle)}>
          {children}
        </div>

        <Footer />
      </div>
    </>
  )
}

export default AppLayout
