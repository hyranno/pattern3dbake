
mat3 calc_simplex3_coord_basis() {
  const float angle0 = acos(1.0/3.0);
  const float angle1 = 2.0*radians(180.0)/3.0;
  const vec2 v0 = vec2(cos(angle0), sin(angle0));
  const vec2 v1 = vec2(cos(angle1), sin(angle1));
  return mat3(
    vec3(v0.x, v0.y*vec2(1.0, 0.0)),
    vec3(v0.x, v0.y*v1),
    vec3(v0.x, v0.y*vec2(v1.x, -v1.y))
  );
}

vec3 simplex3_from_orthogonal(vec3 p) {
  return p * calc_simplex3_coord_basis();
}
vec3 simplex3_to_orthogonal(vec3 p) {
  return p * inverse(calc_simplex3_coord_basis());
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
