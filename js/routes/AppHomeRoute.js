import Relay from 'react-relay';

export default class extends Relay.Route {
    static path = '/';
    static queries = {
        groupCallInvitation: () => Relay.QL`query { groupCallInvitation }`,
    };
    static routeName = 'AppHomeRoute';
}
