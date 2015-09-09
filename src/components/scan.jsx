// View for the device scanning state.
import React from 'react'
import {Link} from 'react-router'
import ipc from 'ipc'
import SingleColumnView from './singlecolumnview.js'
import StatusBar from './statusbar.js'


export default class Scan extends React.Component {
  constructor() {
    super();
    // Set initial state.
    this.state = { isScanning: false, devices: [] };
    // Manually bind functions to make react state available to them.
    this.startScan = this.startScan.bind(this);
    this.stopScan = this.stopScan.bind(this);
    this.devicesChanged = this.devicesChanged.bind(this);
  }

  devicesChanged(newDevices) {
    this.setState({devices: newDevices});
  }

  startScan() {
    this.setState({isScanning: true, devices: []});
    this.refs.statusbar.setStatus('Status: Scanning...');
    this.refs.statusbar.setProgress(100);
    ipc.send('startScan');
  }

  stopScan() {
    this.setState({isScanning: false});
    this.refs.statusbar.setStatus('Status: Stopped');
    this.refs.statusbar.setProgress(0);
    ipc.send('stopScan');
  }

  componentDidMount() {
    // Setup async events that will change state of this component.
    ipc.on('devicesChanged', this.devicesChanged);
    // Kick off the scan of new devices.
    this.startScan();
  }

  componentWillUnmount() {
    // Be careful to make sure state changes aren't triggered by turning off listeners.
    ipc.removeListener('devicesChanged', this.devicesChanged);
  }

  render(){
    return (
      <SingleColumnView header='Device Scanning'>
        <StatusBar ref='statusbar' />
        <ul className='list-inline text-right'>
          <li><button type='button' className='btn btn-primary' disabled={this.state.isScanning ? 'disabled' : ''} onClick={this.startScan}>Start</button></li>
          <li><button type='button' className='btn btn-primary' disabled={this.state.isScanning ? '' : 'disabled'} onClick={this.stopScan}>Stop</button></li>
        </ul>
        <hr/>
        <div className='panel panel-default'>
          <div className='panel-heading'>Discovered Devices</div>
          <div className='panel-body'>
            <p>Bluetooth low energy devices will be shown below as they are found.
            Click a device to connect and interact with it.</p>
          </div>
          <div className='list-group' id='device-list'>
            {this.state.devices.map(d => <Link to='connect' params={{index: d.index}} className='list-group-item' key={d.index}>{d.name} [{d.address}]</Link>)}
          </div>
        </div>
      </SingleColumnView>
    );
  }
}
