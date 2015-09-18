// Status bar that displays a string of status text and animated progress bar.
import React from 'react';


export default class StatusBar extends React.Component {
  constructor() {
    super();
    this.state = {status: '', progress: 0};
    this.setStatus = this.setStatus.bind(this);
    this.setProgress = this.setProgress.bind(this);
  }

  setStatus(status) {
    this.setState({status: status});
  }

  setProgress(progress) {
    this.setState({progress: progress});
  }

  render() {
    return (
      <div>
        <h4>{this.props.prefix !== null ? this.props.prefix : ''} {this.state.status}</h4>
        <div className='progress'>
          <div className='progress-bar progress-bar-striped active' role='progressbar'
               aria-valuenow={this.state.progress} aria-valuemin='0' aria-valuemax='100'
               style={{width:  this.state.progress + '%'}}>
          </div>
        </div>
      </div>
    )
  }
}
