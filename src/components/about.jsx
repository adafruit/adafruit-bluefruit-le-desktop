// View for the about state.
import React from 'react';
import ipc from 'ipc';
import able from '../../package.json';
import noble from 'noble/package.json';


export default class About extends React.Component {
  constructor() {
    super();
  }

  render(){
    // Render about view.
    // TODO: Make the links open in the default browser.  Right now there are
    // major issues with opening in an external borwser with electron 0.30.4
    // and Linux.  When these are resolved make the list below into real links.
    return (
      <div className='modal fade' id='about-modal' tabIndex='-1' role='dialog'>
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <button type='button' className='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
              <h4 className='modal-title'>About</h4>
            </div>
            <div className='modal-body'>
              <p>Adafruit Bluefruit LE Desktop v{able.version}</p>
              <p>noble version: {noble.version}</p>
              <p>Created by Tony DiCola with help from the following excellent
              open source software:</p>
              <ul>
                <li>noble - http://github.com/sandeepmistry/noble</li>
                <li>Electron - http://github.com/atom/electron</li>
                <li>React - http://github.com/facebook/react</li>
                <li>React-Router - http://github.com/rackt/react-router</li>
                <li>three.js - http://threejs.org/</li>
                <li>Bootstrap - http://getbootstrap.com/</li>
                <li>Bootswatch Cyborg theme - http://bootswatch.com/</li>
                <li>jQuery - http://jquery.com/</li>
              </ul>
              <p>Copyright &copy; 2015 Adafruit Industries</p>
              <p>Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files (the "Software"), to deal
                in the Software without restriction, including without limitation the rights
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is
                furnished to do so, subject to the following conditions:</p>
              <p>The above copyright notice and this permission notice shall be included in all
                copies or substantial portions of the Software.</p>
              <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                SOFTWARE.</p>
              <p>See the included LICENSE file for a complete list of dependencies
                and their licenses.</p>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-default' data-dismiss='modal'>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
