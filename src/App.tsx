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
import mossProjectionFragShader from 'shaders/projection_textures/moss.glsl.frag';

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
        fragmentSource: simplexNoiseFragShader,
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
    return scene;
  })(canvas_triplanar);


  return (
    <div class={styles.App}>
      <h3>ランタイムにおけるProceduralTextureの活用について</h3>
      <h4>前説</h4>
      <p>
        ゲーム等のグラフィックにおいて、テクスチャは結構なデータサイズを持つ。
        これはストレージを圧迫するのも問題だし、ダウンロードにも時間がかかる。
        テクスチャには質感を表現するためにノイズを乗せることがあるが、
        ノイズは一般に圧縮が効きにくく、データサイズ肥大の一因になる。
        一方ノイズなどのProceduralなランタイムでの生成が可能な要素は、
        ノイズを乗せるタイミングをある程度選ぶことが出来る。
        <li>
          <ul> <h5>オフライン</h5>
            Blenderアドオンなどであらかじめ用意する方法。
            複雑なノイズでもランタイムの計算量を消費しない。
            ストレージ上のサイズが膨らむ。
            ストレージからメモリへの転送資源と、それに伴う時間を食う。
          </ul>
          <ul> <h5>ロード時</h5>
            テクスチャをロードする際(またはそれ以降)に書き込む方法。
            ノイズ付加前のテクスチャで表示しておいてから、計算後にノイズ付加後のテクスチャに差し替えられる。
            ストレージ上のサイズが小さい。
            ロード時に計算資源と、それに伴う時間を食う。
          </ul>
          <ul> <h5>レンダリング時</h5>
            テクスチャに書き込まず、フラグメントシェーダで直接計算する方法。
            ストレージ上のサイズ、メモリ上のサイズが小さい。
            レンダリング時に計算資源と、それに伴う時間を食う。
            ただしテクスチャのフェッチは減る。
            ミップマップが無いのでモアレ等のエイリアシングへの対策が別途必要。
          </ul>
        </li>
        本稿ではロード時のノイズ生成について扱う。
      </p>

      <h4>3次元パターンのテクスチャへの書き込み</h4>
      <p>
        描画位置がUVに依存するようにvertexシェーダを、
        色は3Dモデル上の座標に依存するようにfragmentシェーダを書けばいい。
        /*
          TODO コード
        */
        例えばこんな感じになる。上が元のモデル、下がシャツ部分にノイズを乗せたモデル。
        <div>
          {canvas_model_src}
        </div>
        <div>
          {canvas_model}
        </div>
        3次元パターンを元にしているのでUVの切れ目でも模様が連続する。
        UVの切れ目に線が入ってしまってるのは対処する必要があるけど。
      </p>

      <h4>テクスチャをタイル状に繰り返す</h4>
      <p>
        質感表現のためのノイズを全部テクスチャに描こうとすると、解像度が厳しいことがある。
        その場合は、同じテクスチャをタイル状に繰り返して使うことが考えられる。
        3Dパターンを直接計算する方法と比べればできることは限られるし、
        タイルの境界がボケたり不連続になったりするものの、計算コストは下げられる。
        正方形を並べただけだと繰り返し感が強く出てしまうが、
        タイル形状を六角形に変更したり、ランダムに回転させたりすると軽減できる。
        <div>
        </div>
      </p>

      <h4>Triplanar Mapping による投影</h4>
      <p>
        UV空間でノイズを重ねる意外にも、
        テクスチャをメッシュにxyzそれぞれの方向から投影する方法があり、
        これはTriplanar Mappingと呼ばれている。
        UV展開が不要で、人間にも分かりやすい。
        ただしレンダリング時にテクスチャ参照が複数回発生するのであまり高速ではないし、
        面の角度によっては引き延ばされて歪んだり、ボケたり不連続になったりする。
        <div>
          {canvas_triplanar}
        </div>
      </p>

      <h4>おわり</h4>
      <p>
        ロード時やレンダリング時に計算できるものはそちらに移すと
        ストレージサイズが減らせて嬉しいので検討しましょう。
      </p>
    </div>
  );
};

export default App;
