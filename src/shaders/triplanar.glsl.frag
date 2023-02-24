#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D src;
uniform sampler2D plane_x;
uniform sampler2D plane_y;
uniform sampler2D plane_z;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  // uniform
  float sharpness = 10.0;
  float mix_ratio = 1.0;

  vec4 baseColor = texture(src, vUV);
  mat3x4 color = mat3x4(
    texture(plane_x, 10.0 * vPosition.yz),
    texture(plane_y, 10.0 * vPosition.xz),
    texture(plane_z, 10.0 * vPosition.xy)
  );

  vec3 normal = normalize(vNormal);
  vec3 weight = abs(mat3(1.0) * normal);
  for (int i=0; i<3; i++) {
    weight[i] = pow(weight[i], sharpness);
  }
  weight = normalize(weight);

  vec4 projectedColor = color * weight;

  fragColor = mix(
    baseColor,
    projectedColor,
    mix_ratio
  );
}
