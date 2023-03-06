#ifndef INCLUDED_NOISE3D
#define INCLUDED_NOISE3D

#pragma glslify: import('./util.glsl.frag')
#pragma glslify: import('./random.glsl.frag')
#pragma glslify: import('./simplex3.glsl.frag')

/*
float wavelet_disk_zerosum (vec3 point) {
    float r = clamp(length(point), 0.0, 1.0);
    float[8] c = float[](1.0, 0.0, -12.0, 20.0, -9.0, 0.0, 0.0, 0.0);
    return polynomial(c, r);
}
float wavelet_sphere_zerosum (vec3 point) {
    float r = clamp(length(point), 0.0, 1.0);
    float[8] c = float[](1.0, 0.0, -10.0, 16.0, -7.0, 0.0, 0.0, 0.0);
    return polynomial(c, r);
}
*/


float value_noise3d(vec3 point) {
  vec3[4] corners = calc_simplex3_corners_ortho(point);
  vec4 ratio = calc_corner_closeness(point, corners);

  vec4 weight = vec4( // can be other weight function
    smoothstep(0.0, 1.0, ratio[0]),
    smoothstep(0.0, 1.0, ratio[1]),
    smoothstep(0.0, 1.0, ratio[2]),
    smoothstep(0.0, 1.0, ratio[3])
  );
  vec4 noise = vec4(
    rand_normal(corners[0]),
    rand_normal(corners[1]),
    rand_normal(corners[2]),
    rand_normal(corners[3])
  );
  weight = to_ratio(weight);
  return dot(noise, weight);
}

float simplex_noise3d(vec3 point) {
  vec3[4] corners = calc_simplex3_corners_ortho(point);
  vec4 ratio = calc_corner_closeness(point, corners);
  vec3[4] corners_relative = vec3[](
    corners[0] - point,
    corners[1] - point,
    corners[2] - point,
    corners[3] - point
  );

  vec4 h = max(
    0.5 - vec4(
      dot(corners_relative[0], corners_relative[0]),
      dot(corners_relative[1], corners_relative[1]),
      dot(corners_relative[2], corners_relative[2]),
      dot(corners_relative[3], corners_relative[3])
    ), 0.0
  );
  vec3[4] noise = vec3[](
    rand_normal_vec3(corners[0]),
    rand_normal_vec3(corners[1]),
    rand_normal_vec3(corners[2]),
    rand_normal_vec3(corners[3])
  );
  return dot(
    h*h*h*h,
    vec4(
      dot(corners_relative[0], noise[0]),
      dot(corners_relative[1], noise[1]),
      dot(corners_relative[2], noise[2]),
      dot(corners_relative[3], noise[3])
    )
  );
}


float fractional_brownian_motion(vec3 point, int depth, float decay) {
  float result = 0.0;
  const mat4 octave_salt = mat4(mat3(2.0))  // scale
    * mat4(mat3(mat2(cos(0.7), sin(0.7), -sin(0.7), cos(0.7))))  // rotate
    * mat4(mat3(1.0,0.0,0.0, 0.0,cos(1.8),sin(1.8), 0.0,-sin(1.8),cos(1.8)))  // rotate
    * mat4(mat4x3(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), vec3(0.0, 0.0, 1.0), vec3(123.2, 214.3, 455.4)))  // translate
  ;
  vec4 p = vec4(point, 1.0);
  float weight = 1.0;
  for (int i=0; i<depth; i++) {
    result += weight * simplex_noise3d(p.xyz);
    weight *= decay;
    p = octave_salt * p;
  }
  return result;
}

#endif
