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
  vec4 noise = vec4(
    rand_normal(corners[0]),
    rand_normal(corners[1]),
    rand_normal(corners[2]),
    rand_normal(corners[3])
  );

  // array of arrays not supported in 3.0 es
  vec3[3] face0 = vec3[](corners[1], corners[2], corners[3]);
  vec3[3] face1 = vec3[](corners[0], corners[2], corners[3]);
  vec3[3] face2 = vec3[](corners[0], corners[1], corners[3]);
  vec3[3] face3 = vec3[](corners[0], corners[1], corners[2]);
  vec4 ratio = vec4(
    distance_from_plane(point, face0) / distance_from_plane(corners[0], face0),
    distance_from_plane(point, face1) / distance_from_plane(corners[1], face1),
    distance_from_plane(point, face2) / distance_from_plane(corners[2], face2),
    distance_from_plane(point, face3) / distance_from_plane(corners[3], face3)
  );

  vec4 weight = vec4( // can be other weight function
    smoothstep(0.0, 1.0, ratio[0]),
    smoothstep(0.0, 1.0, ratio[1]),
    smoothstep(0.0, 1.0, ratio[2]),
    smoothstep(0.0, 1.0, ratio[3])
  );
  weight = normalize(weight);
  return dot(noise, weight);
}
