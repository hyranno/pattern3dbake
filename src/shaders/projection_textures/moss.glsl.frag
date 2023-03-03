#version 300 es
precision highp float;

#pragma glslify: import('../modules/noise2d.glsl.frag')

in vec2 vUV;

out vec4 fragColor;

void main() {
  float scale = 10.0;
  vec3 base_color = vec3(0.08, 0.20, 0.08);
  vec3 top_color = vec3(0.60, 0.80, 0.20);

  int fBM_depth = 4;
  float fBM_decay = 0.8;
  float strength = 4.0;
  float sharpness = 0.3;

  vec2 point = scale * vUV;
  float fBM = fractional_brownian_motion(point, fBM_depth, fBM_decay);

  fragColor = vec4(
    mix(base_color, top_color, clamp(strength * pow(fBM*fBM, sharpness), 0.0, 1.0)),
    1.0
  );
}
