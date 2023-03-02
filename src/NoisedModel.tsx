import type { Component } from 'solid-js';

import * as babylon from "babylonjs";
import 'babylonjs-loaders';

import * as util from 'util';

import sampleModelUrl from '../assets/sample.glb?url';

import textureVertShader from 'shaders/texture.glsl.vert';
import plainFragShader from 'shaders/plain.glsl.frag';
import uvFragShader from 'shaders/uv.glsl.frag';
import voronoiFragShader from 'shaders/voronoi.glsl.frag';
import voronoiTiledFragShader from 'shaders/voronoi_tiled.glsl.frag';
import valueNoiseFragShader from 'shaders/value_noise.glsl.frag';
import simplexNoiseFragShader from 'shaders/simplex_noise.glsl.frag';
import fbmNoiseFragShader from 'shaders/fbm_noise.glsl.frag';


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


const NoisedModel: Component = () => {

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
    (meshes) => {
      let mesh = meshes[12];
      let baseTexture = (mesh.material! as babylon.PBRMaterial).albedoTexture!;
      let material = new babylon.ShaderMaterial("shader", scene, {
        vertexSource: textureVertShader,
        fragmentSource: simplexNoiseFragShader,
      }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["resolution"],
      });
      material.setTexture("src", baseTexture);
      material.cullBackFaces = false;
      material.depthFunction = babylon.Constants.ALWAYS;
      let preview_plane = babylon.MeshBuilder.CreatePlane("plane", {}, scene);
      preview_plane.material = new babylon.StandardMaterial("preview", scene);
      generateTexture(
        scene, mesh as babylon.Mesh, material, (texture: babylon.RenderTargetTexture)=>{
          (mesh.material! as babylon.PBRMaterial).albedoTexture = texture;
          (preview_plane.material! as babylon.StandardMaterial).ambientTexture = texture;
        },
        baseTexture
      );
    },
  );

  return <>
    {canvas}
  </>;
};

export default NoisedModel;
