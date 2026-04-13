import { useMemo, useState } from 'react';
import { useSim } from '../state/SimContext';
import {
  solarDeclinationDeg,
  meridianAltitudeDeg,
  dayLengthInfo,
  dailySolarPath,
} from '../astro/solar';


const W = 320;
const H = 110;
const PAD_L = 32;
const PAD_R = 8;
const PAD_T = 10;
const PAD_B = 18;

function useAnnualSeries(latitude: number, axialTilt: number) {
  return useMemo(() => {
    const dayLen: number[] = [];
    const noonAlt: number[] = [];
    for (let d = 1; d <= 365; d++) {
      const decl = solarDeclinationDeg(d, axialTilt);
      dayLen.push(dayLengthInfo(latitude, decl).hours);
      noonAlt.push(meridianAltitudeDeg(latitude, decl));
    }
    return { dayLen, noonAlt };
  }, [latitude, axialTilt]);
}

const MONTH_TICKS = [
  { doy: 1, label: '1' },
  { doy: 60, label: '3' },
  { doy: 121, label: '5' },
  { doy: 182, label: '7' },
  { doy: 244, label: '9' },
  { doy: 305, label: '11' },
];

function LineGraph({
  title,
  values,
  yMin,
  yMax,
  unit,
  currentDoy,
  highlight,
}: {
  title: string;
  values: number[];
  yMin: number;
  yMax: number;
  unit: string;
  currentDoy: number;
  highlight: string;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; value: number; doy: number } | null>(null);
  const xOf = (doy: number) => PAD_L + ((doy - 1) / 364) * (W - PAD_L - PAD_R);
  const yOf = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  const path = useMemo(() => {
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${xOf(i + 1).toFixed(1)},${yOf(v).toFixed(1)}`)
      .join(' ');
  }, [values, yMin, yMax]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xPix = ((e.clientX - rect.left) / rect.width) * W;
    const doy = Math.max(1, Math.min(365, Math.round(((xPix - PAD_L) / (W - PAD_L - PAD_R)) * 364 + 1)));
    const v = values[doy - 1];
    setTip({ x: xOf(doy), y: yOf(v), value: v, doy });
  };

  return (
    <div className="graph-card" style={{ position: 'relative' }}>
      <div className="graph-title">{title}</div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        onMouseMove={onMove}
        onMouseLeave={() => setTip(null)}
      >
        {/* grid y */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD_T + f * (H - PAD_T - PAD_B);
          return (
            <line
              key={f}
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y}
              y2={y}
              stroke="var(--chart-grid)"
              strokeDasharray="2 3"
            />
          );
        })}
        {/* axis labels y */}
        {[yMax, (yMax + yMin) / 2, yMin].map((v, i) => (
          <text
            key={i}
            x={PAD_L - 4}
            y={PAD_T + (i * (H - PAD_T - PAD_B)) / 2 + 3}
            textAnchor="end"
            fontSize="9"
            fill="var(--fg-muted)"
          >
            {v.toFixed(0)}
          </text>
        ))}
        {/* month ticks */}
        {MONTH_TICKS.map((m) => (
          <text
            key={m.doy}
            x={xOf(m.doy)}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="var(--fg-muted)"
          >
            {m.label}
          </text>
        ))}
        {/* line */}
        <path d={path} fill="none" stroke={highlight} strokeWidth={1.8} />
        {/* current doy marker */}
        <line
          x1={xOf(currentDoy)}
          x2={xOf(currentDoy)}
          y1={PAD_T}
          y2={H - PAD_B}
          stroke="var(--accent)"
          strokeDasharray="3 3"
        />
        <circle cx={xOf(currentDoy)} cy={yOf(values[currentDoy - 1])} r={3} fill="var(--accent)" />
        {tip && (
          <>
            <circle cx={tip.x} cy={tip.y} r={3} fill={highlight} />
          </>
        )}
      </svg>
      {tip && (
        <div className="hover-tooltip" style={{ left: (tip.x / W) * 100 + '%', top: tip.y - 24 }}>
          d={tip.doy}: {tip.value.toFixed(1)}{unit}
        </div>
      )}
    </div>
  );
}

function SeasonalPaths() {
  const { state, t } = useSim();
  const seasons = [
    { doy: 172, color: '#f5b301', labelKey: 'summer' as const },
    { doy: 81,  color: '#60a5fa', labelKey: 'equinox' as const },
    { doy: 355, color: '#ef4444', labelKey: 'winter' as const },
  ];
  const width = 320;
  const height = 130;
  const cx = width / 2;
  const cy = height - 14;
  const radius = Math.min(width / 2 - 16, height - 24);

  const projection = (altDeg: number, azDeg: number) => {
    // Simple stereographic-like projection to 2D: polar with horizon on outer circle.
    // r = (1 - alt/90) * radius, angle measured from N clockwise (azDeg)
    if (altDeg < 0) return null;
    const r = (1 - altDeg / 90) * radius;
    const theta = (azDeg - 180) * (Math.PI / 180); // S=0 for aesthetic top orientation
    return { x: cx + r * Math.sin(theta), y: cy - r * Math.cos(theta) };
  };

  return (
    <div className="graph-card">
      <div className="graph-title">{t.seasonalPaths}</div>
      <svg viewBox={`0 0 ${width} ${height}`}>
        {/* Horizon circle */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--chart-grid)" strokeDasharray="2 2" />
        <circle cx={cx} cy={cy} r={radius * 0.66} fill="none" stroke="var(--chart-grid)" strokeDasharray="2 2" />
        <circle cx={cx} cy={cy} r={radius * 0.33} fill="none" stroke="var(--chart-grid)" strokeDasharray="2 2" />
        {/* Cardinals - N at bottom (toward viewer standing facing south) */}
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="var(--fg-muted)">{t.north}</text>
        <text x={cx} y={cy - radius - 2} textAnchor="middle" fontSize="10" fill="var(--fg-muted)">{t.south}</text>
        <text x={cx + radius + 6} y={cy + 3} textAnchor="start" fontSize="10" fill="var(--fg-muted)">{t.west}</text>
        <text x={cx - radius - 6} y={cy + 3} textAnchor="end" fontSize="10" fill="var(--fg-muted)">{t.east}</text>

        {seasons.map((s, idx) => {
          const decl =
            s.labelKey === 'equinox' ? 0 : s.labelKey === 'summer' ? state.axialTilt : -state.axialTilt;
          const samples = dailySolarPath(state.latitude, decl, 193);
          let d = '';
          let pen = false;
          samples.forEach(({ altitudeDeg, azimuthDeg }) => {
            const pt = projection(altitudeDeg, azimuthDeg);
            if (!pt) {
              pen = false;
              return;
            }
            d += `${pen ? 'L' : 'M'}${pt.x.toFixed(1)},${pt.y.toFixed(1)} `;
            pen = true;
          });
          return (
            <g key={s.labelKey}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={1.8} />
              <text x={width - 6} y={16 + idx * 12} textAnchor="end" fontSize="10" fill={s.color}>
                {t[s.labelKey]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function niceAltitudeRange(values: number[]): { min: number; max: number } {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const roundedLo = Math.max(-90, Math.floor(lo / 10) * 10);
  const roundedHi = Math.min(90, Math.ceil(hi / 10) * 10);
  const min = roundedHi - roundedLo < 20 ? roundedLo - 10 : roundedLo;
  return { min: Math.max(-90, min), max: roundedHi };
}

export function GraphPanel() {
  const { state, t } = useSim();
  const { dayLen, noonAlt } = useAnnualSeries(state.latitude, state.axialTilt);
  const altRange = useMemo(() => niceAltitudeRange(noonAlt), [noonAlt]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <LineGraph
        title={t.annualDayLength}
        values={dayLen}
        yMin={0}
        yMax={24}
        unit={'h'}
        currentDoy={state.doy}
        highlight="var(--chart-line)"
      />
      <LineGraph
        title={t.annualMeridian}
        values={noonAlt}
        yMin={altRange.min}
        yMax={altRange.max}
        unit={'°'}
        currentDoy={state.doy}
        highlight="var(--chart-line-2)"
      />
      <SeasonalPaths />
    </div>
  );
}
