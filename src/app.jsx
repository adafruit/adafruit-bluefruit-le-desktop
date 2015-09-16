// Application route definitions.
import React from 'react'
import Router, {Route, RouteHandler} from 'react-router'
import Loading from './components/loading.js'
import Scan from './components/scan.js'
import Connect from './components/connect.js'
import Information from './components/information.js'
import UART from './components/uart.js'
import Control from './components/control.js'
import Color from './components/color.js'
import BNO055 from './components/bno055.js'
import About from './components/about.js'
import able from '../package.json'


// Main application component, will be rendered inside app.html's body.
// Just displays the currently selected route.
class App extends React.Component {
  render () {
    return (
      <div>
        <nav className='navbar navbar-inverse navbar-fixed-top'>
          <div className='container-fluid'>
            <div className='navbar-header'>
              <button type='button' className='navbar-toggle collapsed' data-toggle='collapse' data-target='#navbar-elements' aria-expanded='false'>
                <span className='sr-only'>Toggle navigation</span>
                <span className='icon-bar'></span>
                <span className='icon-bar'></span>
                <span className='icon-bar'></span>
              </button>
              <span className='navbar-brand' >
                  <span><img src='assets/adafruit_logo_small.png' height='25' width='25'/></span>
                  &nbsp; Bluefruit LE
              </span>
            </div>
            <div className='collapse navbar-collapse' id='navbar-elements'>
              <ul className='nav navbar-nav navbar-right'>
                <li><a data-toggle='modal' data-target='#about-modal' style={{cursor:'pointer'}}>About</a></li>
              </ul>
            </div>
          </div>
        </nav>
        <About/>
        <div className='container-fluid'>
          <RouteHandler/>
        </div>
      </div>
    );
  }
}

// Define table of routes.
let routes = (
  <Route name='app' path='/' handler={App}>
    <Route name='loading' path='loading'        handler={Loading}/>
    <Route name='scan'    path='scan'           handler={Scan}/>
    <Route name='connect' path='connect/:index' handler={Connect}/>
  	<Route name='info'    path='info/:index'    handler={Information}/>
  	<Route name='uart'    path='uart/:index'    handler={UART}/>
  	<Route name='control' path='control/:index' handler={Control}/>
    <Route name='color'   path='color/:index'   handler={Color}/>
    <Route name='bno055'  path='bno055/:index'  handler={BNO055}/>
  </Route>
);

// Render the application.
export default Router.run(routes, Router.HashLocation, (Root) => {
  React.render(<Root/>, document.body);
});
