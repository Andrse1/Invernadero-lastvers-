varying vec2 vUv;
varying vec3 vNormal;
varying float vLattice;
varying vec3 vWorldPosition;
varying float vRidge;

uniform float uTime;
uniform float uTurbulence;
uniform float uDisplacementStrength;
uniform float uBreathSpeed;

// Clean crystal lattice: low-frequency intersecting wave planes
float crystalField(vec3 p, float t, float turb) {
  // Three primary wave planes at different angles
  // Classic gyroid-like pattern but much cleaner
  float w1 = cos(p.x * 1.8 + t * 0.4) + cos(p.y * 1.8 + t * 0.35) * 0.8;
  float w2 = cos(p.y * 1.6 + t * 0.3) + cos(p.z * 1.6 + t * 0.45) * 0.8;
  float w3 = cos(p.z * 1.4 + t * 0.38) + cos(p.x * 1.4 + t * 0.32) * 0.8;

  // Blend into single smooth field
  float field = (w1 + w2 + w3) / 3.0;

  // Slow rotating wave - adds gentle motion without speckle
  float angle = atan(p.y, p.x);
  float radius = length(p.xy);
  float spiral = cos(radius * 2.5 - angle * 2.0 + t * 0.5 * uBreathSpeed) * 0.25;
  field += spiral;

  // Very subtle turbulence - only low freq, no high-freq noise
  float turbWave = cos(p.x * 2.2 + p.y * 1.7 - t * 0.6) * cos(p.z * 1.9 - p.x * 1.5 + t * 0.5) * 0.15;
  field += turbWave * turb;

  return field;
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  vec3 newPos = position;

  // Breathing
  float breath = sin(uTime * uBreathSpeed * 0.5) * 0.035;
  newPos += normal * breath;

  // Crystal lattice displacement
  float latticeVal = crystalField(position, uTime, uTurbulence);
  vLattice = latticeVal;

  // Displacement
  float displacement = latticeVal * uDisplacementStrength * (0.5 + uTurbulence * 0.35);
  newPos += normal * displacement;

  // Recalculate normals for ridge detection
  float eps = 0.03;
  float n1 = crystalField(position + vec3(eps, 0.0, 0.0), uTime, uTurbulence);
  float n2 = crystalField(position + vec3(0.0, eps, 0.0), uTime, uTurbulence);
  float n3 = crystalField(position + vec3(0.0, 0.0, eps), uTime, uTurbulence);
  float grad = length(vec3(n1 - latticeVal, n2 - latticeVal, n3 - latticeVal));
  vRidge = grad;

  vec3 fakeNormal = normalize(vec3(n1 - latticeVal, n2 - latticeVal, n3 - latticeVal));
  vNormal = normalize(normalMatrix * (normal + fakeNormal * 0.15));

  vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
  vWorldPosition = worldPos.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
