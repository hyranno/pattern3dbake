
const mat2 simplex2_coord_basis = mat2(1.0) + (sqrt(3.0)-1.0)/2.0;
const mat2 simplex2_coord_inverse = inverse(simplex2_coord_basis);

vec2 simplex2_from_orthogonal(vec2 p) {
  return p * simplex2_coord_basis;
}
vec2 simplex2_to_orthogonal(vec2 p) {
  return p * simplex2_coord_inverse;
}

vec2[3] calc_simplex2_corners(vec2 p) {
  vec2[3] corners = vec2[](floor(p), vec2(0), vec2(0));
  vec2 remain = fract(p);
  vec2 indices = vec2(0, 1);
  { /* bubble sort */
    indices.xy = mix(indices.xy, indices.yx, bvec2(remain.x < remain.y));
    remain.xy = mix(remain.xy, remain.yx, bvec2(remain.x < remain.y));
  }
  for (int i=0; i < 2; i++) {
    vec2 diff = vec2(0.0);
    diff[int(indices[i])] = 1.0;
    corners[i+1] = corners[i] + diff;
  }
  return corners;
}
vec2[3] calc_simplex2_corners_ortho(vec2 p_ortho) {
  vec2[3] corners = calc_simplex2_corners(simplex2_from_orthogonal(p_ortho));
  for (int i=0; i<3; i++) {
    corners[i] = simplex2_to_orthogonal(corners[i]);
  }
  return corners;
}

vec3 calc_corner_closeness(vec2 point, vec2[3] corners) {
  vec2[2] edge0 = vec2[](corners[1], corners[2]);
  vec2[2] edge1 = vec2[](corners[0], corners[2]);
  vec2[2] edge2 = vec2[](corners[0], corners[1]);
  return vec3(
    distance_from_line(point, edge0) / distance_from_line(corners[0], edge0),
    distance_from_line(point, edge1) / distance_from_line(corners[1], edge1),
    distance_from_line(point, edge2) / distance_from_line(corners[2], edge2)
  );
}
