import React, { ReactNode, useCallback, useState } from 'react'
import { CampaignMailer, PageData } from '../contracts'

export interface AppContextState {
  /**
   * "Campaign Mailer" result of fetching opt-out key details. Not just a "Campaign Mailer",
   * also Opt-Out redirection details, client information, etc.
   */
  campaignMailer?: CampaignMailer

  /**
   * Customisation of the content + styling for the landing and confirmation pages.
   */
  pageData?: PageData

  /**
   * Set the "Campaign Mailer".
   */
  setCampaignMailer(newCampaignMailer: CampaignMailer): void

  /**
   * Set the page customisation.
   */
  setPageData(newPageData: PageData): void
}

export type AppContextInitialState = Pick<
  AppContextState,
  'campaignMailer' | 'pageData'
>

const AppContext = React.createContext<AppContextState | undefined>(undefined)

/**
 * Global state for the app, containing data required to display the opt-out page
 * and process an opt-out.
 */
const AppContextProvider = ({
  children,
  initialState = {},
  override = {}
}: {
  children: ReactNode

  /**
   * Populate the state with initial data.
   */
  initialState?: Partial<AppContextInitialState>

  /**
   * Override the context value, useful for testing.
   */
  override?: Partial<AppContextState>
}) => {
  const [campaignMailer, setCampaignMailer] = useState<
    CampaignMailer | undefined
  >(initialState.campaignMailer)
  const [pageData, setPageData] = useState<PageData | undefined>(
    initialState.pageData
  )

  const setCampaignMailerMemo = useCallback(
    newCampaignMailer => setCampaignMailer(newCampaignMailer),
    []
  )

  const setPageDataMemo = useCallback(
    newPageData => setPageData(newPageData),
    []
  )

  const value: AppContextState = {
    campaignMailer,
    pageData,
    setCampaignMailer: setCampaignMailerMemo,
    setPageData: setPageDataMemo,
    ...override
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = React.useContext(AppContext)

  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppContextProvider.')
  }

  return context
}

export default AppContextProvider
