import React from 'react';
import {Paper} from 'material-ui'
import {BernieText, BernieColors} from './styles/bernie-css'
import SideBarLayout from './SideBarLayout'

export default class CallStatsBar extends React.Component {
  render() {
    let callsMade = (
      <div
        style={{
          ...BernieText.secondaryTitle,
          color: BernieColors.darkBlue,
          fontSize: '1.3rem'
        }}
      >
        Calls made: <span style={{color: BernieColors.darkRed}}>{this.props.callsMade}</span>
      </div>
    )

    let callsCompleted = (
      <div
        style={{
          ...BernieText.secondaryTitle,
          color: BernieColors.darkBlue,
          fontSize: '1.3rem',
          width: '100%',
          textAlign: 'right'
        }}
      >
        Completed: <span style={{color: BernieColors.darkRed}}>{this.props.callsCompleted}</span>
      </div>
    )
    return (
      <Paper
        zDepth={0}
        style = {{
          backgroundColor: BernieColors.lightBlue,
          borderRadius: 0
        }}
      >
        <SideBarLayout
          sideBar={callsMade}
          sideBarStyle={{
            width: '50%',
            border: 'none',
            // textAlign: 'left'
          }}
          contentViewStyle={{
            border: 'none'
          }}
          content={callsCompleted}
          containerStyle={{
            border: "none",
            padding: 15,
            marginRight: 'auto',
            marginLeft: 'auto',
            maxWidth: 600,
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
      </Paper>
    )
  }
}