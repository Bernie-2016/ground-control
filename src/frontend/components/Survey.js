import React from 'react';
import Relay from 'react-relay';
import Radium from 'radium';

@Radium
class Survey extends React.Component {
  styles = {
    frame: {
      display: 'block',
      border: 'none',
      width: '100%',
      height: '100%',
    },
    container: {
      width: '100%',
    }
  }

  handleMessageEvent = (event) => {
    if (event.origin !== this.iframeHost())
      return;

    if (typeof event.data === 'number') {
      this.setState({iframeHeight: {height: event.data }})
    }
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
    return this.props.viewer.survey.BSDData.fullURL.split('/').slice(0, 3).join('/');
  }

  iframeLoaded = (event) => {
    event.target.contentWindow.postMessage('getHeight', this.iframeHost())
  }

  render() {
    return (
      <div style={[this.styles.container, this.state.iframeHeight]}>
        <iframe scrolling='no' src={this.props.viewer.survey.BSDData.fullURL} style={this.styles.frame} onLoad={this.iframeLoaded} />
      </div>
    )
  }
}

export default Relay.createContainer(Survey, {
  initialVariables: {
    id: null
  },
  prepareVariables: (prev) =>
  {
    return {id: prev.id}
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        survey(id:$id) {
          BSDData {
            fullURL
          }
        }
      }
    `
  }
})