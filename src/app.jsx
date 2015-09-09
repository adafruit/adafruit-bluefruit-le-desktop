// Application route definitions.
import React from 'react'
import Router, {Route, RouteHandler} from 'react-router'
import Scan from './components/scan.js'
import Connect from './components/connect.js'
import Information from './components/information.js'
import UART from './components/uart.js'
import Control from './components/control.js'
import Color from './components/color.js'
import BNO055 from './components/bno055.js'
import About from './components/about.js'


// Define table of routes.
let routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="scan"    path="/scan"           handler={Scan}/>
    <Route name="connect" path="/connect/:index" handler={Connect}/>
  	<Route name="info"    path="/info/:index"    handler={Information}/>
  	<Route name="uart"    path="/uart/:index"    handler={UART}/>
  	<Route name="control" path="/control/:index" handler={Control}/>
    <Route name="color"   path="/color/:index"   handler={Color}/>
    <Route name="bno055"  path="/bno055/:index"  handler={BNO055}/>
  	<Route name="about"   path="/about/:index"   handler={About}/>
  </Route>
);

// Main application component, will be rendered inside app.html's body.
// Just displays the currently selected route.
class App extends React.Component {
  render () {
    return (
      <div className="container-fluid">
    		<RouteHandler/>
      </div>
    );
  }
}

// Render the application.
export default Router.run(routes, Router.HashLocation, (Root) => {
  React.render(<Root/>, document.body);
});
