import Relay from 'react-relay'

export default class RelayNetworkLayer extends Relay.DefaultNetworkLayer {
  formatRequestErrors(request, errors) {
    const CONTEXT_BEFORE = 20;
    const CONTEXT_LENGTH = 60;

    let queryLines = request.getQueryString().split('\n');

    return errors.map( (_ref, ii) => {
      let locations = _ref.locations;
      let message = _ref.message;

      let prefix = ii + 1 + '. ';
      let indent = ' '.repeat(prefix.length);

      // custom errors thrown in graphql-server may not have locations
      let locationMessage = locations ? '\n' + locations.map( (_ref2) => {
        let column = _ref2.column;
        let line = _ref2.line;

        let queryLine = queryLines[line - 1];
        let offset = Math.min(column - 1, CONTEXT_BEFORE);

        return [queryLine.substr(column - 1 - offset, CONTEXT_LENGTH), ' '.repeat(offset) + '^^^'].map( (messageLine) => {
          return indent + messageLine;
        }).join('\n');
      }).join('\n') : '';

      return prefix + message + locationMessage;
    }).join('\n');
  }

  handleStructuredError(error) {
    let parsedError = null;

    try {
      parsedError = JSON.parse(error.message);
    } catch (ex) { }

    if (parsedError) {
      log.debug(parsedError);

      if (parsedError.status === 401 || parsedError.status === 403) {
        window.location = `/signup?next=${window.location.pathname}`;
      } else if (parsedError.status === 404) {
        window.location = '/404';
      }
    }
  }

  sendQueries(requests) {
    return Promise.all(requests.map((request) => {
      return this._sendQuery(request)
        .then((result) => {
          return result.json();
        })
        .then((payload) => {
          if (payload.hasOwnProperty('errors')) {
            if (payload.errors.length > 0)
              this.handleStructuredError(payload.errors[0]);

            let errorString = 'Server request for query `' + request.getDebugName() + '` ' + 'failed for the following reasons:\n\n' + this.formatRequestErrors(request, payload.errors);
            log.error(errorString, payload.errors);

            let error = new Error(errorString);
            error.source = payload;
            request.reject(error);
          } else if (!payload.hasOwnProperty('data')) {
            let errorMsg = 'Server response was missing for query `' + request.getDebugName() + '`.';
            log.error(errorMsg);

            request.reject(new Error(errorMsg));
          } else {
            request.resolve({ response: payload.data });
          }
        })
        .catch((error) => {
          log.error(error.message);
          return request.reject(error);
        });
    }));
  };
}
