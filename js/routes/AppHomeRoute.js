import Relay from 'react-relay';

export default class extends Relay.Route {
    static path = '/';
    static queries = {
        viewer: () => Relay.QL`
            query {
                viewer
            }
        `,
    };
    static routeName = 'AppHomeRoute';
}
