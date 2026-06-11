varying vec2 vUv;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vWorldPosition;

uniform float uTime;
uniform float uTurbulence;
uniform float uDisplacementStrength;
uniform float uBreathSpeed;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  float f = 1.0;
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p * f);
    a *= 0.5;
    f *= 2.0;
  }
  return v;
}

float secondaryWave(vec3 pos, float t) {
  // High frequency secondary wave
  float wave1 = sin(pos.x * 3.0 + t * 1.2) * cos(pos.y * 2.5 + t * 0.8);
  float wave2 = sin(pos.z * 2.0 + t * 1.5) * cos(pos.x * 1.8 + t * 0.6);
  float wave3 = sin(pos.y * 3.5 + t * 0.9) * cos(pos.z * 2.2 + t * 1.1);
  return (wave1 + wave2 + wave3) / 3.0;
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  vec3 newPos = position;

  // Breathing - stronger
  float breath = sin(uTime * uBreathSpeed * 0.7) * 0.06;
  newPos += normal * breath;

  // Primary FBM noise
  float noiseFreq = 1.0 + uTurbulence * 0.8;
  float noiseTime = uTime * (0.1 + uTurbulence * 0.2);
  vec3 noisePos = position * noiseFreq + vec3(noiseTime);
  float noiseVal = fbm(noisePos);
  vNoise = noiseVal * 0.5 + 0.5;

  // Stronger displacement
  float displacement = noiseVal * uDisplacementStrength * (0.6 + uTurbulence * 0.5);

  // Add secondary wave pattern for extra motion
  float secWave = secondaryWave(position, uTime * uBreathSpeed);
  displacement += secWave * 0.15 * (1.0 + uTurbulence);

  // Additional pulsing wave ring
  float ringWave = sin(length(position.xz) * 4.0 - uTime * 2.0) * 0.08;
  displacement += ringWave;

  newPos += normal * displacement;

  // Recalc normals
  float eps = 0.02;
  float n1 = fbm(noisePos + vec3(eps, 0.0, 0.0));
  float n2 = fbm(noisePos + vec3(0.0, eps, 0.0));
  float n3 = fbm(noisePos + vec3(0.0, 0.0, eps));
  vec3 fakeNormal = normalize(vec3(n1 - noiseVal, n2 - noiseVal, n3 - noiseVal));
  vNormal = normalize(normalMatrix * (normal + fakeNormal * 0.15));

  vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
  vWorldPosition = worldPos.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
