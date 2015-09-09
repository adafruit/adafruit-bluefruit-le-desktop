// View for the device control state.
import React from 'react'
import ipc from 'ipc'
import DeviceView from './deviceview.js'


function checksum8(data) {
  // Compute 8-bit checksum of the provided string and return it.
  let checksum = 0;
  for (let i=0; i<data.length; ++i) {
    checksum += data.charCodeAt(i);
    checksum &= 0xff;
  }
  return ~checksum & 0xff;
}


export default class Control extends React.Component {
  constructor() {
    super();
    // Manually bind functions so they have proper context.
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
  }

  mouseDown(event) {
    // Use event.currentTarget.value instead of event.target.value because of
    // this react bug: https://github.com/facebook/react/issues/4288
    let command = '!B' + event.currentTarget.value + '1';
    command += String.fromCharCode(checksum8(command));
    ipc.send('uartTx', command);
  }

  mouseUp(event) {
    // Use event.currentTarget.value instead of event.target.value because of
    // this react bug: https://github.com/facebook/react/issues/4288
    let command = '!B' + event.currentTarget.value + '0';
    command += String.fromCharCode(checksum8(command));
    ipc.send('uartTx', command);
  }

  render(){
    // Render main control view.
    return (
      <DeviceView header='Control' index={this.props.params.index}>
        <div className='row'>
          <div className='col-sm-8 col-sm-offset-2'>
            <div className='row'>
              <div className='col-sm-2 col-sm-offset-2'>
                <button className='btn btn-primary' type='button' onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} value='5'>
                  <span className='glyphicon glyphicon-triangle-top'></span>
                </button>
              </div>
              <div className='col-sm-2 col-sm-offset-3'>
                <button className='btn btn-primary' type='button' onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} value='1'>1</button>
              </div>
              <div className='col-sm-2 col-sm-offset-1'>
                <button className='btn btn-primary' type='button' onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} value='2'>2</button>
              </div>
            </div>
            <div className='row'>
              <div className='col-sm-2'>
                <button className='btn btn-primary' type='button' onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} value='7'>
                  <span className='glyphicon glyphicon-triangle-left'></span>
                </button>
              </div>
              <div className='col-sm-2 col-sm-offset-2'>
                <button className='btn btn-primary' type='button' onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} value='8'>
                  <span className='glyphicon glyphicon-triangle-right'></span>
                </button>
              </div>
            </div>
            <div className='row'>
              <div className='col-sm-2 col-sm-offset-2'>
                <button className='btn btn-primary' type='button' onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} value='6'>
                  <span className='glyphicon glyphicon-triangle-bottom'></span>
                </button>
              </div>
              <div className='col-sm-2 col-sm-offset-3'>
                <button className='btn btn-primary' type='button' onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} value='3'>3</button>
              </div>
              <div className='col-sm-2 col-sm-offset-1'>
                <button className='btn btn-primary' type='button' onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} value='4'>4</button>
              </div>
            </div>
          </div>
        </div>
      </DeviceView>
    );
  }
}
