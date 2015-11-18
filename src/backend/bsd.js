import requestPromise from 'request-promise';
import url from 'url';
import crypto from 'crypto';
import querystring from 'querystring';
import XMLParser from 'xml2json';
import Promise from 'bluebird';

export default class BSD {
  constructor(host, id, secret) {
    this.baseURL = url.parse('http://' + host);
    this.baseURL.pathname = '/page/api/';
    this.apiId = id;
    this.apiVersion = 2;
    this.apiSecret = secret;
  }

  generateBSDURL(callPath, {params={}, secure=false}={}) {
    if (callPath[0] === '/')
      callPath = callPath.substring(1, callPath.length);
    callPath = url.resolve(this.baseURL.pathname, callPath)
    let timestamp = Math.floor(Date.now() / 1000);
    params['api_ver'] = this.apiVersion;
    params['api_id'] = this.apiId;
    params['api_ts'] = timestamp;

    let sortedParams = Object.keys(params).sort().map((key) => {
      let param = {}
      param[key] = params[key]
      return param;
    });

    let unencodedQueryString = sortedParams.map((element) => {
      let key = Object.keys(element)[0]
      return key + '=' + element[key]
    }).join('&');

    let signingString = [
      params['api_id'],
      params['api_ts'],
      callPath,
      unencodedQueryString
    ].join('\n');

    let encryptedMessage = crypto.createHmac('sha1', this.apiSecret);
    encryptedMessage.update(signingString);
    let apiMac = encryptedMessage.digest('hex');
    sortedParams.push({api_mac : apiMac});
    let encodedQueryString = sortedParams.map((element) => {
      return querystring.stringify(element)
    }).join('&');
    let finalURL = url.parse(url.resolve(url.format(this.baseURL), callPath));
    finalURL.protocol = 'https:';
    finalURL.search = '?' + encodedQueryString;
    return url.format(finalURL);
  };

  async getConstituentGroup(groupId) {
    let response = await this.request('cons_group/get_constituent_group', {cons_group_id: groupId}, 'GET');
    return JSON.parse(XMLParser.toJson(response));
  }

  async getForm(formId) {
    let response = await this.request('signup/get_form', {signup_form_id: formId}, 'GET');
    return JSON.parse(XMLParser.toJson(response));
  }

  async getConstituents(filter, bundles) {
    let bundleString = bundles.join(',')
    let filterStrings = []
    Object.keys(filter).forEach((key) => {
      let val = ''
      if (typeof filter[key].join === 'function') {
        val = '(' + filter[key].join(',') + ')';
      }
      else
        val = filter[key];
      filterStrings.push(key + '=' + val)
    })
    let filterString = filterStrings.join(',');
    console.log(bundleString)
    let response = await this.request('cons/get_constituents', {filter: filterString, bundles: bundleString}, 'GET');
    return JSON.parse(XMLParser.toJson(response));
  }

  async getConsIdsForGroup(groupId) {
    let response = await this.request('/cons_group/get_cons_ids_for_group', {cons_group_id: groupId})
    return {
      consIds: response.trim().split('\n')
    }
  }

  async getDeferredResult(deferredId) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        let response = await this.makeRawRequest('/get_deferred_results', {deferred_id: deferredId}, 'GET');
        if (response.statusCode === 202)
          resolve(this.getDeferredResult(deferredId))
        else
          resolve(response.body)
      }, 1000)
    })
  }

  async getEventTypes() {
    let response = await this.request('event/get_available_types', {}, 'GET');
    // console.log(response);
    return response;
  }

  async fetchConstituent(email) {
    let response = await this.request('/cons/get_constituents_by_email', {emails: email}, 'GET');
    return JSON.parse(XMLParser.toJson(response));
  }

  async createConstituent(email) {
    let params = '<?xml version="1.0" encoding="utf-8"?><api><cons send_password="y"><cons_email><email>' + email + '</email></cons_email></cons></api>';
    let response = await this.sendXML('/cons/set_constituent_data', params, 'POST');
    return JSON.parse(XMLParser.toJson(response))
  }

  async setConstituentPassword(email, password) {
    // response will be empty if successful
    let response = await this.request('/account/set_password', {userid: email, password: password}, 'POST');    
    return 'password set';
  }

  async checkCredentials(email, password) {
    try{
      let response = await this.request('/account/check_credentials', {userid: email, password: password}, 'POST');
      console.log(response);
    }
    catch(e){
      console.log(e);
      return 'invalid username or password'
    }
    return JSON.parse(XMLParser.toJson(response))
  }

  async createEvents(cons_id, form) {
    // validations
    // Remove special characters from phone number
    let contact_phone = form['contact_phone'].replace(/\D/g,'');

    let params = {
        event_type_id: form['event_type_id'],
        creator_cons_id: cons_id,
        name: form['name'],
        description: form['description'],
        venue_name: form['venue_name'],
        venue_zip: form['venue_zip'],
        venue_city: form['venue_city'],
        venue_state_cd: form['venue_state_cd'],
        venue_addr1: form['venue_addr1'],
        venue_addr2: form['venue_addr2'],
        venue_country: form['venue_country'],
        venue_directions: form['venue_directions'],
        days: [{
            start_datetime_system: '',  // This will be defined below
            duration: form['duration_num'] * form['duration_unit'],
            capacity: form['capacity']
        }],
        local_timezone: form['start_tz'],
        attendee_volunteer_message: form['attendee_volunteer_message'],
        is_searchable: form['is_searchable'],
        public_phone: form['public_phone'],
        contact_phone: contact_phone,
        host_receive_rsvp_emails: form['host_receive_rsvp_emails'],
        rsvp_use_reminder_email: form['rsvp_use_reminder_email'],
        rsvp_reminder_hours: form['rsvp_email_reminder_hours']
    };

    if (form['start_time']['a'] == 'pm'){
      var start_hour = Number(form['start_time']['h']) + 12;
    }
    else{
      var start_hour = form['start_time']['h'];
    }

    let event_dates = JSON.parse(form['event_dates']);

    event_dates.forEach(async (newEvent) => {
      let start_time = newEvent['date'] + ' ' + start_hour + ':' + form['start_time']['i'] + ':00'
      params['days'][0]['start_datetime_system'] = start_time;
      try{
        let response = await this.request('/event/create_event', {event_api_version: 2, values: JSON.stringify(params)}, 'POST');
        if (response.validation_errors){
          console.log(response);
        }
      }
      catch(e){
        console.log(e);
      }
    });

    return 'events endpoint reached'
  }

  async makeRawRequest(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath, {params});
    let options = {
      uri: finalURL,
      method: method,
      resolveWithFullResponse: true,
      json: true
    }
    return requestPromise(options)
  }

  async makeRawXMLRequest(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath);
    let options = {
      uri: finalURL,
      method: method,
      body: params,
      resolveWithFullResponse: true
    }
    // console.log(options);
    return requestPromise(options)
  }

  async request(callPath, params, method) {
    let response = await this.makeRawRequest(callPath, params, method);
    if (response.statusCode === 202)
      return this.getDeferredResult(response.body);
    else
      return response.body;
  }

  async sendXML(callPath, params, method) {
    let response = await this.makeRawXMLRequest(callPath, params, method);
    if (response.statusCode === 202)
      return this.getDeferredResult(response.body);
    else
      return response.body;
  }
}