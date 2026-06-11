varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDistortion;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uOpacity;
uniform float uTime;
uniform float uTurbulence;
uniform float uHueShift;
uniform float uTimeRatio;

vec3 shiftHue(vec3 color, float shift) {
  vec3 k = vec3(0.57735);
  float angle = shift * 6.28318;
  float c = cos(angle);
  float s = sin(angle);
  return color * c + cross(k, color) * s + k * dot(k, color) * (1.0 - c);
}

// Cosine palette (Inigo Quilez) — drives a secondary chromatic shimmer
vec3 cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec3 c1 = shiftHue(uColor1, uHueShift);
  vec3 c2 = shiftHue(uColor2, uHueShift);

  // Distortion drives the primary transition c1 -> c2
  float tNorm = clamp(vDistortion * 0.5 + 0.5, 0.0, 1.0);
  vec3 base = mix(c1, c2, smoothstep(0.25, 0.75, tNorm));

  // Secondary cosine palette shimmer (Kafka-style chromatic flicker)
  vec3 paletteA = vec3(0.5, 0.45, 0.4);
  vec3 paletteB = vec3(0.4, 0.3, 0.25);
  vec3 paletteC = vec3(1.0, 0.9, 0.8);
  vec3 paletteD = vec3(0.0, 0.15, 0.25);
  vec3 shimmer = cosinePalette(tNorm + uTime * 0.05, paletteA, paletteB, paletteC, paletteD);
  base += shimmer * 0.08 * (0.4 + uTurbulence);

  // High-noise regions → white
  base = mix(base, uColor3, smoothstep(0.55, 1.0, tNorm) * 0.5);

  // Urgency pushes to white
  float urgency = 1.0 - uTimeRatio;
  base = mix(base, uColor3, urgency * 0.3);

  // Fresnel rim
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float ndotv = max(dot(vNormal, viewDir), 0.0);
  float fresnel = pow(1.0 - ndotv, 2.8);
  vec3 rim = mix(c1, vec3(0.95, 0.97, 1.0), 0.5);
  base += rim * fresnel * 0.55;

  // Specular
  vec3 lightDir = normalize(vec3(4.0, 5.0, 6.0));
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(halfDir, vNormal), 0.0), 28.0) * 0.45;
  base += vec3(spec);

  // Brightness floor
  base = max(base, c1 * 0.5 + vec3(0.28));

  // Edge vignette (subtle)
  float edgeDist = length(vUv - 0.5) * 2.0;
  float vignette = 1.0 - smoothstep(0.65, 1.0, edgeDist);
  base = mix(base, base * 1.04, (1.0 - vignette) * 0.25);

  base = clamp(base, vec3(0.0), vec3(1.0));
  gl_FragColor = vec4(base, uOpacity);
}
