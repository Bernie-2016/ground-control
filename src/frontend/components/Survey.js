import React from 'react';
import Relay from 'react-relay';
import Radium from 'radium';
import {RaisedButton} from 'material-ui';

// This just handles rendering and interacting with a BSD survey in an iFrame
@Radium
class Survey extends React.Component {
  styles = {
    container: {
      width: '100%'
    },
    frame: {
      display: 'block',
      border: 'none',
      width: '100%',
      height: 0,
    }
  }

  static propTypes = {
    onSubmit : React.PropTypes.func
  }

  static defaultProps = {
    onSubmit : () => { }
  }

  state = {
    frameStyle : {height: 0},
    isSubmitted: false
  }

  frameMessageHandler = (event) => {
    if (event.origin !== this.frameHost())
      return;

    if (event.data.message == 'loaded') {
      if (event.data.location === this.props.viewer.survey.BSDData.fullURL)
        this.sendFrameMessage('getHeight');
      else {
        this.setState({isSubmitted: true});
        this.props.onSubmit();
      }
    }

    else if (event.data.call == 'getHeight')
      this.setState({frameStyle: {height: event.data.response}})
  }

  sendFrameMessage(message) {
    this.refs.frame.contentWindow.postMessage(message, this.frameHost())
  }

  componentDidMount() {
    window.addEventListener('message', this.frameMessageHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.frameMessageHandler);
  }

  hostFromURLString(URLString) {
    return URLString.split('/').slice(0, 3).join('/');
  }

  frameHost() {
    return this.hostFromURLString(this.props.viewer.survey.BSDData.fullURL);
  }

  render() {
    let source = this.props.viewer.survey.BSDData.fullURL;
    let frame = <div></div>
    if (!this.state.isSubmitted)
      frame = (
        <iframe
          ref='frame'
          scrolling='no'
          src={source}
          style={[this.styles.frame, this.state.frameStyle]}
          onLoad={this.frameLoaded}
        />
      )

    return (
      <div style={this.styles.container}>
        {frame}
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