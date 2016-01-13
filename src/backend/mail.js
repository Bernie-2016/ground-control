import Mailgun from 'mailgun-js'
import {EmailTemplate} from 'email-templates'
import Handlebars from 'handlebars'
import path from 'path'
import fs from 'fs'
import Minilog from 'minilog'
import htmlToText from 'html-to-text'

const clientLogger = Minilog('client')
const templateDir = path.resolve(__dirname, './email-templates')
const headerHTML = fs.readFileSync(templateDir + '/header.hbs', {encoding: 'utf-8'})
const footerHTML = fs.readFileSync(templateDir + '/footer.hbs', {encoding: 'utf-8'})

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this)
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this)
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this)
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this)
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this)
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this)
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this)
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this)
    default:
      return options.inverse(this)
  }
})

Handlebars.registerPartial('header', headerHTML)
Handlebars.registerPartial('footer', footerHTML)
// const messageRichTextTemplate = new EmailTemplate(templateDir + '/message.hbs')
const messageRichTextTemplate = Handlebars.compile(fs.readFileSync(templateDir + '/message.hbs', {encoding: 'utf-8'}));
const senderAddress = 'Team Bernie<info@berniesanders.com>'
const inDevEnv = (process.env.NODE_ENV === 'development')

export default class MG {
  constructor(apiKey, domain) {
    this.mailgun = Mailgun({apiKey: apiKey, domain: domain})
  }

  async send(message, textOptions={wordwrap: 100}) {
    // Add plaintext version of message if it does not exist
    if (!message.text){
      message.text = htmlToText.fromString(message.html, textOptions)
    };

    // Add header and footer to html messages
    if (message.html){
      message.html = messageRichTextTemplate({content: message.html, recipient: message.to});
    }

    clientLogger.info("Sending email via Mailgun", message)

    message["o:tracking"] = false
    if (inDevEnv) {
      return message
    } else {
      return await this.mailgun.messages().send(message)
    }
  }

  async sendEventConfirmation(form, eventIds, constituent, eventTypes) {
    if (form.capacity === '0') {
      form.capacity = 'unlimited'
    }

    // Sort event dates by date
    if (typeof form.event_dates === 'string') {
      form.event_dates = JSON.parse(form.event_dates)
    }

    form.event_dates.sort((a, b) => {
      return a.date.localeCompare(b.date)
    })

    // Get the event type name
    eventTypes.forEach((type) => {
      if (type.event_type_id == form.event_type_id) {
        form.event_type_name = type.name
      }
    })

    constituent.cons_email.forEach((email) => {
      if (email.is_primary == '1') {
        constituent['email'] = email.email
      }
    })

    let data = {
      event: form,
      eventIds,
      user: constituent
    }

    let eventConfirmation = new EmailTemplate(templateDir + '/event-create-confirmation')
    let content = await eventConfirmation.render(data)

    let message = {
      from: senderAddress,
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      html: content.html
    }

    return await this.send(message)
  }

  async sendPhoneBankConfirmation(form, eventIds, constituent) {
    constituent.cons_email.forEach((email) => {
      if (email.is_primary === '1') {
        constituent['email'] = email.email
      }
    })

    let data = {
      event: form,
      eventIds,
      user: constituent
    }

    let template = new EmailTemplate(templateDir + '/phone-bank-instructions')
    let content = await template.render(data)

    let message = {
      from: senderAddress,
      'h:Reply-To': 'help@berniesanders.com',
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      html: content.html
    }

    return await this.send(message)
  }

  async sendAdminEventInvite(data) {
    let template = new EmailTemplate(templateDir + '/admin-event-invitation')
    let content = await template.render(data)

    let message = {
      from: data.senderAddress,
      'h:Reply-To': data.hostAddress,
      to: data.recipientAddress,
      subject: 'Fwd: HELP! I need more people to come to my phonebank',
      text: content.text
    }

    return await this.send(message)
  }

  async sendEventDeletionNotification(data) {
    let message = {
      from: 'Help Desk<help@berniesanders.com>',
      to: data.recipient,
      subject: `Event Deletion Notice`,
      text: data.message
    }

    return await this.send(message)
  }
}
