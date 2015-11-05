export default class Helpers {
  static navigateTo(component, path) {
    if (path && path.length > 0 && path[0] === '/')
      component.props.history.pushState(null, path);
    else
      component.props.history.pushState(null, component.props.location.pathname + '/' + path);
  }
}