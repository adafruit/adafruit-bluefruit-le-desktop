// Main device view with links to various device interactions.
import React from 'react'
import {Link} from 'react-router'
import ipc from 'ipc'


export default class DeviceView extends React.Component {
  constructor() {
    super();
    // Set internal state.
    this.state = {name: null};
  }

  componentDidMount() {
    // Grab the device for this connection and set state appropriately.
    let d = ipc.sendSync('getDevice', this.props.index);
    this.setState({name: d.name});
  }

  render() {
    return (
      <div className='row'>
        <div className='col-sm-2'>
          <div className='list-group'>
            <div className='list-group-item'>
              <h6 className='list-group-item-heading'>{this.state.name}</h6>
            </div>
            <Link to='scan' className='list-group-item'>Disconnect</Link>
          </div>
          <ul className='nav nav-pills nav-stacked'>
            <li role='presentation' className={this.props.header === 'Information' ? 'active' : ''}>
              <Link to='info' params={{index: this.props.index}}>Information</Link>
            </li>
            <li role='presentation' className={this.props.header === 'UART' ? 'active' : ''}>
              <Link to='uart' params={{index: this.props.index}}>UART</Link>
            </li>
            <li role='presentation' className={this.props.header === 'Control' ? 'active' : ''}>
              <Link to='control' params={{index: this.props.index}}>Control</Link>
            </li>
            <li role='presentation' className={this.props.header === 'BNO-055' ? 'active' : ''}>
              <Link to='bno055' params={{index: this.props.index}}>BNO-055</Link>
            </li>
            <li role='presentation' className={this.props.header === 'Sensor' ? 'active' : ''}>
              <Link to='sensor' params={{index: this.props.index}}>Sensor</Link>
            </li>
          </ul>
        </div>
        <div className='col-sm-10'>
          <div className='page-header'>
            <h3>{this.props.header}</h3>
          </div>
          {this.props.children}
        </div>
      </div>
    )
  }
}
