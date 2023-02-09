import type { Component } from 'solid-js';

import styles from './App.module.css';

import * as babylon from "babylonjs";
import 'babylonjs-loaders';
// import "babylon-vrm-loader";  // outdated?

import textureVertShader from 'shaders/texture.glsl.vert?raw';
import plainFragShader from 'shaders/plain.glsl.frag?raw';
import copyFragShader from 'shaders/copy.glsl.frag?raw';

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
  let scene_work = new babylon.Scene(engine_work);
  scene_work.createDefaultCameraOrLight();

  let canvas_diffuse_src = document.createElement("canvas");

  let canvas_diffuse = document.createElement("canvas");
  let texture_diffuse = new babylon.DynamicTexture("diffuse", canvas_diffuse, scene_model);

  engine_work.runRenderLoop(() => {
    if (scene_work.isReady()) {
      scene_work.render();
      texture_diffuse.update();
    }
  });


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
      meshes.forEach((m) => m.layerMask = 0);
      {
        let layerMask = 1 << 0;
        let material = new babylon.ShaderMaterial("shader", scene_work, {
          vertexSource: textureVertShader,
          fragmentSource: copyFragShader,
        }, {
          attributes: ["position", "normal", "uv"],
          uniforms: ["worldViewProjection", "resolution"],
        });
        material.setTexture("src", (meshes[12].material!.clone("org") as babylon.PBRMaterial).albedoTexture!);
        let plane = babylon.MeshBuilder.CreatePlane("plane", {}, scene_work);
        material.depthFunction = babylon.Constants.ALWAYS;
        plane.material = material;
        plane.layerMask = layerMask;

        let camera = new babylon.FollowCamera(
          "camera_diffuse_src", new babylon.Vector3(), scene_work,
          plane
        );
        camera.layerMask = layerMask;
        let view_diffuse_src = engine_work.registerView(canvas_diffuse_src, camera);
      }
      {
        let layerMask = 1 << 1;
        let target = meshes[12]; //.clone("diffuse", null)!;
        target.layerMask = layerMask;
        let material = new babylon.ShaderMaterial("shader", scene_work, {
          vertexSource: textureVertShader,
          fragmentSource: plainFragShader,
        }, {
          attributes: ["position", "normal", "uv"],
          uniforms: ["worldViewProjection", "resolution"],
        });
        material.cullBackFaces = false;
        material.depthFunction = babylon.Constants.ALWAYS;
        target.material = material;

        let camera = new babylon.FollowCamera(
          "camera_diffuse", new babylon.Vector3(), scene_work,
          target
        );
        camera.layerMask = layerMask;
        let view_diffuse = engine_work.registerView(canvas_diffuse, camera);
      }
    }
  );

  scene_work.executeWhenReady(() => {
    scene_work.render();
    texture_diffuse.update();
  });


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
