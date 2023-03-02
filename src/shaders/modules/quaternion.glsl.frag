#ifndef INCLUDED_QUAT
#define INCLUDED_QUAT

vec4 quaternion_fromAngleAxis(float angle, vec3 axis) {
  float x = axis.x*sin(angle/2.0);
  float y = axis.y*sin(angle/2.0);
  float z = axis.z*sin(angle/2.0);
  float w = cos(angle/2.0);
  return normalize(vec4(x,y,z,w));
}
vec4 quaternion_fromSrcDest(vec3 src, vec3 dest) {
  vec3 cr = cross(src, dest);
  float si = length(cr);
  float co = dot(src, dest);
  vec3 axis = (si==0.0)? vec3(1,0,0) : normalize(cr);
  return quaternion_fromAngleAxis( atan(si,co), axis );
}
vec4 quaternion_inverse(vec4 q) {
  return vec4(-q.xyz, q.w);
}
vec4 quaternion_mul(vec4 q0, vec4 q1) {
  return vec4(cross(q0.xyz, q1.xyz) + q0.w*q1.xyz + q1.w*q0.xyz, q0.w*q1.w - dot(q0.xyz, q1.xyz));
}
vec3 quaternion_mul(vec4 q, vec3 v) {
  return quaternion_mul( quaternion_mul(q, vec4(v,0.0)), quaternion_inverse(q)).xyz;
}

vec4 dcm_to_quaternion(mat3 dcm) {
  vec4 res;
  vec4 a4v = vec4(
    2.0 *sqrt(+dcm[0][0] -dcm[1][1] -dcm[2][2] + 1.0),
    2.0 *sqrt(-dcm[0][0] +dcm[1][1] -dcm[2][2] + 1.0),
    2.0 *sqrt(-dcm[0][0] -dcm[1][1] +dcm[2][2] + 1.0),
    2.0 *sqrt(+dcm[0][0] +dcm[1][1] +dcm[2][2] + 1.0)
  );
  int imax = 0;
  for (int i=1; i<4; i++) {
    imax = select(imax, i, a4v[imax] < a4v[i]);
  }
  mat4 vs = transpose(mat4(
    0.0, dcm[0][1]+dcm[1][0], dcm[2][0]+dcm[0][2], dcm[1][2]-dcm[2][1],
    dcm[0][1]+dcm[1][0], 0.0, dcm[1][2]+dcm[2][1], dcm[2][0]-dcm[0][2],
    dcm[2][0]+dcm[0][2], dcm[1][2]+dcm[2][1], 0.0, dcm[0][1]-dcm[1][0],
    dcm[1][2]-dcm[2][1], dcm[2][0]-dcm[0][2], dcm[0][1]-dcm[1][0], 0.0
  ));
  for (int i=0; i<4; i++) {
    res[i] = select(vs[imax][i]/a4v[imax], a4v[imax]/4.0, i==imax);
  }
  return res;
}
mat3 dcm_from_axis_xy(vec3 x, vec3 y) {
  vec3 z = cross(x,y);
  return mat3(normalize(x),normalize(y),normalize(z));
}
mat3 dcm_from_axis_xz(vec3 x, vec3 z) {
  vec3 y = -cross(x,z);
  return mat3(normalize(x),normalize(y),normalize(z));
}

#endif
