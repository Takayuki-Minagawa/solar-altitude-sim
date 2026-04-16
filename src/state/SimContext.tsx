import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Lang } from '../i18n/translations';
import { TRANSLATIONS } from '../i18n/translations';
import { LOCATION_PRESETS } from '../data/presets';

export type Theme = 'light' | 'dark';

export interface SimState {
  latitude: number; // deg, -90..90
  doy: number; // 1..365
  hour: number; // 0..24
  axialTilt: number; // deg, 0..45
  presetId: string | null;
  playing: boolean;
  speed: number; // hours per second of wall clock
  lang: Lang;
  theme: Theme;
}

const DEFAULT_STATE: SimState = {
  latitude: 35.69,
  doy: 172, // around summer solstice: Jun 21
  hour: 12,
  axialTilt: 23.44,
  presetId: 'tokyo',
  playing: false,
  speed: 2,
  lang: 'ja',
  theme: 'dark',
};

interface Ctx {
  state: SimState;
  set: <K extends keyof SimState>(key: K, value: SimState[K]) => void;
  patch: (p: Partial<SimState>) => void;
  reset: () => void;
  t: (typeof TRANSLATIONS)['ja'];
}

const SimCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = 'solar-altitude-sim.v1';

function sanitize(parsed: Record<string, unknown>): Partial<SimState> {
  const out: Partial<SimState> = {};

  if (parsed.lang === 'ja' || parsed.lang === 'en') out.lang = parsed.lang;
  if (parsed.theme === 'light' || parsed.theme === 'dark') out.theme = parsed.theme;

  if (typeof parsed.latitude === 'number' && isFinite(parsed.latitude))
    out.latitude = Math.max(-90, Math.min(90, parsed.latitude));
  if (typeof parsed.doy === 'number' && isFinite(parsed.doy))
    out.doy = Math.max(1, Math.min(365, Math.round(parsed.doy)));
  if (typeof parsed.hour === 'number' && isFinite(parsed.hour))
    out.hour = Math.max(0, Math.min(24, parsed.hour));
  if (typeof parsed.axialTilt === 'number' && isFinite(parsed.axialTilt))
    out.axialTilt = Math.max(0, Math.min(45, parsed.axialTilt));
  if (typeof parsed.speed === 'number' && [0.5, 1, 2, 4, 8].includes(parsed.speed))
    out.speed = parsed.speed;

  if (parsed.presetId === null) {
    out.presetId = null;
  } else if (typeof parsed.presetId === 'string' && LOCATION_PRESETS.some((p) => p.id === parsed.presetId)) {
    out.presetId = parsed.presetId;
  } else {
    // Unknown or missing presetId — fall back to custom mode so the
    // restored latitude is not misleadingly paired with a default preset.
    out.presetId = null;
  }

  return out;
}

function loadInitial(): SimState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return { ...DEFAULT_STATE, ...sanitize(parsed), playing: false };
  } catch {
    return DEFAULT_STATE;
  }
}

export function SimProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimState>(loadInitial);

  const set = useCallback<Ctx['set']>((key, value) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);
  const patch = useCallback((p: Partial<SimState>) => setState((s) => ({ ...s, ...p })), []);
  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  // Persist (except `playing`). Skip writes while playing so the
  // requestAnimationFrame loop does not sync-write localStorage every frame.
  // A final write is triggered by the playing→paused transition below.
  useEffect(() => {
    if (state.playing) return;
    const { playing: _p, ...persist } = state;
    void _p;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }, [state]);

  // Theme side-effect
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  // Language on <html>
  useEffect(() => {
    document.documentElement.lang = state.lang;
  }, [state.lang]);

  // Animation loop — advances hour (wraps day when crossing 24:00)
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  useEffect(() => {
    if (!state.playing) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setState((s) => {
        let h = s.hour + s.speed * dt;
        let d = s.doy;
        while (h >= 24) {
          h -= 24;
          d = (d % 365) + 1;
        }
        return { ...s, hour: h, doy: d };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [state.playing]);

  const value = useMemo<Ctx>(() => ({
    state,
    set,
    patch,
    reset,
    t: TRANSLATIONS[state.lang],
  }), [state, set, patch, reset]);

  return <SimCtx.Provider value={value}>{children}</SimCtx.Provider>;
}

export function useSim() {
  const c = useContext(SimCtx);
  if (!c) throw new Error('useSim must be used within SimProvider');
  return c;
}
