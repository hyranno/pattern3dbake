#ifndef INCLUDED_VORONOI
#define INCLUDED_VORONOI

#pragma glslify: import('./util.glsl.frag')
#pragma glslify: import('./random.glsl.frag')
#pragma glslify: import('./simplex3.glsl.frag')

float voronoi(vec3 point) {
  vec3[4] corners = calc_simplex3_corners_ortho(point);
  vec4 weight = vec4(  // can be other weight function
    smoothstep(0.0, 1.0, length(corners[0]-point)),
    smoothstep(0.0, 1.0, length(corners[1]-point)),
    smoothstep(0.0, 1.0, length(corners[2]-point)),
    smoothstep(0.0, 1.0, length(corners[3]-point))
  );
  return min(
    min(weight[0], weight[1]),
    min(weight[2], weight[3])
  );
}

float voronoi_tiled_random(vec3 point) {
  vec3[4] corners = calc_simplex3_corners_ortho(point);
  vec4 noise = vec4(
    rand_normal(corners[0]),
    rand_normal(corners[1]),
    rand_normal(corners[2]),
    rand_normal(corners[3])
  );
  vec4 distances = vec4(
    length(corners[0] - point),
    length(corners[1] - point),
    length(corners[2] - point),
    length(corners[3] - point)
  );
  float nearest = 0.0;
  for (int i=1; i<4; i++) {
    nearest = mix(nearest, float(i), distances[i] < distances[int(nearest)]);
  }
  vec4 weight = vec4(0.0);
  weight[int(nearest)] = 1.0;
  return dot(noise, weight);
}

#endif
