varying vec2 vUv;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vWorldPosition;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTime;
uniform float uTurbulence;
uniform float uOpacity;
uniform float uHueShift;
uniform float uTimeRatio;

// Hue rotation via Rodrigues formula around (1,1,1) axis
vec3 shiftHue(vec3 color, float shift) {
  vec3 k = vec3(0.57735);
  float angle = shift * 6.28318;
  float c = cos(angle);
  float s = sin(angle);
  return color * c + cross(k, color) * s + k * dot(k, color) * (1.0 - c);
}

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float ndotv = max(dot(vNormal, viewDir), 0.0);
  float fresnel = pow(1.0 - ndotv, 3.0);

  float t = vNoise;

  // Apply hue shift to base colors BEFORE mixing with white
  vec3 c1 = shiftHue(uColor1, uHueShift);
  vec3 c2 = shiftHue(uColor2, uHueShift);

  // Layer 1: shifted blue to pale blue
  vec3 col = mix(c1, c2, smoothstep(0.2, 0.6, t));

  // Layer 2: add white in high-noise regions
  col = mix(col, uColor3, smoothstep(0.5, 0.9, t) * 0.6);

  // Layer 3: urgency pushes everything toward white
  float urgency = 1.0 - uTimeRatio;
  col = mix(col, uColor3, urgency * 0.4);

  // --- Fresnel rim: glow using shifted primary color ---
  vec3 rimColor = mix(c1, vec3(0.75, 0.88, 1.0), 0.5);
  col += rimColor * fresnel * 0.6;

  // --- Specular ---
  vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
  vec3 halfDir = normalize(lightDir + viewDir);
  float specAngle = max(dot(halfDir, vNormal), 0.0);
  float specular = pow(specAngle, 32.0) * 0.5;
  col += vec3(specular);

  // --- Turbulence bright streaks ---
  float turbStreak = smoothstep(0.55, 1.0, vNoise) * uTurbulence;
  col += c1 * turbStreak * 0.2;

  // --- Breathing ---
  float breathe = sin(uTime * 1.5) * 0.04 + 1.0;
  col *= breathe;

  // --- Brightness floor ---
  // Brightness floor tinted by theme primary so each palette reads right
  col = max(col, c1 * 0.5 + vec3(0.3));

  // --- Edge ---
  float edgeDist = length(vUv - 0.5) * 2.0;
  float vignette = 1.0 - smoothstep(0.6, 1.0, edgeDist);
  col = mix(col, col * 1.05, (1.0 - vignette) * 0.3);

  col = clamp(col, vec3(0.0), vec3(1.0));
  gl_FragColor = vec4(col, uOpacity);
}
