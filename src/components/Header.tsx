import { useSim } from '../state/SimContext';

export function Header() {
  const { state, set, reset, t } = useSim();
  return (
    <header className="header">
      <div>
        <h1>{t.appTitle}</h1>
        <div className="subtitle">{t.appSubtitle}</div>
      </div>
      <div className="header-actions">
        <button className="pill" aria-pressed={state.lang === 'ja'} onClick={() => set('lang', 'ja')}>
          日本語
        </button>
        <button className="pill" aria-pressed={state.lang === 'en'} onClick={() => set('lang', 'en')}>
          English
        </button>
        <span style={{ width: 8 }} />
        <button
          className="pill"
          aria-pressed={state.theme === 'light'}
          onClick={() => set('theme', 'light')}
        >
          ☀ {t.light}
        </button>
        <button
          className="pill"
          aria-pressed={state.theme === 'dark'}
          onClick={() => set('theme', 'dark')}
        >
          ☾ {t.dark}
        </button>
        <span style={{ width: 8 }} />
        <button className="pill" onClick={reset}>{t.reset}</button>
      </div>
    </header>
  );
}
