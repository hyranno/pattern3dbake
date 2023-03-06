import type { Component } from 'solid-js';

import styles from './App.module.css';

import PatternBaked from 'PatternBaked';
import TiledAdd from 'TiledAdd';
import Triplanar from 'Triplanar';

const App: Component = () => {

  return (
    <div class={styles.App}>
      <h2>Proceduralな要素をランタイムで生成する</h2>
      <h3>前説</h3>
      <p>
        ゲーム等のグラフィックにおいて、テクスチャは結構なデータサイズを持つ。
        これはストレージを圧迫するのも問題だし、ダウンロードにも時間がかかる。
        テクスチャには質感を表現するためにノイズを乗せることがあるが、
        ノイズは一般に圧縮が効きにくく、データサイズ肥大の一因になる。
        一方、ノイズなどのProceduralな要素はランタイムでの生成が可能であり、
        テクスチャに乗せるタイミングをある程度選ぶことが出来る。
      </p>
      <ol>
        <li> <h5>オフライン</h5>
          Blenderアドオンなどであらかじめ用意する方法。
          複雑なノイズでもランタイムの計算量を消費しない。
          ストレージ上のサイズが膨らむ。
          ストレージからメモリへの転送資源と、それに伴う時間を食う。
        </li>
        <li> <h5>ロード時</h5>
          テクスチャをロードする際(またはそれ以降)に書き込む方法。
          ノイズ付加前のテクスチャで表示しておいてから、計算後にノイズ付加後のテクスチャに差し替えられる。
          ストレージ上のサイズが小さい。
          ロード時に計算資源と、それに伴う時間を食う。
        </li>
        <li> <h5>レンダリング時</h5>
          テクスチャに書き込まず、フラグメントシェーダで直接計算する方法。
          ストレージ上のサイズ、メモリ上のサイズが小さい。
          レンダリング時に計算資源と、それに伴う時間を食う。
          ただしテクスチャのフェッチは減る。
          ミップマップが無いのでモアレ等のエイリアシングへの対策が別途必要。
        </li>
      </ol>
      <p>
        本稿ではロード時のノイズ生成について扱う。
      </p>

      <h3>3次元パターンのテクスチャへの書き込み</h3>
      <p>
        3D上のパターンをテクスチャに書き込むには、
        描画位置がUVに依存するようにvertexシェーダを、
        色は3Dモデル上の座標に依存するようにfragmentシェーダを書けばいい。
      </p>
      <pre><code>{`
in vec3 position;
in vec3 normal;
in vec2 uv;

out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;

void main() {
  vPosition = position;
  vNormal = vNormal;
  vUV = uv;
  gl_Position = vec4(2.0*uv-vec2(1.0), 0.0, 1.0);
}
      `}</code></pre>
      <pre><code>{`
uniform vec2 resolution;
uniform sampler2D src;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  vec4 baseColor = texture(src, vUV);
  fragColor = vec4(
    baseColor.xyz + pattern_to_bake(vPosition, vNormal),
    baseColor.w
  );
}
      `}</code></pre>
      例えばこんな感じになる。
      <div>
        <PatternBaked />
      </div>
      <p>
        赤と緑はUVを表す。
        白黒のもやはノイズをランタイムで書き込んだもの。
        3次元パターンを元にしているのでUVが不連続な部分でもノイズの模様が連続する。
      </p>

      <h3>テクスチャをタイル状に繰り返す</h3>
      <p>
        質感表現のためのノイズを全部テクスチャに描こうとすると、解像度が厳しいことがある。
        その場合は、同じテクスチャをタイル状に繰り返して使うことが考えられる。
        3Dパターンを直接計算する方法と比べればできることは限られるし、
        タイルの境界がボケたり不連続になったりするものの、計算コストは下げられる。
        正方形を並べただけだと繰り返し感が強く出てしまうが、
        タイル形状を六角形に変更したり、ランダムに回転させたりすると軽減できる。
      </p>
      <div>
        <TiledAdd />
      </div>
      <p>
        これはタイル状に並べたテクスチャをそのままUVに貼り付けたもの。
        よく見ると球の頂上などではUV由来の歪みがあるし、UVの切れ目で模様が不連続になっている。
      </p>

      <h3>Triplanar Mapping による投影</h3>
      <p>
        タイル状に繰り返したテクスチャは、UV空間でノイズを重ねる以外にも、
        メッシュにxyzそれぞれの方向から投影する方法があり、
        これはTriplanar Mappingと呼ばれている。
        UV展開不要で、2Dパターンをそのまま投影するので視覚的に分かりやすい。
        ただ、レンダリング時にテクスチャ参照が複数回発生するのであまり高速ではない。
      </p>
      <div>
        <Triplanar />
      </div>
      <p>
        面の方向によって参照するテクスチャを変えることもできる。
        面の角度によっては引き延ばされて歪んだり、ボケたり不連続になったりするので、
        解像度は必要だけどそれほど注視されない細部の質感表現に留めた方が無難か。
      </p>

      <h3>おわり</h3>
      <p>
        Proceduralな要素のうちロード時やレンダリング時に計算できるものは、
        オフラインではなくランタイムで計算すれば、
        ストレージサイズやダウンロード時間が減らせるので、検討しましょう。
        メモリ上のテクスチャが十分な解像度を持つならそちらに書き込み、
        そうでないならTriplanarMappingか、レンダリング時に計算するのが妥当だと思います。
      </p>
    </div>
  );
};

export default App;
