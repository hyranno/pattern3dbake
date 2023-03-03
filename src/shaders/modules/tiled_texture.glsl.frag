#ifndef INCLUDED_TILED_TEXTURE
#define INCLUDED_TILED_TEXTURE

#pragma glslify: import('./util.glsl.frag')
#pragma glslify: import('./random.glsl.frag')
#pragma glslify: import('./simplex2.glsl.frag')


vec4 tiled_texture(in sampler2D samp, vec2 point, float randomness, float sharpness, float scale) {
  vec2[3] corners = calc_simplex2_corners_ortho(point);
  vec2[3] core = vec2[](
    corners[0] + rand_normal_vec2(corners[0]) * randomness,
    corners[1] + rand_normal_vec2(corners[1]) * randomness,
    corners[2] + rand_normal_vec2(corners[2]) * randomness
  );

  vec2[3] remains = vec2[](
    core[0] - point,
    core[1] - point,
    core[2] - point
  );
  vec3 rotation = vec3(
    rand_uniform(core[0]) * 2.0*radians(180.0),
    rand_uniform(core[1]) * 2.0*radians(180.0),
    rand_uniform(core[2]) * 2.0*radians(180.0)
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

#endif
