import type { Component } from 'solid-js';

import styles from './App.module.css';

import * as babylon from "babylonjs";


const App: Component = () => {
  let canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  let engine = new babylon.Engine(canvas, true);
  let scene = new babylon.Scene(engine);
  scene.createDefaultCameraOrLight(true, true, true);
  scene.createDefaultEnvironment();
  engine.runRenderLoop(() => {
    scene.render();
  });

  const boxSize = 0.3;
  const box = babylon.MeshBuilder.CreateBox("box", { size: boxSize });
  box.position.addInPlaceFromFloats(0, boxSize / 2.0, 0);

  return (
    <div class={styles.App}>
      {canvas}
    </div>
  );
};

export default App;
