import React, { Component } from "react";
import ClassNames from "classnames";
import PropTypes from "prop-types";

import Animator from "jw-animator";
import {
  destination,
  createLiveSource,
  createMediaSource,
  createAnalyser,
  createGain,
  getFrequencyData
} from "jw-audio";

import Sound from "../resources/sound.png";
import Mute from "../resources/mute.png";
import Microphone from "../resources/microphone.png";
import Music from "../resources/music.png";
import Soundtrack from "../resources/soundtrack.mp3";

import "./audioplayer.css";

class AudioPlayer extends Component {
  constructor(props) {
    super(props);

    this.state = { liveInput: false, soundOn: true };

    this.toggleSound = this.toggleSound.bind(this);
    this.toggleSoundInput = this.toggleSoundInput.bind(this);
  }

  getAudioData() {
    return this.analyser ? getFrequencyData(this.analyser) : [];
  }

  toggleSound() {
    const { gain } = this.gain;
    const { soundOn } = this.state;

    this.setState({ soundOn: !soundOn });

    if (soundOn) {
      gain.value = 0;
    } else {
      gain.value = 1;
    }
  }

  async toggleSoundInput() {
    const { liveInput } = this.state;

    if (!this.liveSource) {
      try {
        this.liveSource = await createLiveSource();
      } catch (error) {}
    }

    if (this.liveSource) {
      if (!liveInput) {
        this.liveSource.connect(this.analyser);
        this.source.disconnect(this.gain);
      } else {
        this.liveSource.disconnect(this.analyser);
        this.source.connect(this.gain);
      }
    }

    this.setState({ liveInput: !liveInput });
  }

  async fetchSource(timeout) {
    const { animator } = this.props;

    try {
      this.source = await createMediaSource(Soundtrack, timeout);
      this.source.element.loop = true;
      this.source.connect(this.gain);

      if (animator.startTime > 0) {
        this.source.start();
      } else {
        animator.onStart(() => this.source.start());
      }

      animator.onPause(() => this.source.pause());
      animator.onResume(() => this.source.resume());
      animator.onStop(() => this.source.stop());
    } catch (error) {
      if (timeout < 10000) {
        this.fetchSource(timeout + 1000);
      }
    }
  }

  componentDidMount() {
    this.analyser = createAnalyser();
    this.gain = createGain();
    let afterGain = createGain();
    afterGain.gain.value = 0.1;

    this.gain
      .connect(this.analyser)
      .connect(afterGain)
      .connect(destination);

    this.fetchSource(2000);
  }

  render() {
    const { liveInput, soundOn } = this.state;

    return (
      <div id="audio-player">
        <div id="audio-info" className={ClassNames({ show: soundOn })}>
          <span id="audio-title">Mirror’s Edge Soundtrack - Introduction</span>
          <span id="audio-author">Solar Fields</span>
        </div>
        <img
          id="sound-toggle"
          src={soundOn ? Sound : Mute}
          alt="Sound"
          onClick={this.toggleSound}
        />
        <img
          id="live-input-toggle"
          src={liveInput ? Music : Microphone}
          alt="Sound input"
          onClick={this.toggleSoundInput}
        />
      </div>
    );
  }
}

AudioPlayer.propTypes = {
  animator: PropTypes.instanceOf(Animator)
};

export default AudioPlayer;
