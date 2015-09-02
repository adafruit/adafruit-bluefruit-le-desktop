// View for the device sensor state.
import React from 'react'
import ipc from 'ipc'
import DeviceView from './deviceview.js'


export default class Sensor extends React.Component {
  render(){
    // Render main sensor view.
    return (
      <DeviceView header='Sensor' index={this.props.params.index}>
        <h5>Unimplemented!</h5>
      </DeviceView>
    );
  }
}
