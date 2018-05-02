import React, { Component } from 'react';
import { withState } from 'recompose';

class Test extends Component {
  render() {
    return (
      <div>
        This is test
      </div>
    )
  }
}

//@HMR
export default withState()(Test);
