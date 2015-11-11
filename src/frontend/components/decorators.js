import React from 'react';

export function connectPathToRelayVariable(relayVariable) {
  return function (DecoratedComponent) {
    return class extends React.Component {
      static propTypes = {
        navigateTo: React.PropTypes.func,
        path: React.PropTypes.string
      }

      // This is a bit of a hack
      componentDidUpdate() {
        let firstPathPart = this.props.path ? this.props.path.split('/')[0] : null
        if (firstPathPart) {
          let vars = {}
          vars[relayVariable] = firstPathPart
          this.props.relay.setVariables(vars)
        }
      }

      componentDidMount() {
        this.componentDidUpdate(this.props)
      }

      render() {
        return (
          <DecoratedComponent {...this.props} />
        );
      }
    }
  }
}