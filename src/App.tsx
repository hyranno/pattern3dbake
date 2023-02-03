import type { Component } from 'solid-js';

import styles from './App.module.css';

import * as babylon from "babylonjs";

import viewVertShader from 'view.glsl.vert?raw';
import plainFragShader from 'plain.glsl.frag?raw';

const App: Component = () => {
  let canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 512;
  let engine = new babylon.Engine(canvas, true);
  let scene = new babylon.Scene(engine);
  scene.createDefaultCameraOrLight(true, true, true);
  scene.createDefaultEnvironment();
  engine.runRenderLoop(() => {
    scene.render();
  });

  let material = new babylon.ShaderMaterial("shader", scene, {
    vertexSource: viewVertShader,
    fragmentSource: plainFragShader,
  }, {
    attributes: ["position", "normal", "uv"],
    uniforms: ["worldViewProjection", "resolution"]
  });

  const boxSize = 0.3;
  const box = babylon.MeshBuilder.CreateBox("box", { size: boxSize });
  box.position.addInPlaceFromFloats(0, boxSize / 2.0, 0);
  box.material = material;

  return (
    <div class={styles.App}>
      {canvas}
    </div>
  );
};

export default App;
