#version 300 es
precision highp float;

#pragma glslify: import('../modules/util.glsl.frag')
#pragma glslify: import('../modules/hsl.glsl.frag')
#pragma glslify: import('../modules/random.glsl.frag')
#pragma glslify: import('../modules/simplex2.glsl.frag')

uniform vec2 scale;
uniform vec3 base_color;
uniform vec3 edge_color;
uniform vec3 position_randomness;
uniform vec3 color_randomness;
uniform float edge_width;
uniform float edge_smoothness;

in vec2 vUV;

out vec4 fragColor;

void main() {
  const float position_salt = 634.0;
  const float color_salt = 284.0;

  vec2 point = scale * vUV;

  vec2[3] corners = calc_simplex2_corners_ortho(point);
  vec3[3] position_rand = vec3[](
    rand_normal_vec3(vec3(corners[0], position_salt)) * position_randomness,
    rand_normal_vec3(vec3(corners[1], position_salt)) * position_randomness,
    rand_normal_vec3(vec3(corners[2], position_salt)) * position_randomness
  );

  float[3] distances = float[](
    length(vec3(corners[0]-point, 0.0) + position_rand[0]),
    length(vec3(corners[1]-point, 0.0) + position_rand[1]),
    length(vec3(corners[2]-point, 0.0) + position_rand[2])
  );
  float nearest_f = 0.0;
  for (int i=1; i<3; i++) {
    nearest_f = mix(nearest_f, float(i), distances[i] < distances[int(nearest_f)]);
  }
  int nearest = int(nearest_f);

  float edge = smoothmin(
    distances[(nearest+1)%3]-distances[nearest],
    distances[(nearest+2)%3]-distances[nearest],
    edge_smoothness
  );
  float edge_weight = 1.0 - smoothstep(0.0, edge_width, edge);

  vec3 stone_color = rgb_from_hsl(
    hsl_from_rgb(base_color) + rand_normal_vec3(vec3(corners[nearest], color_salt)) * color_randomness
  );

  fragColor = vec4(
    mix(stone_color, edge_color, edge_weight),
    1.0
  );
}
