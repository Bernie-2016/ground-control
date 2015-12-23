import requestPromise from 'request-promise';
import url from 'url';
import crypto from 'crypto';
import querystring from 'querystring';
import {parseString} from 'xml2js';
import Promise from 'bluebird';
import qs from 'querystring';
import log from './log';
import moment from 'moment-timezone';
import knex from './data/knex';

const parseStringPromise = Promise.promisify(parseString);

export default class BSD {
  constructor(host, id, secret) {
    this.baseURL = url.parse('http://' + host);
    this.baseURL.pathname = '/page/api/';
    this.apiId = id;
    this.apiVersion = 2;
    this.apiSecret = secret;
  }

  noFailApiRequest(method, ...args) {
    try {
      this[method](...args);
    } catch (e) {
      log.error(e);
      knex('bsd_audits').insert({
        class: 'BSDClient',
        method: method,
        params: String(args),
        error: e.message,
        modified_dt: new Date(),
        create_dt: new Date()
      })
    }
  }

  cleanField(field) {
    if (field && field.length) {
      if (field[0] && field[0] != '')
        return field[0]
      else
        return null
    }
    else
      return null
  }

  createGroupObject(group) {
    let groupObj = {};
    groupObj['cons_group_id'] = group['$']['id'];
    groupObj['modified_dt'] = group['$']['modified_dt'];

    Object.keys(group).forEach((key) => {
      groupObj[key] = this.cleanField(group[key]);
    })
    return groupObj;
  }

  createSurveyObject(survey) {
    let surveyObj = {}
    Object.keys(survey).forEach((key) => {
      surveyObj[key] = this.cleanField(survey[key])
    })
    return surveyObj;
  }

  createConstituentObject(constituent) {
    let consObj = {};
    consObj['id'] = constituent['$']['id'];
    consObj['modified_dt'] = constituent['$']['modified_dt'];

    let keys = ['firstname', 'middlename', 'lastname', 'has_account', 'is_banned', 'create_dt', 'prefix', 'suffix', 'gender', 'source', 'subsource']

    keys.forEach((key) => {
      consObj[key] = this.cleanField(constituent[key])
    })
    consObj['cons_addr'] = []
    if (constituent.cons_addr){
      constituent.cons_addr.forEach((address) => {
        let addrObj = {}
        let keys = ['addr1', 'addr2', 'city', 'state_cd', 'zip', 'country', 'latitude', 'longitude', 'is_primary', 'cons_addr_type_id', 'cons_addr_type'];
        keys.forEach((key) => {
          addrObj[key] = this.cleanField(address[key])
        })
        consObj['cons_addr'].push(addrObj)
      })
    }
    consObj['cons_phone'] = []
    if (constituent.cons_phone){
      constituent.cons_phone.forEach((phone) => {
        let phoneObj = {}
        let keys = ['phone', 'phone_type', 'is_subscribed', 'is_primary']
        keys.forEach((key) => {
          phoneObj[key] = this.cleanField(phone[key]);
        })
        consObj['cons_phone'].push(phoneObj)
      })
    }
    consObj['cons_email'] = []
    if (constituent.cons_email){
      constituent.cons_email.forEach((email) => {
        let emailObj = {}
        let keys = ['email', 'email_type', 'is_subscribed', 'is_primary']
        keys.forEach((key) => {
          emailObj[key] = this.cleanField(email[key])
        })
        consObj['cons_email'].push(emailObj)
      })
    }

    return consObj;
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
    response = await parseStringPromise(response);
    let group = response.api.cons_group;
    if (!group)
      return null;
    if (group.length && group.length > 0)
      group = group[0];

    return this.createGroupObject(group);
  }

  async getForm(formId) {
    let response = await this.request('signup/get_form', {signup_form_id: formId}, 'GET');

    response = await parseStringPromise(response);
    let survey = response.api.signup_form;
    if (!survey)
      return null;
    if (survey.length && survey.length > 0)
      survey = survey[0];

    return this.createSurveyObject(survey);
  }

  createBundleString(bundles) {
    return bundles.join(',')
  }

  async getConstituentByEmail(email) {
    let response = await this.request(
      '/cons/get_constituents_by_email',
      {
        emails: email,
        bundles: this.createBundleString(['cons_email', 'cons_addr', 'cons_phone'])
      },
      'GET'
    );

    response = await parseStringPromise(response);
    let constituent = response.api.cons;

    if (!constituent)
      return null;
    if (constituent.length && constituent.length > 0)
      constituent = constituent[0]

    return this.createConstituentObject(constituent)
  }

/*  async getConstituents(filter, bundles) {
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
    let response = await this.request('cons/get_constituents', {filter: filterString, bundles: this.createBundleString(bundles)}, 'GET');
    return JSON.parse(XMLParser.toJson(response)).map((element) => this.cleanConstituent(this.cleanOutput(element)));
  }*/

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
    return response
  }

  async createConstituent(email) {
    let params = '<?xml version="1.0" encoding="utf-8"?><api><cons><cons_email><email>' + email + '</email></cons_email></cons></api>';
    let response = await this.sendXML('/cons/set_constituent_data', params, 'POST');
    response = await parseStringPromise(response);

    let constituent = await this.getConstituentByEmail(email);

    // generate a 'random' 9-14 character alphanumeric password
    let password = randString(Math.floor(Math.random() * 6) + 9);
    constituent['password'] = password;

    // set the constituent password asynchronously
    this.setConstituentPassword(email, password);
    return constituent;

    function randString(x){
        let s = '';
        while(s.length<x&&x>0){
            let r = Math.random();
            s+= (r<0.1?Math.floor(r*100):String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65)));
        }
        return s;
    }
  }

  async setConstituentPassword(email, password) {
    // response will be empty if successful
    let response = await this.request('/account/set_password', {userid: email, password: password}, 'POST');
    return 'password set';
  }

  async checkCredentials(email, password) {
    try{
      let response = await this.request('/account/check_credentials', {userid: email, password: password}, 'POST');
    }
    catch(e){
      return 'invalid username or password'
    }
    let response = await parseStringPromise(response);
    return response
  }

  async addRSVPToEvent(email, zip, event_id) {
    let params = {
      'email' : email,
      'zip' : zip,
      'will_attend' : 1,
      'guests': 0
    }
    if (/\d+$/.test(event_id))
      params['event_id'] = event_id
    else
      params['event_id_obfuscated'] = event_id
    let host = this.baseURL.protocol + '//' + this.baseURL.host
    let URL = host + '/page/graph/addrsvp' + '?' + qs.stringify(params)

    let options = {
      uri: URL,
      method: 'GET',
      resolveWithFullResponse: true,
    }
    let response = await requestWrapper(options)
    return response
  }

  async deleteEvents(eventIdArray) {
    let promises = eventIdArray.map((event_id) => {
      return this.request('/event/delete_event', {event_id}, 'POST');
    });
    let responses = await Promise.all(promises);
    return responses;
  }

  apiInputsFromEvent(event) {
    let inputs = {}
    let eventDate = {}
    Object.keys(event).forEach((key) => {
      if (key === 'start_tz')
        inputs['local_timezone'] = event[key]
      else if (key === 'start_dt') {
        eventDate['start_datetime_system'] = moment(event['start_dt']).tz(event['start_tz']).format('YYYY-MM-DD HH:mm:ss')
      }
      else if (key === 'capacity')
        eventDate[key] = event[key]
      else if (key === 'duration')
        eventDate[key] = event[key]
      else
        inputs[key] = event[key]
    })
    if (Object.keys(eventDate).length > 0)
      inputs['days'] = [eventDate]
    return inputs
  }

  async updateEvent(event_id_obfuscated, event_type_id, creator_cons_id, updatedValues) {
    updatedValues = {
      ...updatedValues,
      ...{event_id_obfuscated, event_type_id, creator_cons_id}
    }
    let inputs = this.apiInputsFromEvent(updatedValues)
    // BSD API gets mad if we send this in
    delete inputs['event_id']
    let response = await this.request('/event/update_event', {event_api_version: 2, values: JSON.stringify(inputs)}, 'POST');
    if (response.validation_errors) {
      throw new Error(JSON.stringify(response.validation_errors));
    }
  }

  async createEvents(cons_id, form, event_types, callback) {
    let eventType = null;
    event_types.forEach((type) => {
      if (type.event_type_id == form['event_type_id']){
        eventType = type;
      }
    })

    if (eventType === null){
      callback('Event type does not exist in BSD');
      return;
    }

    // validations
    // Remove special characters from phone number
    let contact_phone = form['contact_phone'].replace(/\D/g,'');

    let params = {
        event_type_id: form['event_type_id'],
        creator_cons_id: cons_id,
        flag_approval: form['flag_approval'],
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
            duration: form['duration_num'] * form['duration_unit'],
            capacity: form['capacity']
        }],
        local_timezone: form['start_tz'],
        attendee_volunteer_message: form['attendee_volunteer_message'],
        is_searchable: (form['is_searchable']) ? form['is_searchable'] : -2, // second value should set to event type default
        public_phone: form['public_phone'],
        contact_phone: contact_phone,
        host_receive_rsvp_emails: form['host_receive_rsvp_emails'],
        rsvp_use_reminder_email: form['rsvp_use_reminder_email'],
        rsvp_reminder_hours: form['rsvp_email_reminder_hours']
    };

    // Add params if supported by event type
    if (Number(eventType.attendee_volunteer_show) == 1){
      params['attendee_volunteer_show'] = form['attendee_volunteer_show'];
    }

    let startHour = null;
    if (form['start_time']['a'] == 'pm'){
      startHour = Number(form['start_time']['h']) + 12;
    }
    else{
      startHour = form['start_time']['h'];
    }

    let eventDates = JSON.parse(form['event_dates']);

    eventDates.forEach(async (newEvent, index, array) => {
      let startTime = newEvent['date'] + ' ' + startHour + ':' + form['start_time']['i'] + ':00'
      params['days'][0]['start_datetime_system'] = startTime;
      let response = await this.request('/event/create_event', {event_api_version: 2, values: JSON.stringify(params)}, 'POST');
      if (response.validation_errors){
        callback(response.validation_errors);
      }
      else if (response.event_id_obfuscated && index == array.length - 1){
        // successfully created events
        callback('success');
      }
    });

    return
  }

  async requestWrapper(options) {
    if (process.env.NODE_ENV === 'development' && options.method === 'POST') {
      log.debug(`Would have made BSD API call with options: ${JSON.stringify(options)}`)
      return {
        statusCode: 200,
        body: {}
      }
    }
    else
      return requestPromise(options)
  }

  async makeRawRequest(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath, {params});
    let options = {
      uri: finalURL,
      method: method,
      resolveWithFullResponse: true,
      json: true
    }

    return this.requestWrapper(options)
  }

  async makeRawXMLRequest(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath);
    let options = {
      uri: finalURL,
      method: method,
      body: params,
      resolveWithFullResponse: true
    }

    return this.requestWrapper(options)
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
