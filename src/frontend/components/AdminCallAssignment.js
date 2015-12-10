import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {BernieText} from './styles/bernie-css';
import {Paper, List, ListItem, RaisedButton, Dialog, TextField} from 'material-ui';
import {BernieColors} from './styles/bernie-css';
import moment from 'moment';

export class AdminCallAssignment extends React.Component {
  constructor() {
    super();
    this.setState = this.setState.bind(this);
    this.state = {
      showDeleteEventDialog: false
    };
  }

  render() {
    let standardActions = [
      { text: 'Cancel' },
      { text: 'Delete', onTouchTap: this._onDialogSubmit, ref: 'submit' }
    ];

    this._handleRequestClose = () => {
      this.setState({
        showDeleteEventDialog: false
      });
    }

    this._onDeleteClick = () => {
      this.setState({
        showDeleteEventDialog: true
      });
    }

    return (
      <div>
        <Dialog
          title="Are you sure?"
          actions={standardActions}
          actionFocus="submit"
          open={this.state.showDeleteEventDialog}
          onRequestClose={this._handleRequestClose}
        >
          <p>Type <span style={{color: BernieColors.red}}>DELETE</span> to confirm.</p>
          <TextField hintText="DELETE" underlineFocusStyle={{borderColor: BernieColors.red}} ref="deleteConfirmationInput" />
        </Dialog>
        <div style={BernieText.title}>
          {this.props.callAssignment.name}
        </div>
        <div>
          <div>
            Using survey: {this.props.callAssignment.survey.fullURL}<br/>
            Using query: {this.props.callAssignment.query}
          </div>
        </div>
        <RaisedButton
          label="Delete"
          primary={true}
          onTouchTap={this._onDeleteClick}
          />
      </div>
    );
  }
}

export default Relay.createContainer(AdminCallAssignment, {
  fragments: {
    callAssignment: () => Relay.QL`
      fragment on CallAssignment {
        id
        name
        survey {
          fullURL
        }
        query
      }
    `
  }
});