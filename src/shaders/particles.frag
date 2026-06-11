uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uOpacity;
uniform float uTurbulence;
uniform float uHueShift;
uniform float uTimeRatio;

varying float vNoise;

vec3 shiftHue(vec3 color, float shift) {
  vec3 k = vec3(0.57735);
  float angle = shift * 6.28318;
  float c = cos(angle);
  float s = sin(angle);
  return color * c + cross(k, color) * s + k * dot(k, color) * (1.0 - c);
}

void main() {
  vec2 xy = gl_PointCoord.xy - vec2(0.5);
  float dist = length(xy);
  if (dist > 0.5) discard;

  vec3 c1 = shiftHue(uColor1, uHueShift);
  vec3 c2 = shiftHue(uColor2, uHueShift);

  vec3 base = mix(c2, c1, vNoise * 0.5 + 0.5);
  base = mix(base, uColor3, smoothstep(0.3, 0.9, vNoise) * 0.6);

  // Urgency tint
  float urgency = 1.0 - uTimeRatio;
  base = mix(base, uColor3, urgency * 0.35);

  // Turbulence boost
  base += c1 * smoothstep(0.4, 0.9, vNoise) * uTurbulence * 0.15;

  // Soft disk alpha
  float alpha = (0.5 - dist) * 2.0;
  alpha *= smoothstep(-0.8, 0.4, vNoise);
  alpha *= uOpacity;

  gl_FragColor = vec4(base, alpha);
}
