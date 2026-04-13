export interface LocationPreset {
  id: string;
  labelJa: string;
  labelEn: string;
  latitude: number;
  longitude: number;
}

export const LOCATION_PRESETS: LocationPreset[] = [
  { id: 'sapporo',   labelJa: '札幌',       labelEn: 'Sapporo',    latitude: 43.06,  longitude: 141.35 },
  { id: 'tokyo',     labelJa: '東京',       labelEn: 'Tokyo',      latitude: 35.69,  longitude: 139.69 },
  { id: 'naha',      labelJa: '那覇',       labelEn: 'Naha',       latitude: 26.21,  longitude: 127.68 },
  { id: 'singapore', labelJa: 'シンガポール', labelEn: 'Singapore',  latitude: 1.35,   longitude: 103.82 },
  { id: 'sydney',    labelJa: 'シドニー',   labelEn: 'Sydney',     latitude: -33.87, longitude: 151.21 },
  { id: 'equator',   labelJa: '赤道',       labelEn: 'Equator',    latitude: 0,      longitude: 0 },
  { id: 'arctic',    labelJa: '北極圏',     labelEn: 'Arctic Circle', latitude: 66.56, longitude: 0 },
  { id: 'antarctic', labelJa: '南極圏',     labelEn: 'Antarctic Circle', latitude: -66.56, longitude: 0 },
];
