// View for the device control state.
import React from 'react'
import ipc from 'ipc'
import DeviceView from './deviceview.js'


export default class Control extends React.Component {
  render(){
    // Render main control view.
    return (
      <DeviceView header='Control' index={this.props.params.index}>
        <h5>Unimplemented!</h5>
      </DeviceView>
    );
  }
}
