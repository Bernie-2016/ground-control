import Mailgun from 'mailgun-js'
import {EmailTemplate} from 'email-templates'
import Handlebars from 'handlebars'
import path from 'path'
import fs from 'fs'
import Minilog from 'minilog'

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

const senderAddress = 'Team Bernie<info@berniesanders.com>'
const inDevEnv = (process.env.NODE_ENV === 'development')

export default class MG {
  constructor(apiKey, domain) {
    this.mailgun = Mailgun({apiKey: apiKey, domain: domain})
  }

  async send(message, debugging) {
    clientLogger.info("Sending email via Mailgun", message)

    if (inDevEnv || debugging) {
      return message
    } else {
      return await this.mailgun.messages().send(message)
    }
  }

  async sendEventConfirmation(form, constituent, event_types, debugging) {
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
    event_types.forEach((type) => {
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
      user: constituent
    }

    let eventConfirmation = new EmailTemplate(templateDir + '/event-create-confirmation')
    let content = await eventConfirmation.render(data)

    let message = {
      from: senderAddress,
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      text: content.text,
      html: content.html
    }

    return await this.send(message, debugging)
  }

  async sendPhoneBankConfirmation(form, constituent, debugging) {
    constituent.cons_email.forEach((email) => {
      if (email.is_primary === '1') {
        constituent['email'] = email.email
      }
    })

    let data = {
      event: form,
      user: constituent
    }

    let template = new EmailTemplate(templateDir + '/event-create-confirmation')
    let content = await template.render(data)

    let message = {
      from: senderAddress,
      'h:Reply-To': 'help@berniesanders.com',
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      text: content.text,
      html: content.html
    }

    return await this.send(message, debugging)
  }

  async sendAdminEventInvite(data, debugging) {
    let template = new EmailTemplate(templateDir + '/admin-event-invitation')
    let content = await template.render(data)

    let message = {
      from: data.senderAddress,
      'h:Reply-To': data.hostAddress,
      to: data.recipientAddress,
      subject: 'Fwd: HELP! I need more people to come to my phonebank',
      text: content.text
    }

    return await this.send(message, debugging)
  }
}
