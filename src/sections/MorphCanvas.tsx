import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import blobVert from '../shaders/blob.vert?raw';
import blobFrag from '../shaders/blob.frag?raw';
import latticeVert from '../shaders/lattice.vert?raw';
import latticeFrag from '../shaders/lattice.frag?raw';
import metamorphVert from '../shaders/metamorph.vert?raw';
import metamorphFrag from '../shaders/metamorph.frag?raw';
import particlesVert from '../shaders/particles.vert?raw';
import particlesFrag from '../shaders/particles.frag?raw';
import type { Theme } from '../types/theme';

export type MorphStyle = 'blob' | 'lattice' | 'metamorph' | 'particles';

interface BaseMeshProps {
  isRunning: boolean;
  isCompleted: boolean;
  timeLeftMs: number;
  totalTimeMs: number;
  density: number;
  turbulence: number;
  hueShift: number;
  breathSpeed: number;
  theme: Theme;
}

function SceneLights({ theme }: { theme: Theme }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.2} castShadow={false} />
      <pointLight position={[-10, -10, -5]} intensity={0.35} color={theme.color2} />
      <pointLight position={[10, -5, 10]} intensity={0.25} color={theme.color2} />
      <pointLight position={[0, 10, 0]} intensity={0.2} color="#FFFFFF" />
      <pointLight position={[0, 0, -8]} intensity={0.15} color={theme.color1} />
    </>
  );
}

// ---- STYLE 0: BLOB ----
function BlobMesh({ isRunning, isCompleted, timeLeftMs, totalTimeMs, density, turbulence, hueShift, breathSpeed, theme }: BaseMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0.45);
  const timeRatio = totalTimeMs > 0 ? Math.max(0, Math.min(1, timeLeftMs / totalTimeMs)) : 1;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uTurbulence: { value: turbulence },
    uColor1: { value: new THREE.Color(theme.color1) }, uColor2: { value: new THREE.Color(theme.color2) }, uColor3: { value: new THREE.Color(theme.color3) },
    uOpacity: { value: 0.88 }, uDisplacementStrength: { value: density },
    uHueShift: { value: hueShift }, uBreathSpeed: { value: breathSpeed }, uTimeRatio: { value: timeRatio },
  }), []);

  useEffect(() => {
    if (!meshRef.current) return;
    const m = meshRef.current.material as THREE.ShaderMaterial;
    (m.uniforms.uColor1.value as THREE.Color).set(theme.color1);
    (m.uniforms.uColor2.value as THREE.Color).set(theme.color2);
    (m.uniforms.uColor3.value as THREE.Color).set(theme.color3);
    m.uniforms.uTurbulence.value = isCompleted ? 0.1 : isRunning ? turbulence + (1 - timeRatio) * 1.0 : turbulence * 0.25;
    m.uniforms.uDisplacementStrength.value = isCompleted ? 0.2 : density;
    m.uniforms.uHueShift.value = hueShift;
    m.uniforms.uTimeRatio.value = isCompleted ? 0 : timeRatio;
    m.uniforms.uOpacity.value = isCompleted ? 0.3 : 0.88;
  }, [theme, density, turbulence, hueShift, timeRatio, isRunning, isCompleted]);

  useFrame((_, d) => {
    if (!meshRef.current) return;
    const m = meshRef.current.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value += d;
    const u = 1.0 - timeRatio;
    m.uniforms.uTurbulence.value = THREE.MathUtils.lerp(m.uniforms.uTurbulence.value, isCompleted ? 0.05 : isRunning ? turbulence + u * 1.2 : turbulence * 0.15, 0.04);
    const ts = isCompleted ? 0.25 : isRunning ? 0.45 + Math.sin(m.uniforms.uTime.value * 0.8) * 0.03 : 0.42;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, ts, 0.05);
    meshRef.current.scale.setScalar(scaleRef.current);
    meshRef.current.rotation.y += d * 0.08;
    meshRef.current.rotation.x = Math.sin(m.uniforms.uTime.value * 0.12) * 0.06;
  });

  return <mesh ref={meshRef} scale={0.45}><sphereGeometry args={[3.2, 96, 96]} /><shaderMaterial vertexShader={blobVert} fragmentShader={blobFrag} uniforms={uniforms} transparent side={THREE.DoubleSide} /></mesh>;
}

// ---- STYLE 2: LATTICE ----
function LatticeMesh({ isRunning, isCompleted, timeLeftMs, totalTimeMs, density, turbulence, hueShift, breathSpeed, theme }: BaseMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0.45);
  const timeRatio = totalTimeMs > 0 ? Math.max(0, Math.min(1, timeLeftMs / totalTimeMs)) : 1;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uTurbulence: { value: turbulence },
    uColor1: { value: new THREE.Color(theme.color1) }, uColor2: { value: new THREE.Color(theme.color2) }, uColor3: { value: new THREE.Color(theme.color3) },
    uOpacity: { value: 0.88 }, uDisplacementStrength: { value: density },
    uHueShift: { value: hueShift }, uBreathSpeed: { value: breathSpeed }, uTimeRatio: { value: timeRatio },
  }), []);

  useEffect(() => {
    if (!meshRef.current) return;
    const m = meshRef.current.material as THREE.ShaderMaterial;
    (m.uniforms.uColor1.value as THREE.Color).set(theme.color1);
    (m.uniforms.uColor2.value as THREE.Color).set(theme.color2);
    (m.uniforms.uColor3.value as THREE.Color).set(theme.color3);
    m.uniforms.uTurbulence.value = isCompleted ? 0.1 : isRunning ? turbulence + (1 - timeRatio) * 1.0 : turbulence * 0.25;
    m.uniforms.uDisplacementStrength.value = isCompleted ? 0.2 : density;
    m.uniforms.uHueShift.value = hueShift;
    m.uniforms.uTimeRatio.value = isCompleted ? 0 : timeRatio;
    m.uniforms.uOpacity.value = isCompleted ? 0.3 : 0.88;
  }, [theme, density, turbulence, hueShift, timeRatio, isRunning, isCompleted]);

  useFrame((_, d) => {
    if (!meshRef.current) return;
    const m = meshRef.current.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value += d;
    const u = 1.0 - timeRatio;
    m.uniforms.uTurbulence.value = THREE.MathUtils.lerp(m.uniforms.uTurbulence.value, isCompleted ? 0.05 : isRunning ? turbulence + u * 1.2 : turbulence * 0.15, 0.04);
    const ts = isCompleted ? 0.25 : isRunning ? 0.45 + Math.sin(m.uniforms.uTime.value * 0.7) * 0.025 : 0.425;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, ts, 0.05);
    meshRef.current.scale.setScalar(scaleRef.current);
    meshRef.current.rotation.y += d * 0.06;
    meshRef.current.rotation.x = Math.sin(m.uniforms.uTime.value * 0.08) * 0.03;
  });

  return <mesh ref={meshRef} scale={0.45}><sphereGeometry args={[3.2, 96, 96]} /><shaderMaterial vertexShader={latticeVert} fragmentShader={latticeFrag} uniforms={uniforms} transparent side={THREE.DoubleSide} /></mesh>;
}

// ---- STYLE 3: METAMORPH (Perlin-displaced icosahedron with static wireframe cage) ----
function MetamorphMesh({ isRunning, isCompleted, timeLeftMs, totalTimeMs, density, turbulence, hueShift, breathSpeed, theme }: BaseMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0.45);
  const timeRatio = totalTimeMs > 0 ? Math.max(0, Math.min(1, timeLeftMs / totalTimeMs)) : 1;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uTurbulence: { value: turbulence },
    uColor1: { value: new THREE.Color(theme.color1) }, uColor2: { value: new THREE.Color(theme.color2) }, uColor3: { value: new THREE.Color(theme.color3) },
    uOpacity: { value: 0.9 }, uDisplacementStrength: { value: density },
    uHueShift: { value: hueShift }, uBreathSpeed: { value: breathSpeed }, uTimeRatio: { value: timeRatio },
  }), []);

  useEffect(() => {
    if (!meshRef.current) return;
    const m = meshRef.current.material as THREE.ShaderMaterial;
    (m.uniforms.uColor1.value as THREE.Color).set(theme.color1);
    (m.uniforms.uColor2.value as THREE.Color).set(theme.color2);
    (m.uniforms.uColor3.value as THREE.Color).set(theme.color3);
    m.uniforms.uTurbulence.value = isCompleted ? 0.1 : isRunning ? turbulence + (1 - timeRatio) * 1.0 : turbulence * 0.25;
    m.uniforms.uDisplacementStrength.value = isCompleted ? 0.2 : density;
    m.uniforms.uHueShift.value = hueShift;
    m.uniforms.uTimeRatio.value = isCompleted ? 0 : timeRatio;
    m.uniforms.uOpacity.value = isCompleted ? 0.3 : 0.9;
  }, [theme, density, turbulence, hueShift, timeRatio, isRunning, isCompleted]);

  useFrame((_, d) => {
    if (!meshRef.current || !groupRef.current) return;
    const m = meshRef.current.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value += d;
    const u = 1.0 - timeRatio;
    m.uniforms.uTurbulence.value = THREE.MathUtils.lerp(m.uniforms.uTurbulence.value, isCompleted ? 0.05 : isRunning ? turbulence + u * 1.2 : turbulence * 0.15, 0.04);
    const ts = isCompleted ? 0.25 : isRunning ? 0.45 + Math.sin(m.uniforms.uTime.value * 0.7) * 0.025 : 0.425;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, ts, 0.05);
    groupRef.current.scale.setScalar(scaleRef.current);
    groupRef.current.rotation.y += d * 0.07;
    groupRef.current.rotation.x = Math.sin(m.uniforms.uTime.value * 0.1) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[3.2, 60]} />
        <shaderMaterial vertexShader={metamorphVert} fragmentShader={metamorphFrag} uniforms={uniforms} transparent side={THREE.DoubleSide} />
      </mesh>
      {/* Static wireframe cage — undeformed, sits slightly larger to avoid z-fighting */}
      <mesh>
        <icosahedronGeometry args={[3.22, 4]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

// ---- STYLE 4: PARTICLES (TorusKnot point sculpture with mouse-driven rotation + debris) ----
function ParticlesMesh({ isRunning, isCompleted, timeLeftMs, totalTimeMs, density, turbulence, hueShift, breathSpeed, theme }: BaseMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const debrisRef = useRef<THREE.Points>(null);
  const targetRot = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(0.34);
  const timeRatio = totalTimeMs > 0 ? Math.max(0, Math.min(1, timeLeftMs / totalTimeMs)) : 1;
  const { pointer } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uTurbulence: { value: turbulence },
    uColor1: { value: new THREE.Color(theme.color1) }, uColor2: { value: new THREE.Color(theme.color2) }, uColor3: { value: new THREE.Color(theme.color3) },
    uOpacity: { value: 0.85 }, uDisplacementStrength: { value: density },
    uHueShift: { value: hueShift }, uBreathSpeed: { value: breathSpeed }, uTimeRatio: { value: timeRatio },
  }), []);

  const debrisGeometry = useMemo(() => {
    const count = 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 14;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useEffect(() => {
    if (!pointsRef.current) return;
    const m = pointsRef.current.material as THREE.ShaderMaterial;
    (m.uniforms.uColor1.value as THREE.Color).set(theme.color1);
    (m.uniforms.uColor2.value as THREE.Color).set(theme.color2);
    (m.uniforms.uColor3.value as THREE.Color).set(theme.color3);
    m.uniforms.uTurbulence.value = isCompleted ? 0.1 : isRunning ? turbulence + (1 - timeRatio) * 1.0 : turbulence * 0.25;
    m.uniforms.uDisplacementStrength.value = isCompleted ? 0.2 : density;
    m.uniforms.uHueShift.value = hueShift;
    m.uniforms.uTimeRatio.value = isCompleted ? 0 : timeRatio;
    m.uniforms.uOpacity.value = isCompleted ? 0.35 : 0.85;
  }, [theme, density, turbulence, hueShift, timeRatio, isRunning, isCompleted]);

  useFrame((_, d) => {
    if (!pointsRef.current || !groupRef.current) return;
    const m = pointsRef.current.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value += d;
    const u = 1.0 - timeRatio;
    m.uniforms.uTurbulence.value = THREE.MathUtils.lerp(m.uniforms.uTurbulence.value, isCompleted ? 0.05 : isRunning ? turbulence + u * 1.2 : turbulence * 0.15, 0.04);
    const ts = isCompleted ? 0.18 : isRunning ? 0.34 + Math.sin(m.uniforms.uTime.value * 0.5) * 0.015 : 0.32;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, ts, 0.05);
    groupRef.current.scale.setScalar(scaleRef.current);

    // Mouse-driven rotation on the sculpture
    targetRot.current.x = pointer.y * 0.3;
    targetRot.current.y = pointer.x * 0.5;
    pointsRef.current.rotation.x += 0.05 * (targetRot.current.x - pointsRef.current.rotation.x);
    pointsRef.current.rotation.y += 0.05 * (targetRot.current.y - pointsRef.current.rotation.y);

    // Slow drift on debris
    if (debrisRef.current) {
      debrisRef.current.rotation.y += d * 0.02;
      debrisRef.current.rotation.x += d * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} scale={[1, 1.4, 0.8]}>
        <torusKnotGeometry args={[2, 0.65, 220, 48]} />
        <shaderMaterial
          vertexShader={particlesVert}
          fragmentShader={particlesFrag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
      <points ref={debrisRef} geometry={debrisGeometry}>
        <pointsMaterial size={0.04} color={theme.color3} transparent opacity={0.35} sizeAttenuation />
      </points>
    </group>
  );
}

// ---- MAIN COMPONENT ----
interface MorphCanvasProps {
  style: MorphStyle;
  isRunning: boolean;
  isCompleted: boolean;
  timeLeftMs: number;
  totalTimeMs: number;
  density: number;
  turbulence: number;
  hueShift: number;
  breathSpeed: number;
  theme: Theme;
}

export default function MorphCanvas({ style, theme, ...rest }: MorphCanvasProps) {
  const props = { ...rest, theme };
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 34 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ background: 'transparent' }}>
        <SceneLights theme={theme} />
        {style === 'blob' && <BlobMesh key="blob" {...props} />}
        {style === 'lattice' && <LatticeMesh key="lattice" {...props} />}
        {style === 'metamorph' && <MetamorphMesh key="metamorph" {...props} />}
        {style === 'particles' && <ParticlesMesh key="particles" {...props} />}
      </Canvas>
    </div>
  );
}
