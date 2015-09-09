// View for the about state.
import React from 'react'
import ipc from 'ipc'
import DeviceView from './deviceview.js'


export default class About extends React.Component {
  render(){
    // Render about view.
    return (
      <DeviceView header='About' index={this.props.params.index}>
        <h5>Unimplemented!</h5>
      </DeviceView>
    );
  }
}
