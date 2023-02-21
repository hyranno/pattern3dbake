
const mat3 simplex3_coord_basis = mat3(1.0) + 1.0/3.0;
const mat3 simplex3_coord_inverse = inverse(simplex3_coord_basis);

vec3 simplex3_from_orthogonal(vec3 p) {
  return p * simplex3_coord_basis;
}
vec3 simplex3_to_orthogonal(vec3 p) {
  return p * simplex3_coord_inverse;
}

vec3[4] calc_simplex3_corners(vec3 p) {
  vec3[4] corners = vec3[](floor(p), vec3(0), vec3(0), vec3(0));
  vec3 remain = fract(p);
  vec3 indices = vec3(0, 1, 2);
  { /* bubble sort */
    indices.yz = mix(indices.yz, indices.zy, bvec2(remain.y < remain.z));
    remain.yz = mix(remain.yz, remain.zy, bvec2(remain.y < remain.z));
    indices.xy = mix(indices.xy, indices.yx, bvec2(remain.x < remain.y));
    remain.xy = mix(remain.xy, remain.yx, bvec2(remain.x < remain.y));
    indices.yz = mix(indices.yz, indices.zy, bvec2(remain.y < remain.z));
    remain.yz = mix(remain.yz, remain.zy, bvec2(remain.y < remain.z));
  }
  for (int i=0; i < 3; i++) {
    vec3 diff = vec3(0.0);
    diff[int(indices[i])] = 1.0;
    corners[i+1] = corners[i] + diff;
  }
  return corners;
}
vec3[4] calc_simplex3_corners_ortho(vec3 p_ortho) {
  vec3[4] corners = calc_simplex3_corners(simplex3_from_orthogonal(p_ortho));
  for (int i=0; i<4; i++) {
    corners[i] = simplex3_to_orthogonal(corners[i]);
  }
  return corners;
}

vec4 calc_corner_closeness(vec3 point, vec3[4] corners) {
  vec3[3] face0 = vec3[](corners[1], corners[2], corners[3]);
  vec3[3] face1 = vec3[](corners[0], corners[2], corners[3]);
  vec3[3] face2 = vec3[](corners[0], corners[1], corners[3]);
  vec3[3] face3 = vec3[](corners[0], corners[1], corners[2]);
  return vec4(
    distance_from_plane(point, face0) / distance_from_plane(corners[0], face0),
    distance_from_plane(point, face1) / distance_from_plane(corners[1], face1),
    distance_from_plane(point, face2) / distance_from_plane(corners[2], face2),
    distance_from_plane(point, face3) / distance_from_plane(corners[3], face3)
  );
}
