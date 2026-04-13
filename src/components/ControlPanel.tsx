import { useSim } from '../state/SimContext';
import { LOCATION_PRESETS } from '../data/presets';
import { doyToMonthDay, dayOfYear, formatHourHM } from '../astro/solar';

function formatDate(doy: number, lang: 'ja' | 'en'): string {
  const { month, day } = doyToMonthDay(doy);
  return lang === 'ja' ? `${month}月${day}日` : `${month}/${day}`;
}

export function ControlPanel() {
  const { state, set, patch, t } = useSim();

  const onPreset = (id: string) => {
    if (id === '__custom__') {
      set('presetId', null);
      return;
    }
    const p = LOCATION_PRESETS.find((x) => x.id === id);
    if (!p) return;
    patch({ presetId: id, latitude: p.latitude });
  };

  return (
    <>
      <div className="control-row">
        <label>
          {t.location}
        </label>
        <select
          value={state.presetId ?? '__custom__'}
          onChange={(e) => onPreset(e.target.value)}
        >
          {LOCATION_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {state.lang === 'ja' ? p.labelJa : p.labelEn} ({p.latitude.toFixed(1)}°)
            </option>
          ))}
          <option value="__custom__">{t.custom}</option>
        </select>
      </div>

      <div className="control-row">
        <label>
          <span>{t.latitude}</span>
          <span className="value">
            {state.latitude.toFixed(1)}°{' '}
            {state.latitude >= 0 ? (state.lang === 'ja' ? '北緯' : 'N') : state.lang === 'ja' ? '南緯' : 'S'}
          </span>
        </label>
        <input
          type="range"
          min={-90}
          max={90}
          step={0.5}
          value={state.latitude}
          onChange={(e) => patch({ latitude: Number(e.target.value), presetId: null })}
        />
      </div>

      <div className="control-row">
        <label>
          <span>{t.date}</span>
          <span className="value">{formatDate(state.doy, state.lang)}</span>
        </label>
        <input
          type="range"
          min={1}
          max={365}
          step={1}
          value={state.doy}
          onChange={(e) => set('doy', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <label>
          <span>{t.time}</span>
          <span className="value">{formatHourHM(state.hour)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={24}
          step={0.05}
          value={state.hour}
          onChange={(e) => set('hour', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <label>
          <span>{t.axialTilt}</span>
          <span className="value">{state.axialTilt.toFixed(1)}°</span>
        </label>
        <input
          type="range"
          min={0}
          max={45}
          step={0.1}
          value={state.axialTilt}
          onChange={(e) => set('axialTilt', Number(e.target.value))}
        />
      </div>

      <div className="playback">
        <button
          className="primary"
          onClick={() => set('playing', !state.playing)}
        >
          {state.playing ? `■ ${t.pause}` : `▶ ${t.play}`}
        </button>
        <label style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
          {t.speed}
          <select
            value={state.speed}
            onChange={(e) => set('speed', Number(e.target.value))}
            style={{ marginLeft: 6 }}
          >
            <option value={0.5}>0.5× </option>
            <option value={1}>1× </option>
            <option value={2}>2× </option>
            <option value={4}>4× </option>
            <option value={8}>8× </option>
          </select>
        </label>
      </div>
      <div className="control-row">
        <button
          className="pill"
          onClick={() => {
            const now = new Date();
            const preset = LOCATION_PRESETS.find((p) => p.id === state.presetId);
            // Longitude: use the preset's if known, else infer from the device
            // timezone offset (15°/hour). Then convert device UTC -> local mean
            // solar time at that longitude so the calculation's `hour` axis is
            // consistent across locations.
            const longitude = preset ? preset.longitude : -now.getTimezoneOffset() / 4;
            const utcHour =
              now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
            let localHour = utcHour + longitude / 15;
            let doy = dayOfYear(now.getUTCMonth() + 1, now.getUTCDate());
            while (localHour < 0) { localHour += 24; doy -= 1; }
            while (localHour >= 24) { localHour -= 24; doy += 1; }
            if (doy < 1) doy = 365;
            if (doy > 365) doy = 1;
            patch({ doy, hour: localHour });
          }}
        >
          {t.now}
        </button>
      </div>
    </>
  );
}
