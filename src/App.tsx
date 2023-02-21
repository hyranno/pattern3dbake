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

  let canvas_work = document.createElement("canvas");
  canvas_work.width = 512;
  canvas_work.height = 512;
  let engine_work = new babylon.Engine(canvas_work, true);
  engine_work.setViewport(new babylon.Viewport(0, 0, 1.0, 1.0));
  let scene_work = new babylon.Scene(engine_work);
  scene_work.createDefaultCameraOrLight();

  let canvas_diffuse_src = document.createElement("canvas");

  let canvas_diffuse = document.createElement("canvas");
  let texture_diffuse = new babylon.DynamicTexture("diffuse", canvas_diffuse, scene_model);


  babylon.SceneLoader.ImportMesh("",
    ...breakUrl(sampleModelUrl), scene_model_src,
  );
  babylon.SceneLoader.ImportMesh("",
    ...breakUrl(sampleModelUrl), scene_model,
    (meshes) => {
      (meshes[12].material! as babylon.PBRMaterial).albedoTexture = texture_diffuse;
    },
  );

  babylon.SceneLoader.ImportMesh("",
    ...breakUrl(sampleModelUrl), scene_work,
    (meshes) => {
      {
        let material = new babylon.ShaderMaterial("shader", scene_work, {
          vertexSource: textureVertShader,
          fragmentSource: copyFragShader,
        }, {
          attributes: ["position", "normal", "uv"],
          uniforms: ["resolution"],
        });
        material.setTexture("src", (meshes[12].material!.clone("org") as babylon.PBRMaterial).albedoTexture!);
        let plane = babylon.MeshBuilder.CreatePlane("plane", {}, scene_work);
        material.depthFunction = babylon.Constants.ALWAYS;
        plane.material = material;

        let camera = new babylon.Camera("camera_diffuse_src", new babylon.Vector3(), scene_work);
        let view = engine_work.registerView(canvas_diffuse_src, camera);

        let render_once = () => {
          if (engine_work.activeView! === view && plane.isReady(true)) {
            engine_work.clear(new babylon.Color4(0), true, false);
            plane.subMeshes.forEach(m => m.render(false));
            engine_work.unRegisterView(canvas_diffuse_src);
            engine_work.stopRenderLoop(render_once);
          }
        };
        engine_work.runRenderLoop(render_once);
      }
      {
        let target = meshes[12] as babylon.Mesh;
        let material = new babylon.ShaderMaterial("shader", scene_work, {
          vertexSource: textureVertShader,
          fragmentSource: fbmNoiseFragShader,
        }, {
          attributes: ["position", "normal", "uv"],
          uniforms: ["resolution"],
        });
        material.cullBackFaces = false;
        material.depthFunction = babylon.Constants.ALWAYS;
        target.material = material;

        let camera = new babylon.Camera("camera_diffuse", new babylon.Vector3(), scene_work);
        let view = engine_work.registerView(canvas_diffuse, camera);

        let render_once = () => {
          if (engine_work.activeView! === view && target.isReady(true)) {
            engine_work.clear(new babylon.Color4(0), true, false);
            target.subMeshes.forEach(m => m.render(false));
            setTimeout(() => texture_diffuse.update()); // update after this rendering call
            engine_work.unRegisterView(canvas_diffuse);
            engine_work.stopRenderLoop(render_once);
          }
        };
        engine_work.runRenderLoop(render_once);
      }
    }
  );

  return (
    <div class={styles.App}>
      <div>
        {canvas_model_src}
      </div>
      <div>
        {canvas_model}
      </div>
      <div>
        {canvas_diffuse_src}
        {canvas_diffuse}
      </div>
    </div>
  );
};

export default App;
