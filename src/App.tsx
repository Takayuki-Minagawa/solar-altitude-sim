import { useSim } from './state/SimContext';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { OverheadView } from './components/OverheadView';
import { SkyView } from './components/SkyView';
import { GraphPanel } from './components/GraphPanel';
import { LearningPanel } from './components/LearningPanel';

export default function App() {
  const { t } = useSim();

  return (
    <div className="app">
      <Header />
      <main className="layout">
        <section className="panel">
          <h2>{t.parameters}</h2>
          <ControlPanel />
        </section>

        <section className="views">
          <div className="panel view-card">
            <h2>{t.overheadView}</h2>
            <div className="canvas-wrap"><OverheadView /></div>
          </div>
          <div className="panel view-card">
            <h2>{t.skyView}</h2>
            <div className="canvas-wrap"><SkyView /></div>
          </div>
        </section>

        <section className="panel learning">
          <h2>{t.graphPanel}</h2>
          <GraphPanel />
          <h2 style={{ marginTop: 8 }}>{t.learningPanel}</h2>
          <LearningPanel />
        </section>
      </main>
      <div className="footer-note">{t.noteDisclaimer}</div>
    </div>
  );
}
