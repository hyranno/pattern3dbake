#ifndef INCLUDED_NOISE2D
#define INCLUDED_NOISE2D

#pragma glslify: import('./util.glsl.frag')
#pragma glslify: import('./random.glsl.frag')
#pragma glslify: import('./simplex2.glsl.frag')


float value_noise2d(vec2 point) {
  vec2[3] corners = calc_simplex2_corners_ortho(point);
  vec3 ratio = calc_corner_closeness(point, corners);

  vec3 weight = vec3( // can be other weight function
    smoothstep(0.0, 1.0, ratio[0]),
    smoothstep(0.0, 1.0, ratio[1]),
    smoothstep(0.0, 1.0, ratio[2])
  );
  vec3 noise = vec3(
    rand_normal(corners[0].x, corners[0].y),
    rand_normal(corners[1].x, corners[1].y),
    rand_normal(corners[2].x, corners[2].y)
  );
  weight = to_ratio(weight);
  return dot(noise, weight);
}

float simplex_noise2d(vec2 point) {
  vec2[3] corners = calc_simplex2_corners_ortho(point);
  vec3 ratio = calc_corner_closeness(point, corners);
  vec2[3] corners_relative = vec2[](
    corners[0] - point,
    corners[1] - point,
    corners[2] - point
  );

  vec3 h = max(
    0.5 - vec3(
      dot(corners_relative[0], corners_relative[0]),
      dot(corners_relative[1], corners_relative[1]),
      dot(corners_relative[2], corners_relative[2])
    ), 0.0
  );
  vec2[3] noise = vec2[](
    rand_normal(corners[0], 89.3),
    rand_normal(corners[1], 5.64),
    rand_normal(corners[2], 763.0)
  );
  return dot(
    h*h*h*h,
    vec3(
      dot(corners_relative[0], noise[0]),
      dot(corners_relative[1], noise[1]),
      dot(corners_relative[2], noise[2])
    )
  );
}


float fractional_brownian_motion(vec2 point, int depth, float decay) {
  float result = 0.0;
  const mat3 octave_salt = mat3(mat2(2.0))  // scale
    * mat3(mat2(cos(0.8), sin(0.8), -sin(0.8), cos(0.8)))  // rotate
    * mat3(mat2x3(vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(123.2, 214.3)))  // translate
  ;
  vec3 p = vec3(point, 1.0);
  float weight = 1.0;
  for (int i=0; i<depth; i++) {
    result += weight * simplex_noise2d(p.xy);
    weight *= decay;
    p = octave_salt * p;
  }
  return result;
}

#endif
