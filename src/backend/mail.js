import Mailgun from 'mailgun-js';
import {EmailTemplate} from 'email-templates';
import path from 'path';
const templateDir = path.resolve(__dirname, './email-templates');

export default class MG {
  constructor(apiKey, domain) {
    this.mailgun = Mailgun({apiKey: apiKey, domain: domain});
  }

  async sendEventConfirmation(form) {
    console.log('sending email...');
    let eventConfirmation = new EmailTemplate(templateDir + '/event-create-confirmation');
    let content = await eventConfirmation.render(form);

    let message = {
      from: 'Volunteer Portal<ground-control@' + process.env.MAILGUN_DOMAIN + '>',
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      text: content.text,
      html: content.html
    };

    return message;
    
    // let response = await this.mailgun.messages().send(message);
    // return response;
  }

}