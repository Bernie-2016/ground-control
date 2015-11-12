import React from 'react';
import Relay from 'react-relay';

export class Router extends React.Component {
  componentWillMount() {
    this.props.history.listen((location) => {
      this.setState({path: location.pathname})
    })
  }

  state = {
    path: ''
  }

  navigateTo = (path) => {
    this.props.history.pushState(null, path)
  }

  render() {
    let path = this.state.path;
    let component = <div>404 - Path not found</div>
    this.props.routes.forEach((route) => {
      if (path.indexOf(route.path) === 0) {
        let parts = path.split('/').filter((part) => part !== '')
        component = <Relay.RootContainer
          Component={route.component}
          route={new route['queries']()}
          renderFetched={(data) => {
            return (
              <route.component
                path={parts.slice(1).join('/')}
                parentPath={'/' + parts.join('/')}
                navigateTo={this.navigateTo}
                {...data}
              />
            )
          }}
        />
      }
    })
    return component
  }
}

// This will match the path to a set of prop names and also set those props as relay variables
export function Route(matchString) {
  return function (DecoratedComponent) {
    return class extends React.Component {
      static propTypes = {
        parentPath: React.PropTypes.string.isRequired,
        path: React.PropTypes.string,
        navigateTo: React.PropTypes.func.isRequired
      }

      path() {
        return this.props.path || ''
      }

      propNameFromMatchPart(part) {
        if (part && part[0] == ':')
          return part.substring(1)
        return null;
      }

      propsFromPath() {
        let matchParts = matchString.split('/')
        let propMap = {}
        matchParts.forEach((part) => {
          let propName = this.propNameFromMatchPart(part)
          if (propName)
            propMap[propName] = null;
        })

        let pathParts = this.path().split('/')
        for (let index = 0; index < pathParts.length; index++) {
          let match = this.propNameFromMatchPart(matchParts[index])
          if (match)
            propMap[match] = pathParts[index];
        }
        return propMap;
      }

      // This is a bit of a hack to also set the props as relay variables
      componentDidUpdate() {
        if (this.props.relay) {
          this.props.relay.setVariables(this.propsFromPath())
        }
      }

      componentDidMount() {
        this.componentDidUpdate()
      }

      render() {
        let navigateTo = (path) => {
          let parentPath = this.props.parentPath;
          let childPath = this.path();
          let basePath = parentPath;
          if (childPath !== '') {
            let childIndex = parentPath.indexOf(childPath);

            if (childIndex !== -1)
              basePath = parentPath.substring(0, childIndex);
          }
          if (basePath[basePath.length-1] !== '/')
            basePath = basePath + '/';

          this.props.navigateTo(basePath + path);
        }
        let props = {
          ...this.propsFromPath(),
          ...this.props,
          navigateTo: navigateTo
        }
        return (
          <DecoratedComponent {...props} />
        );
      }
    }
  }
}