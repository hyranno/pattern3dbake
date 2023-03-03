#version 300 es
precision highp float;

#pragma glslify: import('./modules/util.glsl.frag')
#pragma glslify: import('./modules/tiled_texture.glsl.frag')

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
  float sharpness = 9.0;
  float mix_ratio = 1.0;
  float scale = 10.0;

  float randomness = 0.05;
  float tile_sharpness = 9.0;
  float tile_scale = 0.8;

  vec4 baseColor = texture(src, vUV);
  mat3x4 color = mat3x4(
    tiled_texture(plane_x, scale * vPosition.yz, randomness, tile_sharpness, tile_scale),
    tiled_texture(plane_y, scale * vPosition.xz, randomness, tile_sharpness, tile_scale),
    tiled_texture(plane_z, scale * vPosition.xy, randomness, tile_sharpness, tile_scale)
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
