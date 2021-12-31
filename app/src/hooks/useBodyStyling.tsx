import { useEffect } from 'react'
import { cssToJS } from '../utils'
import { useAppContext } from '../contexts/AppContext'

/**
 * Apply custom pageData.styles.body styles to document.body.
 */
const useCustomBodyStyling = () => {
  const { pageData } = useAppContext()
  const bodyStyles = pageData?.style?.body

  useEffect(() => {
    if (bodyStyles) {
      const styles = cssToJS(bodyStyles)

      for (const property in styles) {
        // Styles are only added, not removed.
        ;(document.body.style as any)[property] = styles[property]
      }
    }
  }, [bodyStyles])
}

export default useCustomBodyStyling
