import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { RootState } from 'typesafe-actions'

import Analytics from 'utils/analytics'
const ANALYTICS_SCRIPT_TAG_ID = 'analytics-script'

interface IProps {
  children: JSX.Element
}

interface IStateProps {
  optOutAnalytics: boolean
}

type ComposedProps = IProps & IStateProps

class AnalyticsGate extends React.PureComponent<ComposedProps> {
  private scriptRef = React.createRef<HTMLScriptElement>()

  componentDidMount() {
    this.renderOrRemoveAnalyticsScript()
  }

  componentDidUpdate() {
    this.renderOrRemoveAnalyticsScript()
  }

  renderOrRemoveAnalyticsScript() {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    const scriptRef = document.getElementById(ANALYTICS_SCRIPT_TAG_ID)
    if (scriptRef !== null) {
      if (this.props.optOutAnalytics === false) {
        ReactDOM.render(
          <>
            {``}
          </>,
          scriptRef,
        )
      } else {
        ReactDOM.render(<></>, scriptRef)
        Analytics.disable()
      }
    }
  }

  render() {
    return <>{this.props.children}</>
  }
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    optOutAnalytics: store.settings.data.optOutAnalytics,
  }
}

export default compose<ComposedProps, IProps>(connect(mapStateToProps))(
  AnalyticsGate,
)
