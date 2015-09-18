// View for the color picker state.
import React from 'react';
import ipc from 'ipc';
import DeviceView from './deviceview.js';
import {buildCommand} from '../commands.js';


export default class Color extends React.Component {
  constructor() {
    super();
    this.state = {color: '#ff00ff'};
    // Manually bind functions to make react state available to them.
    this.send = this.send.bind(this);
    this.colorChange = this.colorChange.bind(this);
  }

  send() {
    // Parse out the current RGB color value.
    if (this.state.color === null || this.state.color.length < 7) {
      // Something is wrong with the color value, stop.
      return;
    }
    // Grab r, g, b color values and send color change command.
    let data = [parseInt(this.state.color.slice(1,3), 16),
                parseInt(this.state.color.slice(3,5), 16),
                parseInt(this.state.color.slice(5,7), 16)]
    ipc.send('uartTx', buildCommand('C', data));
  }

  colorChange(event) {
    this.setState({color: event.target.value});
  }

  render(){
    // Render color picker view.
    return (
      <DeviceView header='Color' index={this.props.params.index}>
        <p>Click the color below to open the color picker, then send to send the color to a BLE device.  
        Use the neopixel_picker example in the Bluefruit LE Arduino library to receive the color.</p>
        <div className='row'>
          <div className='col-sm-3'>
            <form>
              <div className='form-group'>
                <label htmlFor='color-picker'>Color</label>
                <input id='color-picker' type='color' className='form-control' onChange={this.colorChange} value={this.state.color}></input>
              </div>
              <button type='button' className='btn btn-primary' onClick={this.send}>Send</button>
            </form>
          </div>
        </div>
      </DeviceView>
    );
  }
}
