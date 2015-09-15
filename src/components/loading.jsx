// Loading screen view, warns when no BLE adapter is available.
import React from 'react';
import remote from 'remote';
import router from '../app.js';
import SingleColumnView from './singlecolumnview.js';


export default class Loading extends React.Component {
  componentDidMount() {
    // Start with error message hidden.
    $('#load-error').hide();
    // Check if noble is powered on and redirect to scanning.
    let noble = remote.require('noble');
    if (noble.state === 'poweredOn') {
      router.transitionTo('scan');
    }
    // Otherwise set a 5 second timer to display if noble still hasn't powered on.
    setTimeout(function() {
      $('#load-error').show();
    }, 5000);
  }

  render() {
    return (
      <SingleColumnView header='Loading...'>
        <div id='load-error'>
          <h4>Bluetooth adapter has not powered on!</h4>
          <p>Check the following to resolve the issue:</p>
          <ul>
            <li>On Windows make sure you're using a CSR8510 USB Bluetooth 4.0
            adapter.  You must also make sure the adapter has been changed to use
            the WinUSB driver using Zadig tool.  See the instructions at:
            http://www.github.com/adafruit/</li>
            <li>On Mac OSX make sure your hardware support Bluetooth LE/4.0, and
            Bluetooth is enabled.</li>
            <li>On Linux make sure you are running as a root user with sudo, that
            you have a Bluetooth LE/4.0 adapter, and have bluez installed.  Also
            ensure noble is using the right Bluetooth adapter by setting the
            appropriate environment variable. See tips at: http://www.github.com/adafruit/</li>
          </ul>
        </div>
      </SingleColumnView>
    );
  }
}
