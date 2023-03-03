import type { Component } from 'solid-js';

import * as babylon from "babylonjs";
import 'babylonjs-loaders';

import plainVertShader from 'shaders/plain.glsl.vert';

import uvProjectionFragShader from 'shaders/projection_textures/uv.glsl.frag';
import mossProjectionFragShader from 'shaders/projection_textures/moss.glsl.frag';

import TiledAddFragShader from 'shaders/tiled_add.glsl.frag';


const TiledAdd: Component = () => {

  let canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  let engine = new babylon.Engine(canvas, true);
  let scene = new babylon.Scene(engine);
  scene.createDefaultCameraOrLight(true, true, true);
  scene.createDefaultEnvironment();
  let mesh = babylon.MeshBuilder.CreateSphere("sphere", {}, scene);

  babylon.Effect.ShadersStore["uvPixelShader"] = `${uvProjectionFragShader}`;
  let texture = new babylon.CustomProceduralTexture("uvTexture", "uv", 256, scene);
  babylon.Effect.ShadersStore["mossPixelShader"] = `${mossProjectionFragShader}`;
  let moss_texture = new babylon.CustomProceduralTexture("mossTexture", "moss", 512, scene);
  let material = new babylon.ShaderMaterial("shader", scene, {
    vertexSource: plainVertShader,
    fragmentSource: TiledAddFragShader,
  }, {
    attributes: ["position", "normal", "uv"],
    uniforms: ["resolution", "worldViewProjection"],
  });
  material.setTexture("src", texture);
  material.setTexture("tile", moss_texture);
  texture.onGeneratedObservable.add(() => {
    if (material.isReady()) {
      mesh.material = material;
    }
  });
  moss_texture.onGeneratedObservable.add(() => {
    if (material.isReady()) {
      mesh.material = material;
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  return <>
    {canvas}
  </>;
};

export default TiledAdd;
