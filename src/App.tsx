import type { Component } from 'solid-js';

import styles from './App.module.css';

import * as babylon from "babylonjs";
import 'babylonjs-loaders';
// import "babylon-vrm-loader";  // outdated?

import plainVertShader from 'shaders/plain.glsl.vert';
import textureVertShader from 'shaders/texture.glsl.vert';

import plainFragShader from 'shaders/plain.glsl.frag';
import copyFragShader from 'shaders/copy.glsl.frag';
import voronoiFragShader from 'shaders/voronoi.glsl.frag';
import voronoiTiledFragShader from 'shaders/voronoi_tiled.glsl.frag';
import valueNoiseFragShader from 'shaders/value_noise.glsl.frag';
import simplexNoiseFragShader from 'shaders/simplex_noise.glsl.frag';
import fbmNoiseFragShader from 'shaders/fbm_noise.glsl.frag';

import uvProjectionFragShader from 'shaders/projection_textures/uv.glsl.frag';
import gravelProjectionFragShader from 'shaders/projection_textures/gravel.glsl.frag';

import triplanarFragShader from 'shaders/triplanar.glsl.frag';
import triplanarHexFragShader from 'shaders/triplanar_hex.glsl.frag';


import sampleModelUrl from '../assets/sample.glb?url';

function breakUrl(url: string): [string, string] {
  let index = url.lastIndexOf('/') + 1;
  let dir = url.slice(0, index);
  let file = url.slice(index);
  return [dir, file];
}

function generateTexture(
  engine: babylon.Engine, mesh_src: babylon.Mesh, material: babylon.Material,
  callback: (texture: babylon.RenderTargetTexture) => void,
  baseTexture?: babylon.ThinTexture
): babylon.RenderTargetTexture{
  let scene = new babylon.Scene(engine);
  scene.skipFrustumClipping = true;
  // scene.autoClear = false;

  let mesh = new babylon.Mesh("mesh", scene, null, mesh_src);
  mesh.material = material;

  let renderTarget = new babylon.RenderTargetTexture(
    "procedural_texture", 1024, scene
  );
  renderTarget.skipInitialClear = true;
  renderTarget.renderList!.push(mesh);

  let camera = new babylon.Camera(
    "camera_temp", new babylon.Vector3(), scene
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
    }
  };
  engine.runRenderLoop(render_once);
  return renderTarget;
}

const App: Component = () => {

  let canvas_model_src = document.createElement("canvas");
  canvas_model_src.width = 768;
  canvas_model_src.height = 512;
  let scene_model_src = ((canvas: ConstructorParameters<typeof babylon.Engine>[0]) => {
    let engine = new babylon.Engine(canvas, false);
    let scene = new babylon.Scene(engine);
    scene.createDefaultCameraOrLight(true, true, true);
    scene.createDefaultEnvironment();
    engine.runRenderLoop(() => {
      scene.render();
    });
    return scene;
  })(canvas_model_src);
  babylon.SceneLoader.ImportMesh("",
    ...breakUrl(sampleModelUrl), scene_model_src,
  );


  let canvas_model = document.createElement("canvas");
  canvas_model.width = 768;
  canvas_model.height = 542;
  let scene_model = ((canvas: ConstructorParameters<typeof babylon.Engine>[0]) => {
    let engine = new babylon.Engine(canvas, true);
    let scene = new babylon.Scene(engine);
    scene.createDefaultCameraOrLight(true, true, true);
    scene.createDefaultEnvironment();
    engine.runRenderLoop(() => {
      scene.render();
    });
    return scene;
  })(canvas_model);

  babylon.SceneLoader.ImportMesh("",
    ...breakUrl(sampleModelUrl), scene_model,
    (meshes) => {
      let mesh = meshes[12];
      let baseTexture = (mesh.material! as babylon.PBRMaterial).albedoTexture!;
      let material = new babylon.ShaderMaterial("shader", scene_model, {
        vertexSource: textureVertShader,
        fragmentSource: voronoiTiledFragShader,
      }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["resolution"],
      });
      material.setTexture("src", baseTexture);
      material.cullBackFaces = false;
      material.depthFunction = babylon.Constants.ALWAYS;
      let preview_plane = babylon.MeshBuilder.CreatePlane("plane", {}, scene_model);
      preview_plane.material = new babylon.StandardMaterial("preview", scene_model);
      generateTexture(
        scene_model.getEngine(), mesh as babylon.Mesh, material, (texture: babylon.RenderTargetTexture)=>{
          (mesh.material! as babylon.PBRMaterial).albedoTexture = texture;
          (preview_plane.material! as babylon.StandardMaterial).ambientTexture = texture;
        },
        baseTexture
      );
    },
  );


  let canvas_triplanar = document.createElement("canvas");
  canvas_triplanar.width = 768;
  canvas_triplanar.height = 542;
  let scene_triplanar = ((canvas: ConstructorParameters<typeof babylon.Engine>[0]) => {
    let engine = new babylon.Engine(canvas, true);
    let scene = new babylon.Scene(engine);
    scene.createDefaultCameraOrLight(true, true, true);
    scene.createDefaultEnvironment();
    let mesh = babylon.MeshBuilder.CreateSphere("sphere", {}, scene);

    // babylon.Effect.ShadersStore["uvPixelShader"] = `${uvProjectionFragShader}`;
    // let texture = new babylon.CustomProceduralTexture("uvTexture", "uv", 256, scene);
    babylon.Effect.ShadersStore["gravelPixelShader"] = `${gravelProjectionFragShader}`;
    let texture = new babylon.CustomProceduralTexture("gravelTexture", "gravel", 512, scene);
    let material = new babylon.ShaderMaterial("shader", scene, {
      vertexSource: plainVertShader,
      fragmentSource: triplanarHexFragShader,
    }, {
      attributes: ["position", "normal", "uv"],
      uniforms: ["resolution", "worldViewProjection"],
    });
    material.setTexture("src", texture);
    material.setTexture("plane_x", texture);
    material.setTexture("plane_y", texture);
    material.setTexture("plane_z", texture);
    texture.onGeneratedObservable.add(() => {
      if (material.isReady()) {
        mesh.material = material;
      }
    });

    engine.runRenderLoop(() => {
      scene.render();
    });
    return scene;
  })(canvas_triplanar);


  return (
    <div class={styles.App}>
      <div>
        {canvas_model_src}
      </div>
      <div>
        {canvas_model}
      </div>
      <div>
        {canvas_triplanar}
      </div>
    </div>
  );
};

export default App;
