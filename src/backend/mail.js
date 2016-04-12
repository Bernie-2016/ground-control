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
import moment from 'moment'
import rp from 'request-promise'

const templateDir = path.resolve(__dirname, './email-templates')
const partials = [
  {
    name: 'header',
    path: '/header.hbs'
  },
  {
    name: 'footer',
    path: '/footer.hbs'
  },
  {
    name: 'loginInstructions',
    path: '/login-instructions.hbs'
  },
  {
    name: 'eventPreview',
    path: '/event-preview.hbs'
  }
]
const regeisterTemplatePartials = (templates) => {
  templates.forEach((template) => {
    Handlebars.registerPartial(template.name, fs.readFileSync(templateDir + template.path, {encoding: 'utf-8'}))
  })
}

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

regeisterTemplatePartials(partials)

// const messageRichTextTemplate = new EmailTemplate(templateDir + '/message.hbs')
const messageRichTextTemplate = Handlebars.compile(fs.readFileSync(templateDir + '/message.hbs', {encoding: 'utf-8'}));
const senderAddress = 'Team Bernie<info@berniesanders.com>'
const inDevEnv = (process.env.NODE_ENV === 'development')
const publicEventsRootUrl = process.env.PUBLIC_EVENTS_ROOT_URL

export default class MG {
  constructor(apiKey, domain) {
    this.mailgun = Mailgun({apiKey: apiKey, domain: domain})
  }

  async send(message, textOptions={wordwrap: 100}, addHeaderFooter=true) {
    // Add plaintext version of message if it does not exist
    if (!message.text){
      message.text = htmlToText.fromString(message.html, textOptions)
    };

    // Add header and footer to html messages
    if (message.html && addHeaderFooter){
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
    let templateName = 'event-create-confirmation'

    // Send organizer notification
    if (data.event.event_type_id == 32 && data.event.is_official !== '1'){
      templateName = 'canvass-create-confirmation'

      // Fetch organizer data
      const result = await rp('https://sheetsu.com/apis/bd810a50')
      const organizerArray = JSON.parse(result).result
      const organizers = organizerArray.filter((organizer) => (organizer.State === data.event.venue_state_cd))

      if (organizers.length > 0){
        data.organizers = organizers
        await this.sendCanvassCreationNotification(data)
      }
    }

    data.user.name = (data.user.name) ? data.user.name.split(' ')[0] : data.event.cons_name.split(' ')[0]
    data.user.name = data.user.name || 'there'

    let eventConfirmation = new EmailTemplate(templateDir + '/' + templateName)
    let content = await eventConfirmation.render(data)

    const message = {
      from: senderAddress,
      to: form.cons_email,
      subject: 'Event Creation Confirmation',
      html: content.html
    }

    return await this.send(message)
  }

  async sendCanvassCreationNotification({event, eventIds, user, organizers}) {
    const organizerName = (organizers.length > 1) ? 'Field Organizers' : organizers[0].Name.split(' ')[0]

    user.name = user.name || event.cons_name
    user.phone = user.phone || event.contact_phone
    let notificationEmail = new EmailTemplate(templateDir + '/canvass-field-organizer-notification')
    let content = await notificationEmail.render({event, eventIds, host: user, organizerName})

    const message = {
      from: 'Lynn Hua<lynnhua@berniesanders.com>',
      to: organizers.map((organizer) => organizer.Email),
      subject: 'ACTION NEEDED: New canvass event created',
      html: content.html
    }

    return await this.send(message, {wordwrap: 100}, false)
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
        subject: 'IMPORTANT: Next steps for hosting your phone bank'
      },
      'carpool to an early primary state' : {
        template: 'carpool-instructions',
        senderAddress: 'Team Bernie<info@berniesanders.com>',
        subject: 'IMPORTANT: Next steps for your carpool'
      },
      'default' : {
        template: 'generic-event-instructions',
        senderAddress,
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
      callAssignmentId: toGlobalId('CallAssignment', event.turn_out_assignment),
      sender: eventTypeData.sender,
      eventURL: `${publicEventsRootUrl}${event.event_id_obfuscated}`
    }
    let template = new EmailTemplate(`${templateDir}/${eventTypeData.template}`)
    let content = await template.render(data)
    let message = {
      from: eventTypeData.senderAddress,
      'h:Reply-To': 'info@berniesanders.com',
      to: event.email,
      subject: eventTypeData.subject,
      html: content.html
    }

    return await this.send(message)
  }

  async sendAdminEventInvite(data) {

    data.senderMessageHtml = data.senderMessage.replace(/\n{2,}/g, "</p><p style=\"font-family: Arial; font-size: 17px; line-height: 140%;\">").replace(/\n{1}/, "<br />").replace(/^/, "<p style=\"font-family: Arial; font-size: 17px; line-height: 140%;\">").replace(/$/, "</p>")
    data.hostMessageHtml = data.hostMessage.replace(/\n{2,}/g, "</p><p style=\"font-family: Arial; font-size: 17px; line-height: 140%;\">").replace(/\n{1}/, "<br />").replace(/^/, "<p style=\"font-family: Arial; font-size: 17px; line-height: 140%;\">").replace(/$/, "</p>")

    let template = new EmailTemplate(templateDir + '/admin-event-invitation')
    let content = await template.render(data)

    let message = {
      from: 'Team Bernie <' + data.senderAddress + '>',
      'h:Reply-To': 'info@berniesanders.com',
      to: data.recipientAddress,
      subject: 'Fwd: ' + data.hostEmailSubject,
      text: content.text
    }

    return await this.send(message)
  }

  async sendEventDeletionNotification(data) {
    let message = {
      from: senderAddress,
      to: data.recipient,
      subject: `Event Deletion Notice`,
      text: data.message
    }

    return await this.send(message)
  }

  async sendFastFwdInstructions(eventId) {

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

    let name = event.firstname ? event.firstname : "Bernie Volunteer"

    let data = {
      hostFirstName: name,
      fastFwdURL: 'https://organize.berniesanders.com/event/' +
                      event.event_id_obfuscated
                      + '/request_email',
      eventDate: moment(event.event_start_dt).format('dddd, MMMM Do'),
      eventDay: moment(event.event_start_dt).format('dddd'),
      recipientAddress: event.email
    }

    let template = new EmailTemplate(templateDir + '/send-fast-fwd-instructions')
    let content = await template.render(data)

    let message = {
      from: 'Team Bernie<info@berniesanders.com>',
      'h:Reply-To': 'info@berniesanders.com',
      to: event.email,
      subject: 'Find volunteers in your area for your upcoming event!',
      text: content.text,
      html: content.html
    }

    return await this.send(message)

  }

}
