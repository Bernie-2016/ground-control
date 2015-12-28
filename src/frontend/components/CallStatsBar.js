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
          fontSize: '1.3rem'
        }}
      >
        Calls completed: <span style={{color: BernieColors.darkRed}}>{this.props.callsCompleted}</span>
      </div>
    )
    return (
      <Paper
        zDepth={0}
        style = {{
          backgroundColor: BernieColors.lightBlue,
        }}
      >
        <SideBarLayout
          sideBar={callsMade}
          sideBarStyle={{
            width: 400,
            border: 'none'
          }}
          contentViewStyle={{
            border: 'none'
          }}
          content={callsCompleted}
          containerStyle={{
            border: "none",
            padding: '10px 10px 10px 10px',
            marginRight: 'auto',
            marginLeft: 'auto',
            width: 720
          }}
        />
      </Paper>
    )
  }
}