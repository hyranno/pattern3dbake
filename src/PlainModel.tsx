import type { Component } from 'solid-js';

import * as babylon from "babylonjs";
import 'babylonjs-loaders';

import * as util from 'util';

import sampleModelUrl from '../assets/sample.glb?url';

const PlainModel: Component = () => {

  let canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 512;

  let engine = new babylon.Engine(canvas, false);
  let scene = new babylon.Scene(engine);
  scene.createDefaultCameraOrLight(true, true, true);
  scene.createDefaultEnvironment();
  engine.runRenderLoop(() => {
    scene.render();
  });

  babylon.SceneLoader.ImportMesh("",
    ...util.breakUrl(sampleModelUrl), scene,
  );

  return <>
    {canvas}
  </>;
};

export default PlainModel;
