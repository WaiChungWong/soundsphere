import React, { Component } from "react";
import {
  Scene,
  PerspectiveCamera,
  Group,
  Matrix4,
  BoxGeometry,
  MeshNormalMaterial,
  Mesh
} from "three";

import Animator from "jw-animator";
import ThreeCanvas from "jw-three-canvas";
import CanvasASCII from "jw-canvas-ascii";

import AudioPlayer from "./audioplayer";

import "./style.css";

const BAR_COUNT = 255;
const Matrix = new Matrix4();
const isTouchDevice =
  "ontouchstart" in window ||
  navigator.MaxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

class Soundsphere extends Component {
  constructor(props) {
    super(props);

    this.animator = new Animator();

    this.animate = this.animate.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onDO = this.onDO.bind(this);
    this.onDM = this.onDM.bind(this);
    this.onMO = this.onMO.bind(this);

    this.scene = new Scene();

    this.camera = new PerspectiveCamera(50, 1, 1, 1000);
    this.camera.position.z = 600;
    this.scene.add(this.camera);

    this.group = new Group();
    this.scene.add(this.group);
    this.meshes = [];

    for (let i = 0; i < BAR_COUNT; i++) {
      let x = 0;
      let y = Math.random() * 2 - 1;
      let z = -(i / BAR_COUNT) * Math.PI * 2;

      let geometry = new BoxGeometry(50, 10, 10);
      geometry.applyMatrix(Matrix.makeTranslation(25, 5, 5));

      let mesh = new Mesh(geometry, new MeshNormalMaterial());
      mesh.position.set(0, 0, 0);
      mesh.rotation.set(x, y, z);
      mesh.scale.set(1, 1, 1);
      this.group.add(mesh);

      this.meshes.push(mesh);
    }

    this.rotationX = 0;
    this.rotationY = 0;
  }

  animate(width, height, timeDiff) {
    const { group, rotationX, rotationY, audio, ascii } = this;

    group.rotation.x += (rotationX - group.rotation.x) * timeDiff * 4;
    group.rotation.y += (rotationY - group.rotation.y) * timeDiff * 4;

    let data = audio.getAudioData();

    if (data.length >= BAR_COUNT) {
      for (var i = 0; i < BAR_COUNT; i++) {
        this.meshes[i].scale.x = Math.max(1, data[i] / 50);
      }
    }

    ascii.update();
  }

  onResize() {
    this.ascii.update();
  }

  onMouseMove(event) {
    this.rotationX = (event.clientY - window.innerHeight / 2) * 0.001;
    this.rotationY = (event.clientX - window.innerWidth / 2) * 0.001;
  }

  onMouseOut() {
    this.rotationX = 0;
    this.rotationY = 0;
  }

  onDO({ beta, gamma }) {
    this.tilt({ x: beta, y: gamma });
  }

  onDM({ accelerationIncludingGravity: e }) {
    this.tilt({ x: e.x * 2, y: e.y * 2 });
  }

  onMO({ x, y }) {
    this.tilt({ x: x * 50, y: y * 50 });
  }

  tilt({ x, y }) {
    this.rotationX = x * 0.02;
    this.rotationY = y * 0.02;
  }

  start() {
    this.animator.start();
  }

  componentDidMount() {
    const { canvas, ascii } = this;

    canvas.renderer.setClearColor(0xffffff);

    ascii.setCanvas(canvas.canvas);

    if (isTouchDevice) {
      if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", this.onDO, true);
      } else if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", this.onDM, true);
      } else {
        window.addEventListener("MozOrientation", this.onMO, true);
      }
    } else {
      document.addEventListener("mousemove", this.onMouseMove, false);
      document.addEventListener("mouseout", this.onMouseOut, false);
    }
  }

  componentWillUnmount() {
    const { animator } = this;

    if (isTouchDevice) {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", this.onDO);
      } else if (window.DeviceMotionEvent) {
        window.removeEventListener("devicemotion", this.onDM);
      } else {
        window.removeEventListener("MozOrientation", this.onMO);
      }
    } else {
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseout", this.onMouseOut);
    }

    animator.stop();
  }

  render() {
    const { animator, scene, camera } = this;

    return (
      <div id="soundsphere">
        <div id="canvas-wrapper" ref={w => (this.wrapper = w)}>
          <ThreeCanvas
            id="canvas"
            ref={c => (this.canvas = c)}
            scene={scene}
            camera={camera}
            animator={animator}
            animate={this.animate}
          />
          <CanvasASCII id="canvas-ascii" ref={a => (this.ascii = a)} />
        </div>
        <AudioPlayer ref={a => (this.audio = a)} animator={animator} />
      </div>
    );
  }
}

export default Soundsphere;
