/* START import + polyfills required for IE11. Do not change the order of these
unless you have researched CRA + IE11 support. */
/** @jsxRuntime classic */
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import React from 'react'
/* END import + polyfills required for IE11. */
import * as Sentry from '@sentry/browser'

const environment = process.env.REACT_APP_TARGET_ENV || 'development'
const releaseVersion =
  process.env.REACT_APP_RELEASE_VERSION ||
  process.env.npm_package_version ||
  'UNVERSIONED'

Sentry.init({
  dsn: 'https://6c20ba397902400f9d47007cf6200a24@sentry.io/1314267',
  environment,
  ignoreErrors: [
    // https://optizmo.atlassian.net/browse/DEV-3858
    /TypeError: null is not an object \(evaluating '.\.title'\)/,
    // https://optizmo.atlassian.net/browse/DEV-4161
    /window.webkit.messageHandlers/,
    // https://optizmo.atlassian.net/browse/DEV-4161
    /ceCurrentVideo.currentTime/,
    // https://optizmo.atlassian.net/browse/DEV-4163
    /docs-homescreen-gb-container/,
    // https://optizmo.atlassian.net/browse/DEV-4729
    /Non-Error promise rejection captured with value: Object Not Found Matching Id/
  ],
  beforeSend(event, hint) {
    // https://optizmo.atlassian.net/browse/DEV-4500
    if (
      event.exception?.values &&
      event.exception.values.find(
        exception =>
          exception.value &&
          /Non-Error promise rejection captured with value/i.test(
            exception.value
          )
      ) &&
      !hint?.originalException
    ) {
      /* Unhandled promise rejection without a properly formatted Error. Reporting
      this to Sentry does not help us identify issues. */
      return null
    }

    /* Sentry recommends adding a sample rate to error events to reduce the quota
    impact of new errors.
    The `sampleRate` SDK configuration option isn't good enough because it applies
    globally across all captured events/messages. We need some messages to be always
    sent as they are critical to data recovery.
    @see https://docs.sentry.io/platforms/javascript/configuration/sampling/ */
    // https://optizmo.atlassian.net/browse/DEV-5048
    if (event.message && /^Sentry Opt-Out Collection/i.test(event.message)) {
      return event
    }

    // 3 in 4 events are discarded in a non-deterministic way.
    const shouldDiscardEvent = Math.random() > 0.25
    if (shouldDiscardEvent) {
      return null
    }

    // Everything else is sent.
    return event
  },
  whitelistUrls:
    process.env.REACT_APP_TARGET_ENV === 'production'
      ? [/ds2r9mr2r4h38\.cloudfront\.net/]
      : undefined,
  release: releaseVersion
})

/* eslint-disable import/first -- We want to initialise Sentry first to catch errors in sub-modules. */
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './components/App'
import { initAxios } from './initAxios'
initAxios()
import './monkeyPatchForGoogleTranslate'
import './index.css'
/* eslint-enable import/first */

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
