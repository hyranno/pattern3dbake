import type { Component } from 'solid-js';

import * as babylon from "babylonjs";
import 'babylonjs-loaders';

import plainVertShader from 'shaders/plain.glsl.vert';

import uvProjectionFragShader from 'shaders/projection_textures/uv.glsl.frag';
import gravelProjectionFragShader from 'shaders/projection_textures/gravel.glsl.frag';
import mossProjectionFragShader from 'shaders/projection_textures/moss.glsl.frag';

// import triplanarFragShader from 'shaders/triplanar.glsl.frag';
import triplanarHexFragShader from 'shaders/triplanar_hex.glsl.frag';


const Triplanar: Component = () => {

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
  babylon.Effect.ShadersStore["gravelPixelShader"] = `${gravelProjectionFragShader}`;
  let gravel_texture = new babylon.CustomProceduralTexture("gravelTexture", "gravel", 512, scene);
  babylon.Effect.ShadersStore["mossPixelShader"] = `${mossProjectionFragShader}`;
  let moss_texture = new babylon.CustomProceduralTexture("mossTexture", "moss", 512, scene);
  let material = new babylon.ShaderMaterial("shader", scene, {
    vertexSource: plainVertShader,
    fragmentSource: triplanarHexFragShader,
  }, {
    attributes: ["position", "normal", "uv"],
    uniforms: ["resolution", "worldViewProjection"],
  });
  material.setTexture("src", texture);
  material.setTexture("plane_x", gravel_texture);
  material.setTexture("plane_y", moss_texture);
  material.setTexture("plane_z", gravel_texture);
  texture.onGeneratedObservable.add(() => {
    if (material.isReady()) {
      mesh.material = material;
    }
  });
  gravel_texture.onGeneratedObservable.add(() => {
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

export default Triplanar;
