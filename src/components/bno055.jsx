// View for the device UART state.
import React from 'react';
import ipc from 'ipc';
import DeviceView from './deviceview.js';


// Useful conversion functions.
function degToRad(deg) {
  // Convert degrees to radians.
  return deg * Math.PI / 180.0;
}

function radToDeg(radians) {
  // Convert radians to degrees.
  return radians * 180.0 / Math.PI;
}


// Global state that never changes.
let sceneWidth = 640;
let sceneHeight = 480;
let objMTLLoader = new THREE.OBJMTLLoader();
let stlLoader = new THREE.STLLoader();
let material = { color: 0xffffff };  // White material for the models.
// List of models and how to load them.
// Each model should have a name attribute and load function.  The load function
// takes in a model object and should add a node attribute that is a three.js
// scene node to represent the model.
let modelList = [
  {
    name: 'Bunny',
    load: function(model) {
      objMTLLoader.load('assets/bunny.obj','assets/bunny.mtl',
        function(object) {
          let geom = object.children[1].geometry;
          // Rebuild geometry normals because they aren't loaded properly.
          geom.computeFaceNormals();
          geom.computeVertexNormals();
          // Build bunny mesh from geometry and material.
          model.node = new THREE.Mesh(geom, new THREE.MeshPhongMaterial(material));
          // Move the bunny so it's roughly in the center of the screen.
          model.node.position.y = -4;
        }
      );
    }
  },
  {
    name: 'Cat Statue',
    load: function(model) {
      stlLoader.load('assets/cat-top.stl',
        function(geometry) {
          // Regenerate normals because they aren't loaded properly.
          geometry.computeFaceNormals();
          geometry.computeVertexNormals();
          // Load the model and build mesh.
          model.node = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(material));
          // Rotate, scale, and move so the cat is facing out the screen.
          model.node.rotation.x = -90 * (Math.PI / 180.0);
          model.node.scale.set(0.15, 0.15, 0.15);
          model.node.position.y = -4;
        }
      );
    }
  },
  {
    name: 'XYZ Axes',
    load: function(model) {
      // Build some cylinders and rotate them to form a cross of the XYZ axes.
      let modelMaterial = new THREE.MeshPhongMaterial(material);
      model.node = new THREE.Group();
      let xAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7, 32, 32),
                                 modelMaterial);
      xAxis.rotation.z = 90.0*(Math.PI/180.0);
      model.node.add(xAxis);
      let yAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7, 32, 32),
                                 modelMaterial);
      model.node.add(yAxis);
      let zAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7, 32, 32),
                                 modelMaterial);
      zAxis.rotation.x = 90.0*(Math.PI/180.0);
      model.node.add(zAxis);
    }
  }
];


// Main BNO055 react component/view.
export default class BNO055 extends React.Component {
  constructor() {
    super();
    // Set initial state.
    this.state = {
      bnoData: {
        quatX: 1,
        quatY: 1,
        quatZ: 1,
        quatW: 1,
        roll: 1,
        pitch: 1,
        heading: 1,
        calSys: 1,
        calAccel: 1,
        calGyro: 1,
        calMag: 1
      }
    };
    // Bind functions that need to access state.
    this.renderScene = this.renderScene.bind(this);
    this.setupScene = this.setupScene.bind(this);
    this.straighten = this.straighten.bind(this);
    this.modelChange = this.modelChange.bind(this);
    this.uartRx = this.uartRx.bind(this);
  }

  straighten() {
    // Re-orient the 3D model so it's facing forward based on the current
    // BNO sensor orientation.
    let currentQuat = new THREE.Quaternion(this.state.bnoData.quatX,
      this.state.bnoData.quatY, this.state.bnoData.quatZ, this.state.bnoData.quatW);
    this.offset.quaternion.copy(currentQuat.conjugate());
  }

  modelChange(event) {
    // Change the selected 3D model.
    // Remove the old model.
    this.orientation.remove(this.currentModel);
    // Update the current model and add it to the scene.
    this.currentModel = this.models[event.target.value].node;
    this.orientation.add(this.currentModel);
  }

  uartRx(data) {
    // Read BNO055 readings from the BLE UART.
    // Add the received data to the buffer.
    if (data === null) {
      return;
    }
    this.buffer += data;
    // Look for a newline in the buffer that signals a complete reading.
    let newLine = this.buffer.indexOf('\n');
    if (newLine === -1) {
      // New line not found, stop processing until more data is received.
      return;
    }
    // Found a new line, pull it out of the buffer.
    let line = this.buffer.slice(0, newLine);
    this.buffer = this.buffer.slice(newLine+1);
    // Now parse the components from the reading.
    let components = line.split(',');
    if (components.length != 5) {
      // Didn't get 5 components, something is wrong.
      return;
    }
    let w = Number(components[0]);
    let y = Number(components[1]);
    let x = Number(components[2]);
    let z = Number(components[3]);
    if (components[4].length < 4) {
      // Couldn't parse the calibration status, something is wrong.
      return;
    }
    let sys = Number(components[4][0]);
    let gyro = Number(components[4][1]);
    let accel = Number(components[4][2]);
    let mag = Number(components[4][3]);
    // Now convert quaternion orientation to euler angles to get roll, pitch, heading.
    // This is only used in the display of the orientation.  The actual model rotation
    // uses quaternions.
    let quat = new THREE.Quaternion(x, y, z, w);
    let euler = new THREE.Euler();
    euler.setFromQuaternion(quat);
    // Update the BNO sensor state.
    this.setState({bnoData: {
        quatX: x,
        quatY: y,
        quatZ: z,
        quatW: w,
        roll: radToDeg(euler.x),
        pitch: radToDeg(euler.y),
        heading: radToDeg(euler.z),
        calSys: sys,
        calAccel: accel,
        calGyro: gyro,
        calMag: mag
    }});
  }

  renderScene() {
    // Main rendering function.
    // Stop if the renderer was destroyed (i.e. the view is shutting down).
    if (this.renderer === null) {
      return;
    }
    // Kick off continual rendering of frames.
    window.requestAnimationFrame(this.renderScene);
    // Switch to the first model once it's loaded.
    if (this.currentModel === null) {
      if (this.models[0].hasOwnProperty('node')) {
        this.currentModel = this.models[0].node;
        this.orientation.add(this.currentModel);
      }
    }
    // Update the orientation with the last BNO sensor reading quaternion.
    if (this.state.bnoData !== null) {
      this.orientation.quaternion.set(this.state.bnoData.quatX, this.state.bnoData.quatY,
        this.state.bnoData.quatZ, this.state.bnoData.quatW);
    }
    this.renderer.render(this.scene, this.camera);
  }

  setupScene() {
    // Setup Three.js scene and camera.
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.1, 1000);
    // Start with the camera moved back a bit to look directly at the origin.
    this.camera.position.z = 10;

    // Setup Three.js WebGL renderer and add it to the page.
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(sceneWidth, sceneHeight);
    this.renderer.setClearColor(0x000000, 0);
    $('#renderer').append(this.renderer.domElement);
    $('#renderer canvas').addClass('center-block');  // Center the renderer.

    // Setup 3 point lighting with a red and blue point light in upper left
    // and right corners, plus a bit of backlight from the rear forward.
    let pointLight1 = new THREE.PointLight(0xffbbbb, 0.6);
    pointLight1.position.set(40, 15, 40);
    this.scene.add(pointLight1);
    let pointLight2 = new THREE.PointLight(0xbbbbff, 0.6);
    pointLight2.position.set(-40, 15, 40);
    this.scene.add(pointLight2);
    let backLight = new THREE.DirectionalLight(0xffff, 0.3);
    backLight.position.set(0, -0.25, -1);
    this.scene.add(backLight);

    // Create a couple groups to apply rotations to the 3D model at different
    // stages.  The outer group called offset is set to the reverse rotation
    // of the current BNO orientation when the 'Straighten' button is clicked.
    // This will force the model to center itself staring directly out of
    // the screen.  The inner group called orientation will be rotated with
    // the current BNO sensor orientation and cause the model to rotate.
    this.offset = new THREE.Group();
    this.orientation = new THREE.Group();
    this.offset.add(this.orientation);
    this.scene.add(this.offset);

    // Load all the 3D models.  This needs to be done every time the scene is
    // setup because three.js can't share models, materials, etc. between
    // renderer instances.
    this.models = modelList.map(function(m) {
      // Create an object to hold the loaded model, then kick off the model loading.
      let model = {};
      m.load(model);
      return model;
    });

    // Clear out the currently selected model, will default back to the bunny
    // when rendered (and the model finishes loading).
    this.currentModel = null;
  }

  componentDidMount() {
    // Setup scene and start rendering.
    this.setupScene();
    this.renderScene();
    // Setup UART received event to decode BNO055 readings.
    this.buffer = '';
    ipc.on('uartRx', this.uartRx);
  }

  componentWillUnmount() {
    // Be careful to make sure state changes aren't triggered by turning off listeners.
    ipc.removeListener('uartRx', this.uartRx);
    // Stop rendering and remove the renderer and other state.
    this.renderer = null;
    $('#renderer').empty();
    this.scene = null;
    this.camera = null;
    this.orientation = null;
    this.offset = null;
    this.buffer = '';
    this.models = null;
    this.currentModel = null;
  }

  render() {
    // Render main BNO055 view.
    return (
      <DeviceView header='BNO-055' index={this.props.params.index}>
        <p>Receive BNO-055 absolute orientation sensor readings over BLE and use them to rotate a 3D model.
        Use the ndof_bno055 example in the Bluefruit LE Arduino library to send readings to this page.</p>
        <div className='row'>
          <div className='col-sm-12'>
            <div id='renderer'></div>
          </div>
        </div>
        <div className='row' id='controls'>
          <div className='col-sm-4'>
            <h5>Orientation (degrees):</h5>
            <h6>Heading = {this.state.bnoData.heading.toFixed(2)}</h6>
            <h6>Roll = {this.state.bnoData.roll.toFixed(2)}</h6>
            <h6>Pitch = {this.state.bnoData.pitch.toFixed(2)}</h6>
          </div>
          <div className='col-sm-4'>
            <h5>Calibration:</h5>
            <h6>(0=uncalibrated, 3=fully calibrated)</h6>
            <h6>System = {this.state.bnoData.calSys}</h6>
            <h6>Gyro = {this.state.bnoData.calGyro}</h6>
            <h6>Accelerometer = {this.state.bnoData.calAccel}</h6>
            <h6>Magnetometer = {this.state.bnoData.calMag}</h6>
          </div>
          <div className='col-sm-4'>
            <h5>Actions:</h5>
            <form>
              <div className='form-group'>
                <label htmlFor='model'>Model:</label>
                <select className='form-control' onChange={this.modelChange}>
                  {modelList.map((m, index) =>
                    <option value={index} key={index}>{m.name}</option>
                  )}
                </select>
              </div>
              <div className='form-group'>
                <button type='button' className='btn btn-primary' onClick={this.straighten}>Straighten</button>
              </div>
            </form>
          </div>
        </div>
      </DeviceView>
    );
  }
}
