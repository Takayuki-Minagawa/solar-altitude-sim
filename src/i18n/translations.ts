export type Lang = 'ja' | 'en';

export interface Dict {
  appTitle: string;
  appSubtitle: string;
  language: string;
  theme: string;
  light: string;
  dark: string;
  parameters: string;
  location: string;
  custom: string;
  latitude: string;
  date: string;
  time: string;
  axialTilt: string;
  play: string;
  pause: string;
  speed: string;
  overheadView: string;
  skyView: string;
  graphPanel: string;
  learningPanel: string;
  quizTab: string;
  explanationTab: string;
  meridianAltitude: string;
  dayLength: string;
  sunriseTime: string;
  sunsetTime: string;
  sunriseAzimuth: string;
  sunsetAzimuth: string;
  solarDeclination: string;
  hours: string;
  deg: string;
  polarDay: string;
  polarNight: string;
  polarHorizon: string;
  annualDayLength: string;
  annualMeridian: string;
  seasonalPaths: string;
  summer: string;
  winter: string;
  equinox: string;
  today: string;
  north: string;
  east: string;
  south: string;
  west: string;
  vernal: string;
  summerSolstice: string;
  autumnal: string;
  winterSolstice: string;
  explanationBody: (args: {
    lat: number;
    decl: number;
    meridianAlt: number;
    dayLen: number;
    polar: 'day' | 'night' | 'horizon' | null;
    axialTilt: number;
  }) => string;
  quizQuestion: string;
  quizCheck: string;
  quizNext: string;
  quizCorrect: string;
  quizWrong: string;
  quizScore: (correct: number, total: number) => string;
  noteDisclaimer: string;
  reset: string;
  now: string;
  nowDisabledCustom: string;
}

export const TRANSLATIONS: Record<Lang, Dict> = {
  ja: {
    appTitle: '季節と太陽高度シミュレーター',
    appSubtitle: '地軸傾き・緯度・日付・時刻を動かして太陽の動きを体感',
    language: '言語',
    theme: 'テーマ',
    light: 'ライト',
    dark: 'ダーク',
    parameters: '操作パネル',
    location: '観測地',
    custom: 'カスタム',
    latitude: '緯度',
    date: '日付',
    time: '時刻',
    axialTilt: '地軸傾斜角',
    play: '再生',
    pause: '一時停止',
    speed: '速度',
    overheadView: '俯瞰ビュー',
    skyView: '観測地ビュー',
    graphPanel: 'グラフパネル',
    learningPanel: '学習パネル',
    quizTab: 'クイズ',
    explanationTab: '解説',
    meridianAltitude: '南中高度',
    dayLength: '昼の長さ',
    sunriseTime: '日の出時刻',
    sunsetTime: '日の入り時刻',
    sunriseAzimuth: '日の出方位',
    sunsetAzimuth: '日の入り方位',
    solarDeclination: '太陽赤緯',
    hours: '時間',
    deg: '°',
    polarDay: '白夜（太陽が沈まない）',
    polarNight: '極夜（太陽が昇らない）',
    polarHorizon: '太陽が地平線上を周回（極点の分点）',
    annualDayLength: '昼の長さ（年間）',
    annualMeridian: '南中高度（年間）',
    seasonalPaths: '季節別 日周軌跡',
    summer: '夏至',
    winter: '冬至',
    equinox: '春分・秋分',
    today: '本日',
    north: '北',
    east: '東',
    south: '南',
    west: '西',
    vernal: '春分',
    summerSolstice: '夏至',
    autumnal: '秋分',
    winterSolstice: '冬至',
    explanationBody: ({ lat, decl, meridianAlt, dayLen, polar, axialTilt }) => {
      const phiTxt = `緯度 ${lat.toFixed(1)}°`;
      const declTxt = `太陽赤緯 δ = ${decl.toFixed(1)}°`;
      const mainMeridian = polar === 'night'
        ? '太陽は一日中地平線より下にあります（極夜）。'
        : polar === 'day'
          ? '太陽は一日中沈みません（白夜）。'
          : polar === 'horizon'
            ? '太陽は一日中地平線上を周回しています。'
            : `南中高度 h = 90° − |φ − δ| = ${meridianAlt.toFixed(1)}°`;
      const dayTxt = polar === 'day'
        ? '昼の長さは 24 時間。'
        : polar === 'night' || polar === 'horizon'
          ? '昼の長さは 0 時間。'
          : `昼の長さは約 ${dayLen.toFixed(1)} 時間です。`;
      const tiltTxt = Math.abs(axialTilt - 23.44) < 0.01
        ? '地軸傾き 23.4°（実際の地球）。'
        : axialTilt === 0
          ? '地軸傾き 0° — 季節変化はなくなります。'
          : `地軸傾き ${axialTilt.toFixed(1)}° — 季節差が誇張されます。`;
      return `${phiTxt}、${declTxt}。${mainMeridian} ${dayTxt} ${tiltTxt}`;
    },
    quizQuestion: '問題',
    quizCheck: '答え合わせ',
    quizNext: '次の問題',
    quizCorrect: '正解！',
    quizWrong: '不正解',
    quizScore: (c, t) => `スコア: ${c} / ${t}`,
    noteDisclaimer: '※ 本教材は原理理解を目的とした近似計算です。実測値や予報には使用できません。',
    reset: 'リセット',
    now: '現在時刻',
    nowDisabledCustom: '※ カスタムでは経度が不明なため無効',
  },
  en: {
    appTitle: 'Seasons & Solar Altitude Simulator',
    appSubtitle: 'Feel how tilt, latitude, date and time drive the Sun',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    parameters: 'Controls',
    location: 'Location',
    custom: 'Custom',
    latitude: 'Latitude',
    date: 'Date',
    time: 'Time',
    axialTilt: 'Axial tilt',
    play: 'Play',
    pause: 'Pause',
    speed: 'Speed',
    overheadView: 'Overhead view',
    skyView: 'Sky view',
    graphPanel: 'Graphs',
    learningPanel: 'Learn',
    quizTab: 'Quiz',
    explanationTab: 'Explanation',
    meridianAltitude: 'Noon altitude',
    dayLength: 'Day length',
    sunriseTime: 'Sunrise',
    sunsetTime: 'Sunset',
    sunriseAzimuth: 'Sunrise azimuth',
    sunsetAzimuth: 'Sunset azimuth',
    solarDeclination: 'Declination',
    hours: 'h',
    deg: '°',
    polarDay: 'Polar day (sun never sets)',
    polarNight: 'Polar night (sun never rises)',
    polarHorizon: 'Sun circles the horizon (pole at equinox)',
    annualDayLength: 'Day length over a year',
    annualMeridian: 'Noon altitude over a year',
    seasonalPaths: 'Seasonal sun paths',
    summer: 'Summer solstice',
    winter: 'Winter solstice',
    equinox: 'Equinoxes',
    today: 'Today',
    north: 'N',
    east: 'E',
    south: 'S',
    west: 'W',
    vernal: 'Vernal',
    summerSolstice: 'Summer',
    autumnal: 'Autumnal',
    winterSolstice: 'Winter',
    explanationBody: ({ lat, decl, meridianAlt, dayLen, polar, axialTilt }) => {
      const phiTxt = `Latitude ${lat.toFixed(1)}°`;
      const declTxt = `declination δ = ${decl.toFixed(1)}°`;
      const mainMeridian = polar === 'night'
        ? 'The Sun stays below the horizon all day (polar night).'
        : polar === 'day'
          ? 'The Sun never sets (polar day).'
          : polar === 'horizon'
            ? 'The Sun circles the horizon all day.'
            : `noon altitude h = 90° − |φ − δ| = ${meridianAlt.toFixed(1)}°.`;
      const dayTxt = polar === 'day'
        ? 'Day length is 24 h.'
        : polar === 'night' || polar === 'horizon'
          ? 'Day length is 0 h.'
          : `Day length is about ${dayLen.toFixed(1)} h.`;
      const tiltTxt = Math.abs(axialTilt - 23.44) < 0.01
        ? 'Axial tilt 23.4° (real Earth).'
        : axialTilt === 0
          ? 'Axial tilt 0° — seasons disappear.'
          : `Axial tilt ${axialTilt.toFixed(1)}° — seasonal differences are exaggerated.`;
      return `${phiTxt}, ${declTxt}. ${mainMeridian} ${dayTxt} ${tiltTxt}`;
    },
    quizQuestion: 'Question',
    quizCheck: 'Check',
    quizNext: 'Next',
    quizCorrect: 'Correct!',
    quizWrong: 'Incorrect',
    quizScore: (c, t) => `Score: ${c} / ${t}`,
    noteDisclaimer: 'Educational approximation — not for navigation or forecasting.',
    reset: 'Reset',
    now: 'Now',
    nowDisabledCustom: 'Disabled: longitude unknown in custom mode',
  },
};
