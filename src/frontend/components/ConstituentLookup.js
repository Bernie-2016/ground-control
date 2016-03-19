import React from 'react'
import Relay from 'react-relay'
import {Styles, Divider, RaisedButton, Card, CardHeader, CardText, FontIcon} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import {BernieTheme} from './styles/bernie-theme'
import {BernieText, BernieColors} from './styles/bernie-css'
import {states} from './data/states'

const style = {
  marginLeft: 20,
}

class ConstituentLookup extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }

    window.addEventListener('resize', this._handleResize)
  }

  _handleResize = (e) => {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    })
  }

  renderSearchResults() {
    const people = this.props.listContainer.people.edges

    if (people.length === 0)
      return (
        <div style={{
          textAlign: 'center',
          position: 'relative',
          top: '200px',
          fontFamily: BernieTheme.fontFamily,
          color: BernieTheme.palette.accent3Color
        }} ><h2>No Results</h2></div>
      )
    return people.map((person) => {
      person = person.node
      const location = (person.address) ? `${person.address.city} ${person.address.state}` : ''
      return (
        <Card key={person.id}>
          <CardHeader
            title={`${person.firstName || ''} ${person.middleName || ''} ${person.lastName || ''}`}
            subtitle={(location) ? `${location} - ${person.email}` : person.email}
            avatar={
              <FontIcon
                className="material-icons"
                style={{fontSize: '2em'}}
              >account_circle</FontIcon>
            }
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            Phone: {person.phone}
            <br />
            {(person.address) ? `Zip Code: ${person.address.zip}` : ''}
          </CardText>
        </Card>
      )
    })
  }

  render() {
    const searchFormSchema = yup.object({
      firstname: yup.string().default(this.props.relay.variables.personFilters.firstname),
      middlename: yup.string().default(this.props.relay.variables.personFilters.middlename),
      lastname: yup.string().default(this.props.relay.variables.personFilters.lastname),
      email: yup.string().default(this.props.relay.variables.personFilters.email),
      phone: yup.string().default(this.props.relay.variables.personFilters.phone),
      zip: yup.string().default(this.props.relay.variables.personFilters.zip)
    })

    return (
      <div style={{height: this.state.windowHeight - 56, top: 56, position: 'absolute', overflow: 'scroll'}}>
        <div
          style={{
            width: this.state.windowWidth * 0.4 - 40,
            margin: 20,
            position: 'fixed',
            top: 40
          }}
        >
          <GCForm
            ref="form"
            schema={searchFormSchema}
            defaultValue={searchFormSchema.default()}
            value = {this.model}
            onChange = {model => {
               this.setState({model})
            }}
            onSubmit={(data) => {
              Object.keys(data).forEach((key) => {
                if (!data[key])
                  delete data[key]
              })
              this.props.relay.setVariables({personFilters: data})
            }}
          >
            <h1 style={{
              ...BernieText.title,
              marginTop: '0.5em',
              marginBottom: 0
            }}>Search for Constituents</h1>

            <Form.Field
              name='firstname'
              label='First Name'
              fullWidth={true}
            />
            <Form.Field
              name='middlename'
              label='Middle Name'
              fullWidth={true}
            />
            <Form.Field
              name='lastname'
              label='Last Name'
              fullWidth={true}
            />
            <Form.Field
              name='email'
              label='Email Address'
              fullWidth={true}
            />
            <Form.Field
              name='phone'
              label='Phone Number'
              fullWidth={true}
            />
            <Form.Field
              name='zip'
              label='Zip Code'
              fullWidth={true}
            />

            <br /><br />
            <Form.Button ref="submit" type='submit' label='Search' fullWidth={true} />
          </GCForm>
        </div>
        <div style={{marginLeft: this.state.windowWidth * 0.4, width: this.state.windowWidth * 0.6}}>
          {this.renderSearchResults()}
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(ConstituentLookup, {
  initialVariables: {
    personFilters: {},
    sortField: 'lastname',
    sortDirection: 'ASC',
    numPeople: 20
  },
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        people(
          first: $numPeople
          personFilters: $personFilters
          sortField: $sortField
          sortDirection: $sortDirection
        ) {
          edges {
            cursor
            node {
              id
              firstName
              middleName
              lastName
              phone
              email
              address {
                city
                state
                zip
              }
            }
          }
        }
      }
    `
  }
})