
#pragma glslify: import('./util.glsl.frag')
#pragma glslify: import('./random.glsl.frag')
#pragma glslify: import('./simplex3.glsl.frag')

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


float value_noise3d(vec3 point) {
  vec3[4] corners = calc_simplex3_corners_ortho(point);
  vec4 noise = vec4(
    rand_normal(corners[0]),
    rand_normal(corners[1]),
    rand_normal(corners[2]),
    rand_normal(corners[3])
  );
  vec4 weight = vec4(1.0); //TODO
  weight = normalize(weight);
  return dot(noise, weight);
}
