# solar-altitude-sim

季節と太陽高度シミュレーター (Seasons & Solar Altitude Simulator)

地軸傾き・緯度・日付・時刻を動かしながら、太陽の南中高度・昼の長さ・日の出／日の入り方位の変化を体験できる Web 教材です。React + TypeScript + Vite、Three.js (React Three Fiber)、SVG グラフで構成されています。

## 主な機能

- 俯瞰ビュー: 太陽・地球・公転軌道・春分／夏至／秋分／冬至マーカー・太陽光の矢印を 3D で可視化
- 観測地ビュー: 半球ドームに現在の太陽位置と一日の日周軌跡、南中高度・昼の長さ・日の出／日の入り時刻と方位を表示
- グラフパネル: 年間の昼の長さ・南中高度・季節別日周軌跡の重ね描き
- 学習パネル: 現在の状態に応じた解説の自動生成と 5 問のクイズモード
- 日本語／英語切替、ライト／ダークテーマ切替、レスポンシブレイアウト
- パラメータの `localStorage` への自動保存

## 使用モデル

- 太陽赤緯: δ = tilt × sin(360°/365 × (d − 81))
- 南中高度: h = 90° − |φ − δ|
- 昼の長さ: cos(ω₀) = −tan(φ)tan(δ) から導出
- 時角を用いた太陽高度・方位の標準式

教育用の近似計算であり、実測値や予報の用途には使用できません。

## 開発

```sh
npm install
npm run dev      # 開発サーバ
npm run build    # 本番ビルド
npm run preview  # ビルド成果物のローカル確認
```

## デプロイ

`main` ブランチへの push で GitHub Actions (`.github/workflows/deploy.yml`) が `dist/` をビルドし GitHub Pages に公開します。`vite.config.ts` の `base` はリポジトリ名 (`/solar-altitude-sim/`) に合わせてあります。

## 参考プロジェクト

- [GEO-LEARNER](https://takayuki-minagawa.github.io/GEO-LEARNER/)
- [weather-front-sim](https://takayuki-minagawa.github.io/weather-front-sim/)
- [web-planetarium](https://takayuki-minagawa.github.io/web-planetarium/)
