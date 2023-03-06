#version 300 es
precision highp float;

#pragma glslify: import('./modules/tiled_texture.glsl.frag')

uniform vec2 resolution;
uniform sampler2D src;
uniform sampler2D tile;
uniform float scale;
uniform float mix_ratio;
uniform float randomness;
uniform float tile_scale;
uniform float tile_sharpness;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  fragColor = mix(
    texture(src, vUV),
    tiled_texture(tile, scale * vUV, randomness, tile_sharpness, tile_scale),
    mix_ratio
  );
}
