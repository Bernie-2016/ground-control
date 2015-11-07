import requestPromise from 'request-promise';
import url from 'url';
import crypto from 'crypto';
import querystring from 'querystring';
import {parseString} from 'xml2js';
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
      return key + "=" + element[key]
    }).join('&');

    let signingString = [
      params['api_id'],
      params['api_ts'],
      callPath,
      unencodedQueryString
    ].join('\n');

    let encryptedMessage = crypto.createHmac("sha1", this.apiSecret);
    encryptedMessage.update(signingString);
    let apiMac = encryptedMessage.digest("hex");
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

  async getForm(formId) {
    let response = await this.request('signup/get_form', {signup_form_id: formId}, 'GET');
    let parseStringPromise = Promise.promisify(parseString)
    return parseStringPromise(response)
  }

  async request(callPath, params, method) {
    let finalURL = this.generateBSDURL(callPath, {params});
    let options = {
      uri: finalURL,
      method: method,
      json: true
    }
    return requestPromise(options);
  }
}