#version 300 es
precision highp float;

#pragma glslify: import('./modules/util.glsl.frag')
#pragma glslify: import('./modules/random.glsl.frag')
#pragma glslify: import('./modules/simplex2.glsl.frag')

uniform vec2 resolution;
uniform sampler2D src;
uniform sampler2D plane_x;
uniform sampler2D plane_y;
uniform sampler2D plane_z;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

vec4 tiled_texture(in sampler2D samp, vec2 point, float randomness, float sharpness, float scale) {
  float salt = 874.0;

  vec2[3] corners = calc_simplex2_corners_ortho(point);
  vec2[3] core = vec2[](
    corners[0] + rand_normal(corners[0], salt) * randomness,
    corners[1] + rand_normal(corners[1], salt) * randomness,
    corners[2] + rand_normal(corners[2], salt) * randomness
  );

  vec2[3] remains = vec2[](
    core[0] - point,
    core[1] - point,
    core[2] - point
  );
  vec3 rotation = vec3(
    rand_uniform(core[0], salt) * 2.0*radians(180.0),
    rand_uniform(core[1], salt) * 2.0*radians(180.0),
    rand_uniform(core[2], salt) * 2.0*radians(180.0)
  );
  vec2[3] uvs = vec2[](
    vec2(0.5) + scale * rotate(remains[0], rotation[0]),
    vec2(0.5) + scale * rotate(remains[1], rotation[1]),
    vec2(0.5) + scale * rotate(remains[2], rotation[2])
  );

  vec3 distances = vec3(
    length(remains[0]),
    length(remains[1]),
    length(remains[2])
  );
  vec3 weight = vec3(1.0) / (distances + 0.01);
  for (int i=0; i<3; i++) {
    weight[i] = pow(weight[i], sharpness);
  }
  weight = to_ratio(weight);

  mat3x4 color = mat3x4(
    texture(samp, uvs[0]),
    texture(samp, uvs[1]),
    texture(samp, uvs[2])
  );
  return color * weight;
}

void main() {
  // uniform
  float sharpness = 9.0;
  float mix_ratio = 1.0;

  float randomness = 0.05;
  float tile_sharpness = 9.0;
  float tile_scale = 0.8;

  vec4 baseColor = texture(src, vUV);
  mat3x4 color = mat3x4(
    tiled_texture(plane_x, 10.0 * vPosition.yz, randomness, tile_sharpness, tile_scale),
    tiled_texture(plane_y, 10.0 * vPosition.xz, randomness, tile_sharpness, tile_scale),
    tiled_texture(plane_z, 10.0 * vPosition.xy, randomness, tile_sharpness, tile_scale)
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
