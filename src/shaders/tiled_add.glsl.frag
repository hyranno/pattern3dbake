#version 300 es
precision highp float;

#pragma glslify: import('./modules/tiled_texture.glsl.frag')

uniform vec2 resolution;
uniform sampler2D src;
uniform sampler2D tile;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  float mix_ratio = 1.0;
  float scale = 4.0;

  float randomness = 0.05;
  float tile_sharpness = 9.0;
  float tile_scale = 0.8;

  fragColor = mix(
    texture(src, vUV),
    tiled_texture(tile, scale * vUV, randomness, tile_sharpness, tile_scale),
    mix_ratio
  );
}
