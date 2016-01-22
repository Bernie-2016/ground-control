import Mailgun from 'mailgun-js'
import {EmailTemplate} from 'email-templates'
import Handlebars from 'handlebars'
import path from 'path'
import fs from 'fs'
import Minilog from 'minilog'
import htmlToText from 'html-to-text'
import knex from './data/knex'
import {toGlobalId} from 'graphql-relay'
import log from './log'

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

    log.info("Sending email via Mailgun", message)

    message["o:tracking"] = false
    if (inDevEnv) {
      return message
    } else {
      return await this.mailgun.messages().send(message)
    }
  }

  async sendEventConfirmation(form, eventIds, constituent) {
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

  async sendEventInstructions(eventId) {
    let event = await knex('gc_bsd_events')
      .innerJoin('bsd_events', 'bsd_events.event_id', 'gc_bsd_events.event_id')
      .innerJoin('bsd_people', 'bsd_events.creator_cons_id', 'bsd_people.cons_id')
      .innerJoin('bsd_emails', 'bsd_events.creator_cons_id', 'bsd_emails.cons_id')
      .where('gc_bsd_events.event_id', eventId)

    event = event[0]
    if (event.length > 1) {
      event.forEach((e) => {
        if (e.is_primary)
          event = e;
      })
    }
    if (!event) {
      log.warn(`Not sending e-mail for event ${eventId} -- did not find a corresponding event/creator email address`)
      return
    }
    let eventType = await knex('bsd_event_types')
      .where('event_type_id', event.event_type_id)
      .first()

    let eventTypeDetails = {
      'phonebank' : {
        template: 'phone-bank-instructions',
        senderAddress: 'Liam Clive<liamclive@berniesanders.com>',
        sender: 'Liam Clive',
        subject: 'Next steps for hosting your phone bank'
      },
      'default' : {
        template: 'generic-event-instructions',
        senderAddress: 'Saikat Chakrabarti<saikat@berniesanders.com>',
        sender: 'Saikat Chakrabarti',
        subject: 'Invite nearby Bernie volunteers to your event'
      },
    }

    let name = event.firstname ? event.firstname : "Bernie Volunteer"
    let eventTypeData = eventTypeDetails['default']
    Object.keys(eventTypeDetails).forEach((key) => {
      if (eventType.name.toLowerCase().indexOf(key) !== -1)
        eventTypeData = eventTypeDetails[key]
    })

    let data = {
      volunteerName: name,
      callAssignmentId: toGlobalId('CallAssignment', event.event_id),
      sender: eventTypeData.sender
    }
    let template = new EmailTemplate(`${templateDir}/${eventTypeData.template}`)
    let content = await template.render(data)
    let message = {
      from: eventTypeData.senderAddress,
      'h:Reply-To': 'help@berniesanders.com',
      to: event.email,
      subject: eventTypeData.subject,
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
