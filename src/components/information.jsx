// View for the device information state.
import React from 'react';
import {Link} from 'react-router';
import ipc from 'ipc';
import DeviceView from './deviceview.js';


export default class Information extends React.Component {
	constructor() {
    super();
    // Set internal state.
    this.state = {device: null, services: []};
  }

  componentDidMount() {
    // Grab the latest device state when the page renders.
    let d = ipc.sendSync('getDevice', this.props.params.index);
    let s = ipc.sendSync('getServices', this.props.params.index);
    this.setState({device: d, services: s});
  }

  render(){
    // Conditionally show device info only once it's available.
    let deviceInfo = null;
    if (this.state.device !== null) {
      deviceInfo = (
        <div className='panel panel-default'>
          <div className='panel-body'>
            <dl className='dl-horizontal'>
              <dt>Name:</dt>
              <dd>{this.state.device.name}</dd>
              <dt>MAC Address:</dt>
              <dd>{this.state.device.address}</dd>
            </dl>
          </div>
        </div>
      );
    }
    // Render main information view.
    return (
      <DeviceView header='Information' index={this.props.params.index}>
        {deviceInfo}
        <div className='page-header'>
          <h3>Services</h3>
        </div>
        {this.state.services.map(s =>
          <div key={s.uuid} className='panel panel-default'>
            <div className='panel-heading'>
              <h3 className='panel-title'>{s.name !== null ? s.name : s.uuid}</h3>
            </div>
            <div className='panel-body'>
              <dl className='dl-horizontal'>
                <dt>UUID</dt>
                <dd>{s.uuid}</dd>
                <dt>Name</dt>
                <dd>{s.name !== null ? s.name : 'Unknown'}</dd>
                <dt>Type</dt>
                <dd>{s.type !== null ? s.type : 'Unknown'}</dd>
              </dl>
            </div>
            {s.characteristics === null ? '' :
              <ul className='list-group'>
                <li className='list-group-item'>
                  <h3 className='panel-title'>Characteristics</h3>
                </li>
                {s.characteristics.map(c =>
                  <li key={c.uuid} className='list-group-item'>
                    <dl className='dl-horizontal'>
                      <dt>UUID</dt>
                      <dd>{c.uuid}</dd>
                      <dt>Name</dt>
                      <dd>{c.name !== null ? c.name : 'Unknown'}</dd>
                      <dt>Type</dt>
                      <dd>{c.type !== null ? c.type : 'Unknown'}</dd>
                      <dt>Properties</dt>
                      <dd>{c.properties.join(', ')}</dd>
                    </dl>
                  </li>
                )}
              </ul>
            }
          </div>
        )}
      </DeviceView>
    );
  }
}
