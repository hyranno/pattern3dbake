float balance_radian(float rad) {
  const float pi = radians(180.0);
  return mod(rad + pi, 2.0*pi) - pi;
}

vec3 balance_radian(vec3 rad) {
  return vec3(
    balance_radian(rad.x),
    balance_radian(rad.y),
    balance_radian(rad.z)
  );
}

float polynomial(float[8] c, float x) {
  float res = c[7];
  for (int i=6; 0 <= i; i--) {
    res = c[i] + x*res;
  }
  return res;
}

#define IMPLEMENT_SWAP(TYPE) \
  void swap(inout TYPE v1, inout TYPE v2) {\
    TYPE t = v1;\
    v1 = v2;\
    v2 = t;\
  }
IMPLEMENT_SWAP(float)
IMPLEMENT_SWAP(int)


vec3 calc_normal(vec3[3] face) {
  return normalize(cross(face[1]-face[0], face[2]-face[0]));
}

float distance_from_plane(vec3 p, vec3[3] face) {
  return abs(dot(p-face[0], calc_normal(face)));
}