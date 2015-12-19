import Relay from 'react-relay'

export default class GCNetworkLayer extends Relay.DefaultNetworkLayer {
  // Copy pasta from relay because they didn't put it in the class
  formatRequestErrors(request, errors) {
    var CONTEXT_BEFORE = 20;
    var CONTEXT_LENGTH = 60;

    var queryLines = request.getQueryString().split('\n');
    return errors.map(function (_ref, ii) {
      var locations = _ref.locations;
      var message = _ref.message;

      var prefix = ii + 1 + '. ';
      var indent = ' '.repeat(prefix.length);

      //custom errors thrown in graphql-server may not have locations
      var locationMessage = locations ? '\n' + locations.map(function (_ref2) {
        var column = _ref2.column;
        var line = _ref2.line;

        var queryLine = queryLines[line - 1];
        var offset = Math.min(column - 1, CONTEXT_BEFORE);
        return [queryLine.substr(column - 1 - offset, CONTEXT_LENGTH), ' '.repeat(offset) + '^^^'].map(function (messageLine) {
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

      if (parsedError.status === 401) {
        window.location = '/signup';
      }
      else if (parsedError.status === 403) {
        window.location = '/unauthorized';
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