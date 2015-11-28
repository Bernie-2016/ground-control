import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'
import {BernieText, BernieColors} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';
import CallAssignmentList from './CallAssignmentList';
import CallAssignment from './CallAssignment';
import TopNav from './TopNav';
import Signup from './Signup';

class CallAssignmentsViewer extends React.Component {
  styles = {
    container: {
      paddingLeft: 40,
      paddingTop: 40,
      paddingRight: 40,
      paddingBottom: 40,
    },
    paragraph: {
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      paddingLeft: '0.5em',
      paddingRight: '0.5em',
    },
    introContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    introTextContainer: {
      flex: 1,
      marginRight: 40
    },
    signupForm: {
      flex: 'auto',
      width: '12em'
    },
  }

  renderLoggedOut() {
    return (
      <div style={this.styles.container} >
        <div style={this.styles.introContainer}>
          <div style={this.styles.introTextContainer}>
            <div style={{
              ...BernieText.secondaryTitle,
              display: 'block'
            }}>
              Make Calls
            </div>
            <div style={BernieText.title}>
              Let them hear you loud and clear
            </div>
            <div style={BernieText.default}>
              <p style={this.styles.paragraph}>
                Get riled up get riled up get riled up get riled up.
                </p>
                <p style={this.styles.paragraph}>
                  Are you riled yet?  Get riled up a bit more.
                </p>
                <p style={this.styles.paragraph}>
                  Ok calm down now.
                </p>
                <p style={this.styles.paragraph}>
                  Thanks for all you do,
                </p>
                <img src='https://s.bsd.net/bernie16/main/page/-/Email%20Images/sig-red.png' width='170' alt='Bernie' />
            </div>
          </div>
          <div styles={this.styles.signupForm}>
            <Signup />
          </div>
        </div>
      </div>
    )
  }

  renderLoggedIn() {
    let sideBar = (
      <div>
        <CallAssignmentList
          callAssignmentList={this.props.listContainer.callAssignmentList}
          subheader="Active Assignments"
          onSelect={(id) => this.props.history.pushState(null, '/call-assignments/' + id)}
        />
      </div>
    )

    let content = (
      <div>
        <div style={BernieText.title}>
          Let them hear you loud and clear.
        </div>
        <div style={BernieText.default}>
          Getting Bernie's message out is the single most important action you can take. Here are some instructions to help you get started and words of encouragement.  Click an assignment from the side bar to get started.  Also here are some links to webinars, phonebank codes, and everything else that we have on our website.
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
  render() {
    if (this.props.currentUser)
      return this.renderLoggedIn();
    else
      return this.renderLoggedOut();
  }
}

export default Relay.createContainer(CallAssignmentsViewer, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on Person {
        callAssignmentList(first:50) {
          ${CallAssignmentList.getFragment('callAssignmentList')}
        }
      }
    `,
  },
});