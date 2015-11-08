import React from 'react';
import Radium from 'radium';

@Radium
export default class Frame extends React.Component {
  static propTypes = {
    source: React.PropTypes.string,
    onMessage: React.PropTypes.func
  }

  styles = {
    frame: {
      display: 'block',
      border: 'none',
      width: '100%',
      height: 0,
    }
  }

  sendMessage(message) {
    this.refs.frame.contentWindow.postMessage('getHeight', this.iframeHost())
  }

  handleMessageEvent = (event) => {
    if (event.origin !== this.iframeHost())
      return;

    if (!event.data.call)
      return;

    if (event.data.call == 'getHeight')
      this.setState({iframeHeight: {height: event.data.response}})
    else
      this.props.onMessage(event.data)
  }

  componentDidMount() {
    window.addEventListener('message', this.handleMessageEvent)
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessageEvent);
  }

  state = {
    iframeHeight : {height: 0}
  }

  iframeHost() {
    return this.props.source.split('/').slice(0, 3).join('/');
  }

  iframeLoaded = (event) => {
    this.sendMessage('getHeight');
  }

  render() {
    let source = this.props.source + '?aoeu'
    return (
      <iframe ref='frame' scrolling='no' src={source} style={[this.styles.frame, this.state.iframeHeight]} onLoad={this.iframeLoaded} />
    )
  }
}