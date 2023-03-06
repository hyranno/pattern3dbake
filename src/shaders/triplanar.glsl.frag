#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D src;
uniform sampler2D plane_x;
uniform sampler2D plane_y;
uniform sampler2D plane_z;
uniform float scale;
uniform float sharpness;
uniform float mix_ratio;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  vec4 baseColor = texture(src, vUV);
  mat3x4 color = mat3x4(
    texture(plane_x, scale * vPosition.yz),
    texture(plane_y, scale * vPosition.xz),
    texture(plane_z, scale * vPosition.xy)
  );

  vec3 normal = normalize(vNormal);
  vec3 weight = abs(mat3(1.0) * normal);
  for (int i=0; i<3; i++) {
    weight[i] = pow(weight[i], sharpness);
  }
  weight = to_ratio(weight);

  vec4 projectedColor = color * weight;

  fragColor = mix(
    baseColor,
    projectedColor,
    mix_ratio
  );
}
