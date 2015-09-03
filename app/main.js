var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var noble = require('noble');

// Report crashes to our server.
//require('crash-reporter').start();


// Global state:
var devices = [];             // List of known devices.
var selectedIndex = null;     // Currently selected/connected device index.
var selectedDevice = null;    // Currently selected device.
var uartRx = null;            // Connected device UART RX char.
var uartTx = null;            // Connected device UART TX char.


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

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('quit', function() {
  // Make sure device is disconnected before exiting.
  disconnect();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 800});

  // ipc.on sets up an event handler so the renderer process (the webpage's
  // javascript) can 'call' functions in this main process.  These events are
  // defined below:
  ipc.on('startScan', function() {
    // Start scanning for new BLE devices.
    // First clear out any known and selected devices.
    devices = [];
    disconnect();
    // Start scanning if already powered up.
    if (noble.state === 'poweredOn') {
      console.log('Starting scan... ');
      noble.startScanning();
    }
    // Otherwise wait until powered on and then start scan.
    else {
      console.log('Waiting to power on to start scan...');
      noble.on('stateChange', function(state) {
        if (state === 'poweredOn') {
          console.log('Starting scan...');
          noble.startScanning();
        }
      });
    }
  });

  ipc.on('stopScan', function() {
    // Stop scanning for devices.
    console.log('Stopping scan...');
    noble.stopScanning();
  });

  ipc.on('getDevice', function(event, index) {
    // Retrieve the selected device by index.
    var device = devices[index];
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
    var device = devices[index];
    var services = device.services.map(function(s) {
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
    console.log('Device connect to index ' + index + '...');
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
    if (uartTx !== null) {
      console.log('Send: ' + data);
      uartTx.write(new Buffer(data));
      //TODO: Allow configurable addition of \r\n.
    }
  });

  noble.on('discover', function(device) {
    // Noble found a device.  Add it to the list of known devices and then send
    // an event to notify the renderer process of the current device state.
    devices.push(device);
    mainWindow.webContents.send('devicesChanged', devices.map(serializeDevice));
  });

  // Start in the scanning mode.
  mainWindow.loadUrl('file://' + __dirname + '/app.html#scan');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
