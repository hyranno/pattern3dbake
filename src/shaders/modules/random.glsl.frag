
float rand_uniform(float v, float salt) {
  float phase = 321.47 * salt + mod(v * 596.459, 951.54);
  return fract(4643.4649 * cos(phase));
}
float rand_uniform(vec2 p, float salt) {
  return rand_uniform(dot(p, vec2(459.8, 893.109)), salt);
}

vec2 box_mullar(vec2 r) {
  float amp = sqrt(-2.0*log(max(0.00001, r.x)));
  float phase = 2.0*radians(180.0) * r.y;
  return  amp * vec2(cos(phase), sin(phase));
}
float rand_normal(float v, float salt) {
  return box_mullar(vec2(rand_uniform(v, salt), rand_uniform(v + 674.5, salt))).x;
}
vec2 rand_normal(vec2 p, float salt) {
  return box_mullar(vec2(rand_uniform(p.x, salt), rand_uniform(p.y, salt)));
}
float rand_normal(vec3 p) {
  return rand_normal(p.xy, p.z).x;
}

float rand_exponential (float v, float salt) { // inversion method
  return -log(1.0 - rand_uniform(v, salt));
}
