import React from 'react'
import Relay from 'react-relay'
import {
  Styles,
  Divider,
  RaisedButton,
  Card,
  CardTitle,
  CardText,
  FontIcon,
  RefreshIndicator,
  Table,
  TableHeaderColumn,
  TableRow,
  TableHeader,
  TableRowColumn,
  TableBody,
  TableFooter
} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import phoneFormatter from 'phone-formatter'
import {BernieTheme} from './styles/bernie-theme'
import {BernieText, BernieColors, NAVBAR_HEIGHT} from './styles/bernie-css'
import {states} from './data/states'

const style = {
  marginLeft: 20,
}

class ConstituentLookup extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      loading: false
    }

    window.addEventListener('resize', this._handleResize)
  }

  _handleResize = (e) => {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    })
  }

  renderPhoneLink = (phone) => (phone) ? <a href={`tel:${phone}`}>{phoneFormatter.format(phone, '(NNN) NNN-NNNN')}</a> : ''

  renderSearchResults() {
    const people = this.props.listContainer.people.edges
    const positioningStyle = {
      textAlign: 'center',
      position: 'relative'
    }

    if (this.state.loading) {
      return (
          <RefreshIndicator
            size={50}
            top={200}
            left={0}
            loadingColor={BernieColors.blue}
            status="loading"
            style={{...positioningStyle, margin: '0 auto'}}
          />
      )
    }
    else if (people.length === 0)
      return (
        <div style={{
          ...positioningStyle,
          top: 200,
          fontFamily: BernieTheme.fontFamily,
          color: BernieTheme.palette.accent3Color
        }} ><h2>No Results</h2></div>
      )
    return people.map((person) => {
      person = person.node
      const location = (person.address) ? <span>({person.address.city} {person.address.state})</span> : ''
      const address = person.address || {}
      return (
        <Card key={person.id}>
          <CardTitle
            actAsExpander={true}
            showExpandableButton={true}
          >
            <span style={{...BernieText.default, fontSize: '1.1em', fontWeight: 'bold'}}>{person.firstName} {person.middleName} {person.lastName} {location}</span>
            <br />
            <span style={{...BernieText.default, fontSize: '0.9em', letterSpacing: '1px'}}>{person.email}</span>
          </CardTitle>
          <CardText expandable={true}>
            <Table selectable={false} multiSelectable={false} style={{fontFamily: 'Roboto'}}>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn>Email</TableHeaderColumn>
                  <TableHeaderColumn>Phone</TableHeaderColumn>
                  <TableHeaderColumn>Address</TableHeaderColumn>
                  <TableHeaderColumn>Zip Code</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                <TableRow>
                  <TableRowColumn>
                    <a href={`mailto:${person.email}`}>{person.email}</a>
                  </TableRowColumn>
                  <TableRowColumn>{this.renderPhoneLink(person.phone)}</TableRowColumn>
                  <TableRowColumn>{address.addr1}</TableRowColumn>
                  <TableRowColumn>{address.zip}</TableRowColumn>
                </TableRow>
              </TableBody>
            </Table>
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
      <div style={{height: this.state.windowHeight - NAVBAR_HEIGHT, top: NAVBAR_HEIGHT, position: 'absolute', overflow: 'scroll'}}>
        <div
          style={{
            width: this.state.windowWidth * 0.3 - 40,
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
              this.setState({loading: true})
              Object.keys(data).forEach((key) => {
                if (!data[key])
                  delete data[key]
              })
              this.props.relay.setVariables({personFilters: data}, (readyState) => {
                if (readyState.ready) {
                  this.setState({loading: false})
                }
              })
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
        <div style={{marginLeft: this.state.windowWidth * 0.3, width: this.state.windowWidth * 0.7}}>
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
                addr1
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