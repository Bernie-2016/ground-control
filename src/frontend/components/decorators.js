import React from 'react';

// Only supports one prop for now. This will assign the first part of the "path" prop to the props specified by propMap.
export function connectPathToProps(propMap) {
  return function (DecoratedComponent) {
    return class extends React.Component {
      static propTypes = {
        navigateTo: React.PropTypes.func.isRequired,
        path: React.PropTypes.string.isRequired
      }

      pathParts() {
        return this.props.path ? this.props.path.split('/') : []
      }

      // This is a bit of a hack to also set the props as relay variables
      componentDidUpdate() {
        if (this.props.relay) {
          let firstPathPart = this.pathParts()[0]
          if (firstPathPart) {
            let vars = {}
            vars[propMap] = firstPathPart
            this.props.relay.setVariables(vars)
          }
        }
      }

      componentDidMount() {
        this.componentDidUpdate(this.props)
      }

      render() {
        let firstPathPart = this.pathParts()[0]
        let props = {
          ...this.props
        }
        if (firstPathPart)
          props[propMap] = firstPathPart;
        return (
          <DecoratedComponent {...props} />
        );
      }
    }
  }
}