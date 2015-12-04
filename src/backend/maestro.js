import requestPromise from 'request-promise';
import log from './log';

export default class Maestro {
  constructor(customerUID, secretToken, host, fakeCall) {
    this.customerUID = customerUID;
    this.secretToken = secretToken;
    this.host = host;
    this.fakeCall = fakeCall;
  }

  createConferenceCall(name, maxReservations, startDate, duration, {contactEmail=null, greenroom=null, recording=null, backgroundMusic=null}={}) {

    let postParams = {contactEmail, greenroom, recording, backgroundMusic}

    Object.keys(postParams).forEach((key) => typeof postParams[key] === 'undefined' ? delete postParams[key] : true);

    Object.assign(postParams, {
      customer: this.customerUID,
      key: this.secretToken,
      name: name,
      reservationCount: 1,
      estimatedCallers1: maxReservations,
      startDate1: startDate,
      duration1: duration,
      type: 'json'
    });

    let options = {
      uri: this.host + '/createConferenceReserved',
      method: 'POST',
      form: postParams,
      json: true
    }

    if (this.fakeCall) {
      log.debug('Would have made request: ' + JSON.stringify(options))
      return { value: { UID: 'test-uid' } }
    }
    return requestPromise(options);
  }
}