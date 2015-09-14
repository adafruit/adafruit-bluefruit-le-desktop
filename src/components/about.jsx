// View for the about state.
import React from 'react'
import ipc from 'ipc'
import DeviceView from './deviceview.js'
import able from '../../package.json'
import noble from 'noble/package.json'


export default class About extends React.Component {
  render(){
    // Render about view.
    // TODO: Make the links open in the default browser, not a new electron window.
    return (
      <DeviceView header='About' index={this.props.params.index}>
        <p>Adafruit Bluefruit LE Desktop v{able.version}</p>
        <p>noble version: {noble.version}</p>
        <p>Created by Tony DiCola with help from the following excellent
        open source software:</p>
        <ul>
          <li><a href='https://github.com/sandeepmistry/noble' target='_blank'>noble</a></li>
          <li><a href='https://github.com/atom/electron' target='_blank'>Electron</a></li>
          <li><a href='https://github.com/facebook/react' target='_blank'>React</a></li>
          <li><a href='https://github.com/rackt/react-router' target='_blank'>React-Router</a></li>
          <li><a href='http://threejs.org/' target='_blank'>three.js</a></li>
          <li><a href='http://getbootstrap.com/' target='_blank'>Bootstrap</a></li>
          <li><a href='https://bootswatch.com/' target='_blank'>Bootswatch Cyborg theme</a></li>
          <li><a href='https://jquery.com/' target='_blank'>jQuery</a></li>
        </ul>
        <p>Copyright (c) 2015 Adafruit Industries</p>
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
      </DeviceView>
    );
  }
}
