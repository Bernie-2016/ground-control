import requestPromise from 'request-promise';

export default class Orchestra {
  //customerUID = 'PWC0PU44ZPOHAI9L'
//  static secret = '60aedf735b2b6f7cf83f34c8b560ac9b'
//  static url = 'http://myaccount.maestroconference.com/_access'

  constructor(customerUID, secretToken, URL) {
    this.customerUID = customerUID;
    this.secretToken = secretToken;
    this.URL = URL;
  }

  async createConferenceCall({name, contactEmail, greenroom, recording, backgroundMusic, maxReservations, startDate, duration}) {
    var options = {
      uri: this.URL + '/createConferenceReserved',
      method: 'POST',
      form: {
        customer: this.customerUID,
        key: this.secretToken,
        name: name,
        reservationCount: 1,
        estimatedCallers1: maxReservations,
        startDate1: startDate,
        duration1: duration
      },
      json: true
    }
    console.log(options);
    try {
      var response = await requestPromise(options);
    }
    catch(err){
      console.log(err);
    }
    console.log(response);
  }
}