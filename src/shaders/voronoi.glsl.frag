#version 300 es
precision highp float;

#pragma glslify: import('./modules/voronoi.glsl.frag')

uniform vec2 resolution;
uniform sampler2D src;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  vec4 baseColor = texture(src, vUV);
  fragColor = vec4(
    0.5 * baseColor.xyz + 0.5 * vec3(voronoi(vPosition * 20.0)),
    baseColor.w
  );
}
