import Mailgun from 'mailgun-js';
import {EmailTemplate} from 'email-templates';
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';
const templateDir = path.resolve(__dirname, './email-templates');
const headerHTML = fs.readFileSync(templateDir + '/header.hbs', {encoding: 'utf-8'});
const footerHTML = fs.readFileSync(templateDir + '/footer.hbs', {encoding: 'utf-8'});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});
Handlebars.registerPartial('header', headerHTML);
Handlebars.registerPartial('footer', footerHTML);

const senderAddress = 'Team Bernie<info@berniesanders.com>';

export default class MG {
  constructor(apiKey, domain) {
    this.mailgun = Mailgun({apiKey: apiKey, domain: domain});
  }

  async sendEventConfirmation(form, constituent, event_types, debugging) {

    if (form.capacity=='0'){form.capacity = 'unlimited'};
    
    // Sort event dates by date
    if (typeof form.event_dates == 'string'){
      form.event_dates = JSON.parse(form.event_dates);
    };
    form.event_dates.sort((a, b) => {
        return a.date.localeCompare(b.date);
    });

    // Get the event type name
    event_types.forEach((type) => {
      if (type.event_type_id == form.event_type_id){
        form.event_type_name = type.name;
      }
    });

    constituent.cons_email.forEach((email) => {
      if (email.is_primary == '1'){
        constituent['email'] = email.email;
      }
    });

    let data = {
      event: form,
      user: constituent
    }

    let eventConfirmation = new EmailTemplate(templateDir + '/event-create-confirmation');
    let content = await eventConfirmation.render(data);

    let message = {
      from: senderAddress,
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      text: content.text,
      html: content.html
    };

    if (debugging){
      return message;
    }
    else{
      let response = await this.mailgun.messages().send(message);
      return response;
    }
  }

  async sendPasswordReset(user, debugging) {

    let data = {
      user: user
    }

    let template = new EmailTemplate(templateDir + '/password-reset');
    let content = await template.render(data);

    let message = {
      from: senderAddress,
      'h:Reply-To': 'help@berniesanders.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: content.text,
      html: content.html
    };

    if (debugging){
      return message;
    }

    else{
      let response = await this.mailgun.messages().send(message);
      return response;
    }
  }

  async sendPhoneBankConfirmation(form, constituent, debugging) {

    constituent.cons_email.forEach((email) => {
      if (email.is_primary == '1'){
        constituent['email'] = email.email;
      }
    });

    let data = {
      event: form,
      user: constituent
    }

    let template = new EmailTemplate(templateDir + '/phone-bank-instructions');
    let content = await template.render(data);

    let message = {
      from: senderAddress,
      'h:Reply-To': 'help@berniesanders.com',
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      text: content.text,
      html: content.html
    };

    if (debugging){
      return message;
    }
    else{
      let response = await this.mailgun.messages().send(message);
      return response;
    }
  }
}
