import Relay from 'react-relay'

export default class NetworkLayer extends Relay.DefaultNetworkLayer {

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