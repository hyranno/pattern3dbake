import type { Component } from 'solid-js';

import styles from './App.module.css';

import * as babylon from "babylonjs";
import 'babylonjs-loaders';
// import "babylon-vrm-loader";  // outdated?

import textureVertShader from 'shaders/texture.glsl.vert';
import plainFragShader from 'shaders/plain.glsl.frag';
import copyFragShader from 'shaders/copy.glsl.frag';
import voronoiFragShader from 'shaders/voronoi.glsl.frag';
import voronoiTiledFragShader from 'shaders/voronoi_tiled.glsl.frag';
import valueNoiseFragShader from 'shaders/value_noise.glsl.frag';
import simplexNoiseFragShader from 'shaders/simplex_noise.glsl.frag';
import fbmNoiseFragShader from 'shaders/fbm_noise.glsl.frag';

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


  return (
    <div class={styles.App}>
      <div>
        {canvas_model_src}
      </div>
      <div>
        {canvas_model}
      </div>
    </div>
  );
};

export default App;
