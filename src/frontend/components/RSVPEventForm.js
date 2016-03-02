import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import CreateCallAssignment from '../mutations/CreateCallAssignment'
import yup from 'yup'
import MutationHandler from './MutationHandler'

export default class RSVPEventForm extends React.Component {

  surveyProcessors = {
    'bsd-event-rsvper': 'Create event RSVPs.'
  }

  formSchema = yup.object({
    email: yup.string().required(),
    zip: yup.string().required(),
    phone: yup.string()
  })

  render() {
    return (
      <div
        style={{
          margin: '30px'
        }}
      >
        <h1 style={BernieText.title}>RSVP to Event</h1>
        <GCForm
          schema={this.formSchema}
          onSubmit={(formValue) => {
            console.log(submit)
          }}
        >
          <Form.Field
            name='email'
            label="Email Address"
          /><br />
          <Form.Field
            name='zip'
            label='Zip Code'
          /><br />
          <Form.Field
            name='phone'
            label="Phone Number"
          /><br /><br />

        <Form.Button type='submit' label='RSVP to Event' fullWidth={true} />
        </GCForm>
      </div>
    )
  }
}
