import { useMemo, useState } from 'react';
import { useSim } from '../state/SimContext';
import { QUIZZES } from '../i18n/quizzes';
import {
  solarDeclinationDeg,
  meridianAltitudeDeg,
  dayLengthInfo,
} from '../astro/solar';

export function LearningPanel() {
  const { state, t } = useSim();
  const [tab, setTab] = useState<'explain' | 'quiz'>('explain');

  const explanation = useMemo(() => {
    const decl = solarDeclinationDeg(state.doy, state.axialTilt);
    const noon = meridianAltitudeDeg(state.latitude, decl);
    const dayInfo = dayLengthInfo(state.latitude, decl);
    return t.explanationBody({
      lat: state.latitude,
      decl,
      meridianAlt: noon,
      dayLen: dayInfo.hours,
      polar: dayInfo.polar,
      axialTilt: state.axialTilt,
    });
  }, [state.doy, state.axialTilt, state.latitude, t]);

  return (
    <div className="learning">
      <div className="tabs">
        <button aria-pressed={tab === 'explain'} onClick={() => setTab('explain')}>
          {t.explanationTab}
        </button>
        <button aria-pressed={tab === 'quiz'} onClick={() => setTab('quiz')}>
          {t.quizTab}
        </button>
      </div>
      {tab === 'explain' ? (
        <div className="explanation">{explanation}</div>
      ) : (
        <QuizCard />
      )}
    </div>
  );
}

function QuizCard() {
  const { state, t } = useSim();
  const quizzes = QUIZZES[state.lang];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ c: 0, total: 0 });

  const q = quizzes[idx];

  const onCheck = () => {
    if (selected == null) return;
    setChecked(true);
    setScore((s) => ({
      c: s.c + (selected === q.answerIndex ? 1 : 0),
      total: s.total + 1,
    }));
  };
  const onNext = () => {
    setIdx((i) => (i + 1) % quizzes.length);
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="quiz-card">
      <div style={{ color: 'var(--fg-muted)', fontSize: 11 }}>
        {t.quizQuestion} {idx + 1} / {quizzes.length} · {t.quizScore(score.c, score.total)}
      </div>
      <div style={{ fontWeight: 600 }}>{q.question}</div>
      <ul>
        {q.choices.map((choice, i) => {
          const isAnswer = i === q.answerIndex;
          const cls = !checked
            ? selected === i
              ? 'selected'
              : ''
            : isAnswer
              ? 'correct'
              : selected === i
                ? 'wrong'
                : '';
          return (
            <li key={i}>
              <button
                className={cls}
                onClick={() => !checked && setSelected(i)}
                disabled={checked}
              >
                {choice}
              </button>
            </li>
          );
        })}
      </ul>
      {checked && (
        <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
          <strong style={{ color: selected === q.answerIndex ? '#1f7a4c' : '#a6233b' }}>
            {selected === q.answerIndex ? t.quizCorrect : t.quizWrong}
          </strong>{' '}
          — {q.explanation}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {!checked ? (
          <button className="pill" onClick={onCheck} disabled={selected == null}>
            {t.quizCheck}
          </button>
        ) : (
          <button className="pill" onClick={onNext}>
            {t.quizNext}
          </button>
        )}
      </div>
    </div>
  );
}
