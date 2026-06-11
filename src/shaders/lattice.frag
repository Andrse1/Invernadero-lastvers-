varying vec2 vUv;
varying vec3 vNormal;
varying float vLattice;
varying vec3 vWorldPosition;
varying float vRidge;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTime;
uniform float uTurbulence;
uniform float uOpacity;
uniform float uHueShift;
uniform float uTimeRatio;

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

  float t = vLattice * 0.5 + 0.5;

  // Apply hue shift to base colors BEFORE mixing
  vec3 c1 = shiftHue(uColor1, uHueShift);
  vec3 c2 = shiftHue(uColor2, uHueShift);

  // Contour bands
  float contour = smoothstep(0.45, 0.55, fract(t * 5.0));

  // Base colors with shifted hues
  vec3 col = mix(c2, c1, contour);

  // Ridge highlight
  float ridgeLine = smoothstep(0.5, 0.7, vRidge);
  col = mix(col, uColor3, ridgeLine * 0.6);

  // Peak tops
  float peak = smoothstep(0.7, 1.0, t);
  col += c1 * peak * 0.4;

  // Urgency
  float urgency = 1.0 - uTimeRatio;
  col = mix(col, uColor3, urgency * 0.3);

  // Turbulence streaks
  float streak = smoothstep(0.4, 0.8, vRidge) * uTurbulence;
  col += c1 * streak * 0.25;

  // Valley fill
  float valley = smoothstep(0.0, 0.35, t);
  col = mix(c2 * 0.7, col, valley * 0.85 + 0.15);

  // Fresnel rim
  col += mix(c1, vec3(0.75, 0.88, 1.0), 0.5) * fresnel * 0.55;

  // Specular
  vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
  vec3 halfDir = normalize(lightDir + viewDir);
  float specAngle = max(dot(halfDir, vNormal), 0.0);
  float specular = pow(specAngle, 30.0) * 0.5;
  col += vec3(specular);

  // Breathing
  float breathe = sin(uTime * 1.5) * 0.04 + 1.0;
  col *= breathe;

  // Brightness floor tinted by theme primary so each palette reads right
  col = max(col, c1 * 0.5 + vec3(0.25));

  // Edge
  float edgeDist = length(vUv - 0.5) * 2.0;
  float vignette = 1.0 - smoothstep(0.6, 1.0, edgeDist);
  col = mix(col, col * 1.05, (1.0 - vignette) * 0.25);

  col = clamp(col, vec3(0.0), vec3(1.0));
  gl_FragColor = vec4(col, uOpacity);
}
