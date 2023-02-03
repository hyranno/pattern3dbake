import type { Component } from 'solid-js';

import styles from './App.module.css';

import * as babylon from "babylonjs";

import textureVertShader from 'shaders/texture.glsl.vert?raw';
import plainFragShader from 'shaders/plain.glsl.frag?raw';

const App: Component = () => {

  let canvas_diffuse = document.createElement("canvas");
  canvas_diffuse.width = 512;
  canvas_diffuse.height = 512;
  let scene_diffuse = ((canvas: ConstructorParameters<typeof babylon.Engine>[0]) => {
    let engine = new babylon.Engine(canvas, true);
    let scene = new babylon.Scene(engine);
    scene.createDefaultCameraOrLight();
    let material = new babylon.ShaderMaterial("shader", scene, {
      vertexSource: textureVertShader,
      fragmentSource: plainFragShader,
    }, {
      attributes: ["position", "normal", "uv"],
      uniforms: ["worldViewProjection", "resolution"]
    });
    let boxSize = 0.3;
    let box = babylon.MeshBuilder.CreateBox("box", { size: boxSize });
    box.position.addInPlaceFromFloats(0, boxSize / 2.0, 0);
    box.material = material;
    return scene;
  })(canvas_diffuse);

  let canvas_view = document.createElement("canvas");
  {
    canvas_view.width = 768;
    canvas_view.height = 512;
    let engine = new babylon.Engine(canvas_view, true);
    let scene = new babylon.Scene(engine);
    scene.createDefaultCameraOrLight(true, true, true);
    scene.createDefaultEnvironment();
    engine.runRenderLoop(() => {
      scene.render();
    });

    let material = new babylon.StandardMaterial("material", scene);
    let diffuseTexture = new babylon.DynamicTexture("diffuse", canvas_diffuse, scene);
    scene_diffuse.executeWhenReady(() => {
      scene_diffuse.render();
      diffuseTexture.update();
    });
    material.diffuseTexture = diffuseTexture;
    const boxSize = 0.3;
    const box = babylon.MeshBuilder.CreateBox("box", { size: boxSize });
    box.position.addInPlaceFromFloats(0, boxSize / 2.0, 0);
    box.material = material;
  }

  return (
    <div class={styles.App}>
      {canvas_view}
      {canvas_diffuse}
    </div>
  );
};

export default App;
