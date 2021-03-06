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

const TIMEOUT = 20000;

class AudioPlayer extends Component {
  constructor(props) {
    super(props);

    this.state = { musicLoaded: false, liveInput: false, soundOn: true };

    this.toggleSound = this.toggleSound.bind(this);
    this.toggleSoundInput = this.toggleSoundInput.bind(this);
  }

  getAudioData() {
    return this.analyser ? getFrequencyData(this.analyser) : [];
  }

  toggleSound() {
    const { gain } = this.soundToggle;
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
        this.liveSource.connect(this.liveInput);
      } catch (error) {}
    }

    if (this.liveSource) {
      this.liveInput.gain.value = liveInput ? 0 : 1;
      this.musicInput.gain.value = liveInput ? 1 : 0;

      this.setState({ liveInput: !liveInput });
    }
  }

  async fetchSource() {
    const { animator, onReady } = this.props;

    try {
      this.source = await createMediaSource(Soundtrack, TIMEOUT);
      this.source.element.loop = true;
      this.source.connect(this.musicInput);

      if (animator.startTime > 0) {
        this.source.start();
      } else {
        animator.onStart(() => this.source.start());
      }

      animator.onPause(() => this.source.pause());
      animator.onResume(() => this.source.resume());
      animator.onStop(() => this.source.stop());

      this.setState({ musicLoaded: true });
      onReady();
    } catch (error) {
      onReady();
    }
  }

  componentDidMount() {
    this.musicInput = createGain();
    this.musicInput.gain.value = 1;
    this.liveInput = createGain();
    this.liveInput.gain.value = 0;
    this.soundToggle = createGain();
    this.analyser = createAnalyser();

    this.liveInput.connect(this.analyser);
    this.musicInput
      .connect(this.soundToggle)
      .connect(this.analyser)
      .connect(destination);

    this.fetchSource();
  }

  render() {
    const { musicLoaded, liveInput, soundOn } = this.state;

    return (
      <div id="audio-player">
        {musicLoaded && (
          <div id="audio-info" className={ClassNames({ show: soundOn })}>
            <span id="audio-title">
              Mirror’s Edge Soundtrack - Introduction
            </span>
            <span id="audio-author">Solar Fields</span>
          </div>
        )}
        {musicLoaded && (
          <img
            id="sound-toggle"
            src={soundOn ? Sound : Mute}
            alt="Sound"
            onClick={this.toggleSound}
          />
        )}
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
  animator: PropTypes.instanceOf(Animator),
  onReady: PropTypes.func
};

export default AudioPlayer;
