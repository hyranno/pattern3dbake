#ifndef INCLUDED_RAND
#define INCLUDED_RAND

#pragma glslify: import('./util.glsl.frag')
#pragma glslify: import('./quaternion.glsl.frag')

/* prototypes */
float rand_uniform(float v);
float rand_uniform(vec2 v);
float rand_uniform(vec3 v);
vec2 rand_uniform_vec2(vec2 v);
vec3 rand_uniform_vec3(vec3 v);

vec2 box_mullar(vec2 r);
float rand_normal(float v);
float rand_normal(vec2 v);
float rand_normal(vec3 v);
vec2 rand_normal_vec2(vec2 v);
vec3 rand_normal_vec3(vec3 v);

float rand_exponential (float v);

/* implementations */

float rand_uniform(float v) {
  float phase = 1.31 + mod(v * 596.459, 314.159265);
  return fract(961.48 * cos(phase));
}
float rand_uniform(vec2 v) {
  return rand_uniform(dot(v, vec2(0.893, 1.09)));
}
float rand_uniform(vec3 v) {
  return rand_uniform(dot(v, vec3(0.893, 1.09, 4.649)));
}
vec2 rand_uniform_vec2(vec2 v) {
  vec2 r = vec2(
    rand_uniform(v.x),
    rand_uniform(v.y)
  );
  return rotate(r, 0.98);
}
vec3 rand_uniform_vec3(vec3 v) {
  vec3 r = vec3(
    rand_uniform(v.x),
    rand_uniform(v.y),
    rand_uniform(v.z)
  );
  return quaternion_mul(
    normalize(vec4(0.571, 0.167, -0.571, 0.566)),
    r
  );
}

vec2 box_mullar(vec2 r) {
  float amp = sqrt(-2.0*log(max(0.00001, r.x)));
  float phase = 2.0*radians(180.0) * r.y;
  return  amp * vec2(cos(phase), sin(phase));
}
float rand_normal(float v) {
  return rand_normal_vec2(vec2(v, rand_uniform(v))).x;
}
float rand_normal(vec2 v) {
  return rand_normal_vec2(v).x;
}
float rand_normal(vec3 v) {
  return rand_normal(dot(v, vec3(0.774, 0.960, 0.893)));
}
vec2 rand_normal_vec2(vec2 v) {
  return box_mullar(rand_uniform_vec2(v));
}
vec3 rand_normal_vec3(vec3 v) {
  vec3 r = vec3(
    rand_normal_vec2(v.xy), rand_normal(v.z)
  );
  return quaternion_mul(
    normalize(vec4(0.571, 0.167, -0.571, 0.566)),
    r
  );
}

float rand_exponential (float v) { // inversion method
  return -log(1.0 - rand_uniform(v));
}

#endif
