import type { Lang } from './translations';

export interface QuizItem {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export const QUIZZES: Record<Lang, QuizItem[]> = {
  ja: [
    {
      question: '北緯 35°、春分の日の南中高度は？',
      choices: ['35°', '55°', '66.6°', '90°'],
      answerIndex: 1,
      explanation: 'h = 90° − |35° − 0°| = 55°。春分の太陽赤緯はほぼ 0° です。',
    },
    {
      question: '白夜（太陽が沈まない）が起こる条件は？',
      choices: [
        '低緯度地方で季節を問わず',
        '地軸傾きが 0° のとき',
        '|緯度 + 赤緯| ≥ 90° となるとき',
        '高緯度で冬のとき',
      ],
      answerIndex: 2,
      explanation: '−tan(φ)tan(δ) ≤ −1 と同値の条件で、太陽は終日地平線下に沈みません。',
    },
    {
      question: '地軸傾斜角を 0° にすると…',
      choices: [
        '南中高度が年中一定になり季節がなくなる',
        '昼の長さだけが変化する',
        '一年中極夜になる',
        '太陽が天頂から動かなくなる',
      ],
      answerIndex: 0,
      explanation: '赤緯 δ が常に 0° になるため、南中高度は 90° − |φ| で一定。昼の長さも全地球で 12 時間固定となります。',
    },
    {
      question: '赤道（緯度 0°）の昼の長さは一年を通じて…',
      choices: ['約 12 時間でほぼ一定', '夏は 14 時間、冬は 10 時間', '24 時間', '0 時間になる日がある'],
      answerIndex: 0,
      explanation: 'φ = 0° では cos(ω₀) = −tan(0°)tan(δ) = 0 で ω₀ = 90°、昼は常に 12 時間です。',
    },
    {
      question: '北半球の夏至における日の出方位は？',
      choices: ['真東', '真東より北寄り', '真東より南寄り', '真北'],
      answerIndex: 1,
      explanation: '夏至は赤緯が +23.4° なので、日の出は真東より北へずれます。',
    },
  ],
  en: [
    {
      question: 'At 35°N on the vernal equinox, what is the noon altitude?',
      choices: ['35°', '55°', '66.6°', '90°'],
      answerIndex: 1,
      explanation: 'h = 90° − |35° − 0°| = 55°. Declination is ~0° at the equinox.',
    },
    {
      question: 'When does the polar day (sun never sets) occur?',
      choices: [
        'At low latitudes any season',
        'When the tilt is 0°',
        'When |φ + δ| ≥ 90°',
        'At high latitudes in winter',
      ],
      answerIndex: 2,
      explanation: 'This is equivalent to −tan(φ)tan(δ) ≤ −1, meaning the sun never crosses the horizon.',
    },
    {
      question: 'If the axial tilt were set to 0°…',
      choices: [
        'Noon altitude stays constant all year, seasons vanish',
        'Only day length changes',
        'The whole Earth enters polar night',
        'The sun stays at zenith everywhere',
      ],
      answerIndex: 0,
      explanation: 'Declination δ stays at 0° year-round, so noon altitude is 90°−|φ| and day length is 12 h everywhere.',
    },
    {
      question: 'At the equator, how does day length change through the year?',
      choices: ['About 12 h, almost constant', '14 h summer, 10 h winter', '24 h', 'Some days drop to 0'],
      answerIndex: 0,
      explanation: 'At φ=0° we have cos(ω₀) = 0 regardless of δ, so ω₀ = 90° and day length is always 12 h.',
    },
    {
      question: 'In the Northern Hemisphere at the summer solstice, the sunrise azimuth is…',
      choices: ['Due east', 'North of east', 'South of east', 'Due north'],
      answerIndex: 1,
      explanation: 'Declination is +23.4° so the sunrise shifts north of due east.',
    },
  ],
};
