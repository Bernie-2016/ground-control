import React from 'react'
import {BernieText} from './styles/bernie-css'

export default class EventInvalid extends React.Component {
  static propTypes = {
    style: React.PropTypes.object
  }

  static defaultProps = {
    style: {}
  }

  render() {
    return (
      <div style={{ textAlign: 'center', margin: '4em', ...this.props.style}}>
        <h1 style={BernieText.title}>Invalid Event</h1>
        <p style={BernieText.default}>This event does not exist. If you've just recently created your event, this error may resolve itself in a short period of time. It's also possible your event was deleted.</p>
        <p>Please email <a href="mailto:help@berniesanders.com">help@berniesanders.com</a> if you need assistance.</p>
      </div>
    )
  }
}