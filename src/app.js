import React, { Component } from "react";
import ClassNames from "classnames";
import { isReady } from "jw-audio";

import Soundsphere from "./soundsphere";

import "./app.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.onReady = this.onReady.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = { ready: false, interacted: false };
  }

  onReady() {
    this.setState({ ready: true });
  }

  onClick() {
    if (this.state.ready) {
      setTimeout(() => {
        if (isReady()) {
          this.soundsphere.start();
          this.setState({ interacted: true });
        }
      });
    }
  }

  render() {
    const { ready, interacted } = this.state;

    return (
      <div id="app">
        <Soundsphere ref={s => (this.soundsphere = s)} onReady={this.onReady} />
        <div id="start-overlay" className={ClassNames({ interacted })}>
          <div id="start-button" onClick={this.onClick}>
            {ready ? "Start" : "Loading..."}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
