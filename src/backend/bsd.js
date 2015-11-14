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

    let protocol = secure ? 'https:' : 'http:'
    let finalURL = url.parse(url.resolve(url.format(this.baseURL), callPath))
    finalURL.protocol = protocol
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

  async getConstituents(filter) {
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
    let response = await this.request('cons/get_constituents', {filter: filterString}, 'GET');
    return response;
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

  async request(callPath, params, method) {
    let response = await this.makeRawRequest(callPath, params, method);
    if (response.statusCode === 202)
      return this.getDeferredResult(response.body);
    else
      return response.body;
  }
}