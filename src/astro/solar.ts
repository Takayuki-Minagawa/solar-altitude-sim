// Solar position utilities.
// Uses common didactic approximations; not for navigation.

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

export const DAYS_IN_YEAR = 365;

// Day of year (1..365), Jan 1 = 1.
export function dayOfYear(month: number, day: number): number {
  const cumulative = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cumulative[month - 1] + day;
}

// Convert (month, day) -> d; clamp to [1, 365].
export function clampDoy(doy: number): number {
  if (doy < 1) return 1;
  if (doy > DAYS_IN_YEAR) return DAYS_IN_YEAR;
  return Math.round(doy);
}

// Solar declination (degrees) using the simple seasonal formula.
// axialTiltDeg is user-adjustable (0..45). Day 81 ≈ vernal equinox in this model.
export function solarDeclinationDeg(doy: number, axialTiltDeg = 23.44): number {
  return axialTiltDeg * Math.sin(((360 / DAYS_IN_YEAR) * (doy - 81)) * DEG);
}

// Meridian (noon) solar altitude, degrees. Can be negative in polar night.
export function meridianAltitudeDeg(latDeg: number, declDeg: number): number {
  return 90 - Math.abs(latDeg - declDeg);
}

// Half-day angle ω0 (degrees). Returns null when the sun never rises/sets (polar day/night),
// or when the result is undefined (pole + equinox: sun grazes the horizon all day).
export function halfDayAngleDeg(latDeg: number, declDeg: number): number | null {
  const phi = latDeg * DEG;
  const dec = declDeg * DEG;

  // At the poles cos(φ) ≈ 0, making tan(φ) huge / infinite.
  // When declination is also near zero the product −tan(φ)·tan(δ) is an
  // indeterminate 0·∞ form. Handle the pole explicitly:
  //   sun altitude at the pole = |δ|, so check declination sign directly.
  if (Math.abs(Math.cos(phi)) < 1e-10) {
    if (Math.abs(declDeg) < 0.01) return null; // equinox at pole — undefined rise/set
    // positive decl → above horizon at N pole, below at S pole
    return (declDeg > 0) === (latDeg > 0) ? 180 : 0;
  }

  const cosOmega = -Math.tan(phi) * Math.tan(dec);
  if (cosOmega >= 1) return 0; // polar night — never rises
  if (cosOmega <= -1) return 180; // polar day — never sets
  return Math.acos(cosOmega) * RAD;
}

export interface DayLengthInfo {
  hours: number; // 0..24
  sunriseHour: number | null; // local solar time
  sunsetHour: number | null;
  polar: 'day' | 'night' | null;
}

export function dayLengthInfo(latDeg: number, declDeg: number): DayLengthInfo {
  const omega = halfDayAngleDeg(latDeg, declDeg);
  if (omega === null) return { hours: 0, sunriseHour: null, sunsetHour: null, polar: 'night' };
  if (omega === 0) return { hours: 0, sunriseHour: null, sunsetHour: null, polar: 'night' };
  if (omega === 180) return { hours: 24, sunriseHour: null, sunsetHour: null, polar: 'day' };
  const hours = (2 * omega) / 15;
  const sunrise = 12 - omega / 15;
  const sunset = 12 + omega / 15;
  return { hours, sunriseHour: sunrise, sunsetHour: sunset, polar: null };
}

export interface SolarPosition {
  altitudeDeg: number;
  azimuthDeg: number; // 0 = North, 90 = East, 180 = South, 270 = West
}

// Solar position given local solar time (hours 0..24), latitude, declination.
export function solarPosition(
  latDeg: number,
  declDeg: number,
  hour: number,
): SolarPosition {
  const phi = latDeg * DEG;
  const dec = declDeg * DEG;
  const H = (hour - 12) * 15 * DEG; // hour angle, radians
  const sinAlt = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAlt = Math.cos(alt);
  let az: number;
  if (cosAlt < 1e-6) {
    az = 0;
  } else {
    const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(phi)) / (cosAlt * Math.cos(phi));
    const a = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD;
    az = H < 0 ? a : 360 - a;
  }
  return { altitudeDeg: alt * RAD, azimuthDeg: (az + 360) % 360 };
}

// Convert altitude/azimuth to a unit vector on the local sphere.
// x: east, y: up, z: south  (right-handed, matches Three.js)
export function altAzToVector(altDeg: number, azDeg: number): [number, number, number] {
  const alt = altDeg * DEG;
  const az = azDeg * DEG;
  const ca = Math.cos(alt);
  const x = ca * Math.sin(az); // east component
  const z = -ca * Math.cos(az); // north is -z, south is +z  (so 180° -> +z)
  const y = Math.sin(alt);
  return [x, y, z];
}

// Sunrise azimuth (approx) = solar azimuth at altitude=0 with H = -omega.
export function sunriseAzimuthDeg(latDeg: number, declDeg: number): number | null {
  const info = dayLengthInfo(latDeg, declDeg);
  if (info.sunriseHour == null) return null;
  return solarPosition(latDeg, declDeg, info.sunriseHour).azimuthDeg;
}
export function sunsetAzimuthDeg(latDeg: number, declDeg: number): number | null {
  const info = dayLengthInfo(latDeg, declDeg);
  if (info.sunsetHour == null) return null;
  return solarPosition(latDeg, declDeg, info.sunsetHour).azimuthDeg;
}

// Return array of {hour, altitude, azimuth} sampled through the full day.
export function dailySolarPath(
  latDeg: number,
  declDeg: number,
  steps = 97,
): { hour: number; altitudeDeg: number; azimuthDeg: number }[] {
  const out: { hour: number; altitudeDeg: number; azimuthDeg: number }[] = [];
  for (let i = 0; i < steps; i++) {
    const hour = (24 * i) / (steps - 1);
    const pos = solarPosition(latDeg, declDeg, hour);
    out.push({ hour, altitudeDeg: pos.altitudeDeg, azimuthDeg: pos.azimuthDeg });
  }
  return out;
}

// Format a decimal hour as HH:MM, carrying over 60-minute rollover.
// Hours are wrapped into [0, 24).
export function formatHourHM(h: number): string {
  let totalMin = Math.round(h * 60);
  totalMin = ((totalMin % 1440) + 1440) % 1440;
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// month+day from day-of-year (Jan 1 = 1)
export function doyToMonthDay(doy: number): { month: number; day: number } {
  const cumulative = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  const d = clampDoy(doy);
  for (let m = 1; m <= 12; m++) {
    if (d <= cumulative[m]) return { month: m, day: d - cumulative[m - 1] };
  }
  return { month: 12, day: 31 };
}
