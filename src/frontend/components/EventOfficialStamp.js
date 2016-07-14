import React from 'react'
import {BernieColors} from './styles/bernie-css'

export default class EventOfficialStamp extends React.Component {

  static propTypes = {
    children: React.PropTypes.string,
    color: React.PropTypes.string,
    style: React.PropTypes.object
  }

  static defaultProps = {
    children: 'Official Event',
    color: BernieColors.red,
    style: {}
  }

  styles = {
    official: {
      display: 'inline-block',
      border: `2px solid ${this.props.color}`,
      fontSize: '0.9rem',
      color: this.props.color,
      fontFamily: 'freight-sans-pro',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: '600',
      borderRadius: '3px',
      padding: '0.2rem 0.5rem',
      transform: 'rotate(-2deg)',
      verticalAlign: 'top',
      lineHeight: 'initial'
    }
  }

  render = () => <span style={{...this.styles.official, ...this.props.style}}>{this.props.children}</span>
}
