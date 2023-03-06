#version 300 es
precision highp float;

#pragma glslify: import('../modules/noise2d.glsl.frag')

uniform vec2 scale;
uniform vec3 base_color;
uniform vec3 top_color;

uniform int fBM_depth;
uniform float fBM_decay;
uniform float strength;
uniform float sharpness;


in vec2 vUV;

out vec4 fragColor;

void main() {
  vec2 point = scale * vUV;
  float fBM = fractional_brownian_motion(point, fBM_depth, fBM_decay);

  fragColor = vec4(
    mix(base_color, top_color, clamp(strength * pow(fBM*fBM, sharpness), 0.0, 1.0)),
    1.0
  );
}
