import React from 'react';
import Relay from 'react-relay';
import {BernieText, BernieColors} from './styles/bernie-css'
import Radium from 'radium'
import {Paper, RaisedButton} from 'material-ui';
import SideBarLayout from './SideBarLayout';
import CallAssignmentList from './CallAssignmentList';
import CallAssignment from './CallAssignment';
import Signup from './Signup';
import CallStatsBar from './CallStatsBar';

class CallAssignmentsSection extends React.Component {
  styles = {
    container: {
      padding: '0 0 40px 0'
    },
    paragraph: {
      padding: '0.5em'
    },
  }

  renderStats() {
    return <CallStatsBar
      callsMade={this.props.currentUser.allCallsMade}
      callsCompleted={this.props.currentUser.completedCallsMade}
    />
  }

  render() {
    let sideBar = (
      <div>
        <CallAssignmentList
          callAssignments={this.props.currentUser.callAssignments}
          subheader="Active Assignments"
          onSelect={(id) => {
            this.props.history.push('/call/' + id)
          }}
        />
      </div>
    )

    let content = (
      <div style={{width: '100%'}}>
        {this.renderStats()}
        <div style={{
          padding: 40
        }}>
          <div style={BernieText.title}>
            Let them hear you loud and clear
          </div>
          <div style={BernieText.default}>
            <p style={this.styles.paragraph}>
              On the left, you'll find a list of calling assignments that you can start with right away.  Just click one, call the number that gets shown to you, and fill out the survey.
            </p>
            <p style={this.styles.paragraph}>
              Remember that everyone you are calling are people who have signed up to help. Feel free to let them know you are a fellow volunteer -- it helps! And please be sure to follow our guidelines:
            </p>
            <ol>
              <li>Treat everyone with respect and kindness.</li>
              <li>Do not make any statements implying that you are speaking officially on behalf of the campaign.</li>
              <li>Do not give legal advice or advice on fundraising or FEC regulations.</li>
              <li>Do not speak disparagingly about other candidates, groups or volunteers during the course of these calls.</li>
            </ol>
            <p style={this.styles.paragraph}>
              Thank you and have fun!
            </p>
          </div>
        </div>
      </div>
    )

    return (
      <div>
        <SideBarLayout
          sideBar={sideBar}
          content={content}
          contentViewStyle={this.styles.container}
        />

      </div>
    )
  }
}

export default Relay.createContainer(CallAssignmentsSection, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        allCallsMade:callsMade
        completedCallsMade:callsMade(completed:true)
        callAssignments(first:50, active:true) {
          ${CallAssignmentList.getFragment('callAssignments')}
        }
      }
    `,
  },
});