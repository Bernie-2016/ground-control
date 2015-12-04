import Relay from 'react-relay'
export default class RelayNetworkLayer extends Relay.DefaultNetworkLayer
{
  handleStructuredError(error) {
    let parsedError = null;
    console.log(error.message)
    try {
      parsedError = JSON.parse(error.message)
    } catch (ex) {
      console.log(ex)
    }
    if (parsedError) {
      console.log(parsedError)
      if (parsedError.status === 401)
        window.location = '/signup'
      else if (parsedError.status === 404)
        window.location = '/404'
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
              this.handleStructuredError(payload.errors[0])

            let error = new Error('Server request for query `' + request.getDebugName() + '` ' + 'failed for the following reasons:\n\n' + formatRequestErrors(request, payload.errors));
            error.source = payload;
            request.reject(error);
          } else if (!payload.hasOwnProperty('data')) {
            request.reject(new Error('Server response was missing for query `' + request.getDebugName() + '`.'));
          } else {
            request.resolve({ response: payload.data });
          }
        })
        .catch((error) => {
          return request.reject(error);
        });
    }));
  };
}