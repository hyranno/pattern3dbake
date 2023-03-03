import type { Component } from 'solid-js';

import * as babylon from "babylonjs";
import 'babylonjs-loaders';

import * as util from 'util';

import sampleModelUrl from '../assets/sample.glb?url';

import uvProjectionFragShader from 'shaders/uv.glsl.frag';
import textureVertShader from 'shaders/pattern3d/texture.glsl.vert';
import noiseFragShader from 'shaders/pattern3d/fbm_noise.glsl.frag';


function generateTexture(
  scene: babylon.Scene, mesh_src: babylon.Mesh, material: babylon.Material,
  callback: (texture: babylon.RenderTargetTexture) => void,
  baseTexture?: babylon.ThinTexture
): babylon.RenderTargetTexture{
  let engine = scene.getEngine();
  let scene_work = new babylon.Scene(engine);
  scene_work.skipFrustumClipping = true;

  let mesh = new babylon.Mesh("mesh", scene_work, null, mesh_src);
  mesh.material = material;

  let renderTarget = new babylon.RenderTargetTexture(
    "procedural_texture", 1024, scene
  );
  renderTarget.skipInitialClear = true;
  renderTarget.renderList!.push(mesh);

  let camera = new babylon.Camera(
    "camera_temp", new babylon.Vector3(), scene_work
  );
  camera.outputRenderTarget = renderTarget;

  let copier = new babylon.CopyTextureToTexture(engine, false);

  let render_once = () => {
    if (renderTarget.isReadyForRendering() && mesh.isReady(true) && copier.isReady()) {
      if (baseTexture != null) {
        copier.copy(baseTexture!, renderTarget);
      }
      renderTarget.render();
      callback(renderTarget);
      engine.stopRenderLoop(render_once);
      scene_work.dispose();
    }
  };
  engine.runRenderLoop(render_once);
  return renderTarget;
}


const PatternBaked: Component = () => {

  let canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;

  let engine = new babylon.Engine(canvas, false);
  let scene = new babylon.Scene(engine);
  scene.createDefaultCameraOrLight(true, true, true);
  scene.createDefaultEnvironment();
  engine.runRenderLoop(() => {
    scene.render();
  });

  let mesh = babylon.MeshBuilder.CreateSphere("sphere", {}, scene);
  mesh.material = new babylon.StandardMaterial("standard");
  // let preview_plane = babylon.MeshBuilder.CreatePlane("plane", {}, scene);
  // preview_plane.material = new babylon.StandardMaterial("preview", scene);

  babylon.Effect.ShadersStore["uvPixelShader"] = `${uvProjectionFragShader}`;
  let baseTexture = new babylon.CustomProceduralTexture("uvTexture", "uv", 256, scene);
  // let baseTexture = (mesh.material! as babylon.StandardMaterial).ambientTexture!;
  let material = new babylon.ShaderMaterial("shader", scene, {
    vertexSource: textureVertShader,
    fragmentSource: noiseFragShader,
  }, {
    attributes: ["position", "normal", "uv"],
    uniforms: ["resolution"],
  });
  material.setTexture("src", baseTexture);
  material.depthFunction = babylon.Constants.ALWAYS;
  generateTexture(
    scene, mesh as babylon.Mesh, material, (texture: babylon.RenderTargetTexture)=>{
      (mesh.material! as babylon.StandardMaterial).ambientTexture = texture;
      // (preview_plane.material! as babylon.StandardMaterial).ambientTexture = texture;
    },
    baseTexture
  );

  return <>
    {canvas}
  </>;
};

export default PatternBaked;
