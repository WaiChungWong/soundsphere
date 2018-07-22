import React, { Component } from "react";
import ClassNames from "classnames";
import { isReady } from "jw-audio";

import Soundsphere from "./soundsphere";

import "./app.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.onStart = this.onStart.bind(this);
    this.state = { interacted: false };
  }

  onStart() {
    setTimeout(() => {
      if (isReady()) {
        this.soundsphere.start();
        this.setState({ interacted: true });
      }
    });
  }

  render() {
    const { interacted } = this.state;

    return (
      <div id="app">
        <Soundsphere ref={s => (this.soundsphere = s)} />
        <div id="start-overlay" className={ClassNames({ interacted })}>
          <div id="start-button" onClick={this.onStart}>
            Start
          </div>
        </div>
      </div>
    );
  }
}

export default App;
