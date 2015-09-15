// Main application code.  The entry point for the application is here.
// In general this app code will open the appropriate 'page' (#-path for react
// router) and let react control most of the application logic.  For any
// interaction with noble/BLE hardware the page will make IPC calls to this
// functions that this app code exposes.  The main program state of which
// device is connected, which devices have been discovered, etc. lives in this
// code.
import app from 'app';
import BrowserWindow from 'browser-window';
import dialog from 'dialog';
import ipc from 'ipc';
import noble from 'noble';
import os from 'os';


// Global state:
let devices = [];             // List of known devices.
let selectedIndex = null;     // Currently selected/connected device index.
let selectedDevice = null;    // Currently selected device.
let uartRx = null;            // Connected device UART RX char.
let uartTx = null;            // Connected device UART TX char.
let mainWindow = null;        // Main rendering window.


function runningAsRoot() {
  // Check if the user is running as root on a POSIX platform (Linux/OSX).
  // Returns true if it can be determined the user is running as root, otherwise
  // false.
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    return process.getuid() === 0;
  }
  else {
    return false;
  }
}

function serializeDevice(device, index) {
  // Prepare a Noble device for serialization to send to a renderer process.
  // Copies out all the attributes the renderer might need.  Seems to be
  // necessary as Noble's objects don't serialize well and lose attributes when
  // pass around with the ipc class.
  return {
    id: device.id,
    name: device.advertisement.localName,
    address: device.address,
    index: index
  };
}

function disconnect() {
  // Disconnect from any selected device.
  if (selectedDevice !== null) {
    selectedDevice.disconnect();
    selectedDevice = null;
    selectedIndex = null;
  }
}

app.on('window-all-closed', function() {
  // Quit when all windows are closed.
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q.
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('quit', function() {
  // Make sure device is disconnected before exiting.
  disconnect();
});


app.on('ready', function() {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.

  // Check running as root on Linux (usually required for noble).
  if (os.platform() === 'linux' && !runningAsRoot()) {
    // Throw an error dialog when not running as root.
    dialog.showErrorBox('Adafruit Bluefruit LE', 'WARNING: This program should be run as a root user with sudo!');
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 800});

  // Disable the default menu.
  mainWindow.setMenu(null);

  // ipc.on sets up an event handler so the renderer process (the webpage's
  // javascript) can 'call' functions in this main process.  These events are
  // defined below:
  ipc.on('startScan', function() {
    // Start scanning for new BLE devices.
    // First clear out any known and selected devices.
    devices = [];
    disconnect();
    // Start scanning only if already powered up.
    if (noble.state === 'poweredOn') {
      console.log('Starting scan... ');
      noble.startScanning();
    }
    // // Otherwise wait until powered on and then start scan.
    // else {
    //   console.log('Waiting to power on to start scan...');
    //   noble.on('stateChange', function(state) {
    //     if (state === 'poweredOn') {
    //       console.log('Starting scan...');
    //       noble.startScanning();
    //     }
    //   });
    // }
  });

  ipc.on('stopScan', function() {
    // Stop scanning for devices.
    console.log('Stopping scan...');
    noble.stopScanning();
  });

  ipc.on('getDevice', function(event, index) {
    // Retrieve the selected device by index.
    let device = devices[index];
    event.returnValue = serializeDevice(device, index);
  });

  ipc.on('getServices', function(event, index) {
    // Retrieve list of all services and characteristics for a device with
    // the specified index.  This will be an array of service objects where each
    // one looks like:
    //  { uuid: <service uuid, either short or long>,
    //    name: <friendly service name, if known>,
    //    type: <service type, if known>
    //    characteristics: [<list of characteristics (see below)>] }
    //
    // For each service its characteristics attribute will be a list of
    // characteristic objects that look like:
    //  { uuid: <char uuid>,
    //    name: <char name, if known>
    //    type: <char type, if known>
    //    properties: [<list of properties for the char>]
    //  }
    let device = devices[index];
    let services = device.services.map(function(s) {
      return {
        uuid: s.uuid,
        name: s.name,
        type: s.type,
        characteristics: s.characteristics.map(function(c) {
          return {
            uuid: c.uuid,
            name: c.name,
            type: c.type,
            properties: c.properties,
            descriptors: []
          }
        })
      };
    });
    event.returnValue = services;
  });

  ipc.on('deviceConnect', function(event, index) {
    // Start connecting to device at the specified index.
    // First get the selected device and save it for future reference.
    selectedIndex = index;
    selectedDevice = devices[index];
    // Stop scanning and kick off connection to the device.
    noble.stopScanning();
    mainWindow.webContents.send('connectStatus', 'Status: Connecting...', 33);
    selectedDevice.connect(function(error) {
      // Handle if there was an error connecting, just update the state and log
      // the full error.
      if (error) {
        console.log('Error connecting: ' + error);
        mainWindow.webContents.send('connectStatus', 'Status: Error!', 0);
        return;
      }
      // When disconnected fall back to the scanning page.
      selectedDevice.on('disconnect', function() {
        // Keep selected device consistent by clearing it when disconnected.
        selectedDevice = null;
        selectedIndex = null;
        mainWindow.loadUrl('file://' + __dirname + '/../app.html#scan');
      });
      // Connected, now kick off service discovery.
      mainWindow.webContents.send('connectStatus', 'Status: Discovering Services...', 66);
      selectedDevice.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
        // Handle if there was an error.
        if (error) {
          console.log('Error discovering: ' + error);
          mainWindow.webContents.send('connectStatus', 'Status: Error!', 0);
          return;
        }
        // Service discovery complete, connection is ready to use!
        // Note that setting progress to 100 will cause the page to change to
        // the information page.
        mainWindow.webContents.send('connectStatus', 'Status: Connected!', 100);
        // Find UART characteristics if they exist.
        characteristics.forEach(function(ch) {
          //log('Char: ' + characteristics[i]);
          if (ch.uuid === '6e400002b5a3f393e0a9e50e24dcca9e') {
            uartTx = ch;
          }
          else if (ch.uuid === '6e400003b5a3f393e0a9e50e24dcca9e') {
            uartRx = ch;
            uartRx.on('data', function(data) {
              //console.log('Received: ' + data);
              if (mainWindow !== null) {
                mainWindow.webContents.send('uartRx', String(data));
              }
            });
            uartRx.notify(true);
          }
        });
      });
    })
  });

  ipc.on('uartTx', function(event, data) {
    // Data is sent from the renderer process out the BLE UART (if connected).
    if (uartTx !== null) {
      console.log('Send: ' + data);
      uartTx.write(new Buffer(data));
    }
  });

  noble.on('discover', function(device) {
    // Noble found a device.  Add it to the list of known devices and then send
    // an event to notify the renderer process of the current device state.
    devices.push(device);
    mainWindow.webContents.send('devicesChanged', devices.map(serializeDevice));
  });

  // Start in the scanning mode if powered on, otherwise start in loading
  // mode and wait to power on before scanning.
  if (noble.state === 'poweredOn') {
    mainWindow.loadUrl('file://' + __dirname + '/../app.html#scan');
  }
  else {
    mainWindow.loadUrl('file://' + __dirname + '/../app.html#loading');
    // Jump to scanning mode when powered on.  Make sure to do this only after
    // showing the loading page or else there could be a race condition where
    // the scan finishes and the loading page is displayed.
    noble.on('stateChange', function(state) {
      if (state === 'poweredOn') {
        mainWindow.loadUrl('file://' + __dirname + '/../app.html#scan');
      }
    });
  }

  // Open dev tools if --dev parameter is passed in.
  if (process.argv.indexOf('--dev') !== -1) {
    mainWindow.openDevTools();
  }

  mainWindow.on('closed', function() {
    // Emitted when the window is closed.
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
