import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useSim } from '../state/SimContext';
import { DEG } from '../astro/solar';

const ORBIT_R = 6;
const EARTH_R = 0.5;
const SUN_R = 0.9;

// Map doy -> position on orbit so that doy=172 (summer solstice) = (-R, 0, 0)
function earthPositionAt(doy: number): [number, number, number] {
  const theta = (2 * Math.PI * (doy - 172)) / 365;
  return [-ORBIT_R * Math.cos(theta), 0, ORBIT_R * Math.sin(theta)];
}

const SEASON_MARKERS = [
  { key: 'vernal', doy: 81 },
  { key: 'summerSolstice', doy: 172 },
  { key: 'autumnal', doy: 264 },
  { key: 'winterSolstice', doy: 355 },
] as const;

function OrbitRing() {
  const points = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      arr.push([-ORBIT_R * Math.cos(theta), 0, ORBIT_R * Math.sin(theta)]);
    }
    return arr;
  }, []);
  return <Line points={points} color="#7a8bb0" lineWidth={1.2} transparent opacity={0.7} />;
}

function EarthAtMarker({ doy, label, color }: { doy: number; label: string; color: string }) {
  const pos = earthPositionAt(doy);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html center distanceFactor={14} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            color: '#eaf0ff',
            fontSize: 11,
            background: 'rgba(10,18,48,0.7)',
            padding: '2px 6px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function Earth() {
  const { state } = useSim();
  const pos = earthPositionAt(state.doy);
  const tilt = state.axialTilt;

  // Axis always points in fixed direction in inertial frame: Y tilted toward +X by `tilt`
  // Visual: at earth, draw a rotated cylinder as the axis and a small equatorial disk.
  const axisQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    // Rotate Y (0,1,0) toward X by tilt around Z axis: this leans the pole toward +X
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -tilt * DEG);
    return q;
  }, [tilt]);

  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[EARTH_R, 32, 32]} />
        <meshStandardMaterial color="#3aa0f5" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Axis */}
      <group quaternion={axisQuat}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, EARTH_R * 2.6, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* North pole cap */}
        <mesh position={[0, EARTH_R * 1.3, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#ff5a5f" />
        </mesh>
        {/* South pole cap */}
        <mesh position={[0, -EARTH_R * 1.3, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#60a5fa" />
        </mesh>
        {/* Equator ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[EARTH_R * 1.01, 0.01, 8, 48]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function SunlightArrows() {
  const { state } = useSim();
  const earthPos = earthPositionAt(state.doy);
  const dir = new THREE.Vector3(earthPos[0], 0, earthPos[2]).normalize();
  const perp = new THREE.Vector3(-dir.z, 0, dir.x);
  const arrows: JSX.Element[] = [];
  for (let i = -2; i <= 2; i++) {
    const start = new THREE.Vector3()
      .copy(dir)
      .multiplyScalar(SUN_R + 0.2)
      .add(perp.clone().multiplyScalar(i * 0.4));
    const target = new THREE.Vector3()
      .copy(new THREE.Vector3(...earthPos))
      .add(perp.clone().multiplyScalar(i * 0.4));
    const length = start.distanceTo(target) - EARTH_R;
    arrows.push(
      <arrowHelper
        key={i}
        args={[
          new THREE.Vector3().subVectors(target, start).normalize(),
          start,
          Math.max(0, length),
          0xffcc3a,
          0.22,
          0.12,
        ]}
      />,
    );
  }
  return <>{arrows}</>;
}

export function OverheadView() {
  const { state, t } = useSim();
  const labels: Record<string, string> = {
    vernal: t.vernal,
    summerSolstice: t.summerSolstice,
    autumnal: t.autumnal,
    winterSolstice: t.winterSolstice,
  };

  return (
    <Canvas
      camera={{ position: [0, 12, 14], fov: 45 }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={[state.theme === 'dark' ? '#05081a' : '#e9eefb']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={60} decay={1} />
      <directionalLight position={[10, 12, 8]} intensity={0.4} />

      {/* Sun */}
      <mesh>
        <sphereGeometry args={[SUN_R, 32, 32]} />
        <meshBasicMaterial color="#ffcc3a" />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_R * 1.2, 32, 32]} />
        <meshBasicMaterial color="#ffcc3a" transparent opacity={0.18} />
      </mesh>

      <OrbitRing />
      {SEASON_MARKERS.map((m) => (
        <EarthAtMarker key={m.key} doy={m.doy} label={labels[m.key]} color="#7a8bb0" />
      ))}
      <Earth />
      <SunlightArrows />

      {/* Reference XZ plane grid */}
      <gridHelper args={[18, 18, '#3b425c', '#25304c']} position={[0, -0.01, 0]} />

      <OrbitControls enablePan={false} minDistance={7} maxDistance={30} />
    </Canvas>
  );
}
