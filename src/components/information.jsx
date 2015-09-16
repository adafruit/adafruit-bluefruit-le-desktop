// View for the device information state.
import React from 'react/addons';
import {Link} from 'react-router';
import ipc from 'ipc';
import DeviceView from './deviceview.js';


export default class Information extends React.Component {
  constructor() {
    super();
    // Set internal state.
    this.state = {device: null, services: []};
    // Bind functions that will be used to update rendering state.
    this.charUpdated = this.charUpdated.bind(this);
  }

  componentDidMount() {
    // Grab the latest device state when the page renders.
    let d = ipc.sendSync('getDevice', this.props.params.index);
    let s = ipc.sendSync('getServices', this.props.params.index);
    this.setState({device: d, services: s});
    // Setup services updated event to receive service/characteristic changes.
    ipc.on('charUpdated', this.charUpdated);
  }

  componentWillUnmount() {
    // Be careful to make sure state changes aren't triggered by turning off listeners.
    ipc.removeListener('charUpdated', this.charUpdated);
  }

  charUpdated(serviceId, charId, value) {
    // Characteristic value was updated.  Update the service state to have the
    // new characteristic value.
    // This uses the react addon update function to mutate the state.  The syntax
    // is a little funky because it needs to set object properties based on the
    // serviceId and charId values so it has to use the object [] syntax.  See
    // more details of the react update call here:
    //   https://facebook.github.io/react/docs/update.html
    // At a high level this is finding the characteristic inside its parent service
    // and updating the characteristics's charValue attribute.
    let serviceUpdate = {};
    serviceUpdate[serviceId] = { characteristics: {}};
    serviceUpdate[serviceId].characteristics[charId] = {$merge: {charValue: value}};
    this.setState(React.addons.update(this.state, {
      services: serviceUpdate
    }));
  }

  readChar(serviceId, charId) {
    // Read a characteristic value when its read button is clicked.  Will trigger
    // a charUpdated event with the new characteristic value.
    //ipc.send('readChar', event.target.dataset.serviceid, event.target.dataset.charid);
    ipc.send('readChar', serviceId, charId);
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
        {this.state.services.map((s,serviceId) =>
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
                {s.characteristics.map((c, charId) =>
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
                      {c.properties.indexOf('read') === -1 ? '' :
                        <div>
                          <dt>Value</dt>
                          <dd>
                              {c.charValue !== undefined ? c.charValue : 'Unknown'}
                              &nbsp;<button type='button' className='btn btn-default btn-xs' onClick={this.readChar.bind(this, serviceId, charId)}>Read</button>
                          </dd>
                        </div>
                      }
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
