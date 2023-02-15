#include 'util.glsl.frag';

vec3 hsl_from_rgb(vec3 rgb) {
  const float pi = radians(180.0);
  const vec3 a = 2.0*pi * vec3(0, 1, 2)/3.0;
  vec2 hv =
    rgb.x * vec2(cos(a.x), sin(a.x)) +
    rgb.y * vec2(cos(a.y), sin(a.y)) +
    rgb.z * vec2(cos(a.z), sin(a.z))
  ;
  float h = mod(atan(hv.y, hv.x), 2.0*pi) / (2.0*pi);
  float cmax = max(rgb.x, max(rgb.y, rgb.z));
  float cmin = min(rgb.x, min(rgb.y, rgb.z));
  float s = (cmax - cmin) / mix(1.0 - abs(cmax + cmin -1.0), 1.0, cmax == cmin);  // cylinder HSL
  float l = (cmax + cmin) / 2.0;
  return vec3(h,s,l);
}

vec3 rgb_from_hsl(vec3 hsl) {
  const float pi = radians(180.0);
  const vec3 a = 2.0*pi * vec3(0, 1, 2)/3.0;
  vec3 ratio = vec3(1.0) - clamp(
    abs(balance_radian(vec3(hsl.x * 2.0*pi) - a)) / (pi/3.0) - vec3(1.0),
    vec3(0.0), vec3(1.0)
  );
  float cmax = hsl.z + hsl.y / 2.0 * (1.0 - abs(2.0 * hsl.z - 1.0));
  float cmin = hsl.z - hsl.y / 2.0 * (1.0 - abs(2.0 * hsl.z - 1.0));
  return mix(vec3(cmin), vec3(cmax), ratio);
}
