import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { useMemo } from 'react';
import { useSim } from '../state/SimContext';
import {
  solarDeclinationDeg,
  solarPosition,
  altAzToVector,
  meridianAltitudeDeg,
  dayLengthInfo,
  sunriseAzimuthDeg,
  sunsetAzimuthDeg,
  dailySolarPath,
  formatHourHM,
} from '../astro/solar';

const R = 5;

function DomeAndGround() {
  const { state } = useSim();
  return (
    <>
      {/* Ground disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R * 1.05, 64]} />
        <meshStandardMaterial
          color={state.theme === 'dark' ? '#1b253e' : '#bac4d6'}
          roughness={1}
        />
      </mesh>
      {/* Hemisphere wireframe */}
      <mesh>
        <sphereGeometry args={[R, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          color={state.theme === 'dark' ? '#29365a' : '#c8d3ea'}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
    </>
  );
}

function CardinalLabels() {
  const { t } = useSim();
  const labels: { text: string; pos: [number, number, number] }[] = [
    { text: t.north, pos: [0, 0.05, -R * 1.08] },
    { text: t.east, pos: [R * 1.08, 0.05, 0] },
    { text: t.south, pos: [0, 0.05, R * 1.08] },
    { text: t.west, pos: [-R * 1.08, 0.05, 0] },
  ];
  return (
    <>
      {labels.map((l) => (
        <Html
          key={l.text}
          position={l.pos}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              color: '#f6b11a',
              fontSize: 13,
              fontWeight: 700,
              textShadow: '0 0 6px rgba(0,0,0,0.6)',
            }}
          >
            {l.text}
          </div>
        </Html>
      ))}
    </>
  );
}

function SunPath() {
  const { state } = useSim();
  const decl = solarDeclinationDeg(state.doy, state.axialTilt);
  const points = useMemo<[number, number, number][]>(() => {
    const samples = dailySolarPath(state.latitude, decl, 193);
    const pts: [number, number, number][] = [];
    samples.forEach(({ altitudeDeg, azimuthDeg }) => {
      if (altitudeDeg < -0.5) return;
      const [x, y, z] = altAzToVector(altitudeDeg, azimuthDeg);
      pts.push([x * R, y * R, z * R]);
    });
    return pts;
  }, [state.latitude, decl]);

  if (points.length < 2) return null;
  return <Line points={points} color="#ffcc3a" lineWidth={2} />;
}

function SunMarker() {
  const { state } = useSim();
  const decl = solarDeclinationDeg(state.doy, state.axialTilt);
  const pos = solarPosition(state.latitude, decl, state.hour);
  const [x, y, z] = altAzToVector(pos.altitudeDeg, pos.azimuthDeg);
  const below = pos.altitudeDeg < 0;
  return (
    <>
      <mesh position={[x * R, y * R, z * R]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color={below ? '#4a5580' : '#ffcc3a'} />
      </mesh>
      {!below && (
        <mesh position={[x * R, y * R, z * R]}>
          <sphereGeometry args={[0.36, 16, 16]} />
          <meshBasicMaterial color="#ffcc3a" transparent opacity={0.25} />
        </mesh>
      )}
    </>
  );
}

function CardinalCross() {
  const ew: [number, number, number][] = [
    [-R * 1.02, 0.01, 0],
    [R * 1.02, 0.01, 0],
  ];
  const ns: [number, number, number][] = [
    [0, 0.01, -R * 1.02],
    [0, 0.01, R * 1.02],
  ];
  return (
    <>
      <Line points={ew} color="#8a97bc" lineWidth={1} transparent opacity={0.7} />
      <Line points={ns} color="#8a97bc" lineWidth={1} transparent opacity={0.7} />
    </>
  );
}

function Readouts() {
  const { state, t } = useSim();
  const decl = solarDeclinationDeg(state.doy, state.axialTilt);
  const noon = meridianAltitudeDeg(state.latitude, decl);
  const dayInfo = dayLengthInfo(state.latitude, decl);
  const srAz = sunriseAzimuthDeg(state.latitude, decl);
  const ssAz = sunsetAzimuthDeg(state.latitude, decl);
  const now = solarPosition(state.latitude, decl, state.hour);

  const fmtH = (h: number | null) => (h == null ? '—' : formatHourHM(h));
  const polarLabel =
    dayInfo.polar === 'day' ? t.polarDay : dayInfo.polar === 'night' ? t.polarNight : null;

  return (
    <div className="readouts">
      <div><span className="k">{t.solarDeclination}</span><span className="v">{decl.toFixed(1)}°</span></div>
      <div><span className="k">{t.meridianAltitude}</span><span className="v">{noon.toFixed(1)}°</span></div>
      <div><span className="k">{t.dayLength}</span><span className="v">{dayInfo.hours.toFixed(2)} {t.hours}</span></div>
      <div><span className="k">{t.sunriseTime}</span><span className="v">{fmtH(dayInfo.sunriseHour)}</span></div>
      <div><span className="k">{t.sunsetTime}</span><span className="v">{fmtH(dayInfo.sunsetHour)}</span></div>
      <div><span className="k">{t.sunriseAzimuth}</span><span className="v">{srAz == null ? '—' : srAz.toFixed(0) + '°'}</span></div>
      <div><span className="k">{t.sunsetAzimuth}</span><span className="v">{ssAz == null ? '—' : ssAz.toFixed(0) + '°'}</span></div>
      <div><span className="k">alt/az</span><span className="v">{now.altitudeDeg.toFixed(1)}° / {now.azimuthDeg.toFixed(0)}°</span></div>
      {polarLabel && (
        <div style={{ gridColumn: '1 / span 2', color: 'var(--accent)' }}>{polarLabel}</div>
      )}
    </div>
  );
}

export function SkyView() {
  const { state } = useSim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Canvas
          camera={{ position: [R * 1.4, R * 1.0, R * 1.4], fov: 45 }}
          dpr={[1, 2]}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={[state.theme === 'dark' ? '#0a1230' : '#c9dcf8']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={0.6} />
          <DomeAndGround />
          <CardinalCross />
          <CardinalLabels />
          <SunPath />
          <SunMarker />
          <OrbitControls enablePan={false} minDistance={4} maxDistance={20} maxPolarAngle={Math.PI / 2 + 0.1} />
        </Canvas>
      </div>
      <div style={{ padding: '8px 4px 0' }}>
        <Readouts />
      </div>
    </div>
  );
}
