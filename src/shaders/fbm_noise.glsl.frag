#version 300 es
precision highp float;

#pragma glslify: import('./modules/noise3d.glsl.frag')

uniform vec2 resolution;
uniform sampler2D src;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  fragColor = vec4(
    vec3(0.5) + 4.0 * vec3(
      fractional_brownian_motion(vPosition * 20.0, 4, 0.5)
    ),
    1.0
  );
}
