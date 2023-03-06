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
  {
    gravel_texture.setVector2("scale", new babylon.Vector2(10.0, 10.0));
    gravel_texture.setVector3("base_color", new babylon.Vector3(0.20, 0.20, 0.22));
    gravel_texture.setVector3("edge_color", new babylon.Vector3(0.09, 0.08, 0.06));
    gravel_texture.setVector3("position_randomness", new babylon.Vector3(0.07, 0.07, 0.18));
    gravel_texture.setVector3("color_randomness", new babylon.Vector3(0.02, 0.01, 0.04));
    gravel_texture.setFloat("edge_width", 0.2);
    gravel_texture.setFloat("edge_smoothness", 0.4);
  }
  babylon.Effect.ShadersStore["mossPixelShader"] = `${mossProjectionFragShader}`;
  let moss_texture = new babylon.CustomProceduralTexture("mossTexture", "moss", 512, scene);
  {
    moss_texture.setVector2("scale", new babylon.Vector2(20.0, 200.0));
    moss_texture.setVector3("base_color", new babylon.Vector3(0.08, 0.20, 0.08));
    moss_texture.setVector3("top_color", new babylon.Vector3(0.60, 0.80, 0.20));
    moss_texture.setInt("fBM_depth", 4);
    moss_texture.setFloat("fBM_decay", 0.4);
    moss_texture.setFloat("strength", 4.0);
    moss_texture.setFloat("sharpness", 0.3);
  }
  let material = new babylon.ShaderMaterial("shader", scene, {
    vertexSource: plainVertShader,
    fragmentSource: triplanarHexFragShader,
  }, {
    attributes: ["position", "normal", "uv"],
    uniforms: ["resolution", "worldViewProjection"],
  });
  {
    material.setTexture("src", texture);
    material.setTexture("plane_x", gravel_texture);
    material.setTexture("plane_y", moss_texture);
    material.setTexture("plane_z", gravel_texture);
    material.setFloat("scale", 10.0);
    material.setFloat("mix_ratio", 1.0);
    material.setFloat("sharpness", 9.0);
    material.setFloat("randomness", 0.05);
    material.setFloat("tile_scale", 0.8);
    material.setFloat("tile_sharpness", 9.0);
  }
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
