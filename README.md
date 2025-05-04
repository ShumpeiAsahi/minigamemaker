# Webミニゲームメーカー – 技術方針

## 概要

このプロジェクトは、"メイドイン俺" のように誰でも簡単にミニゲームを作成・公開できる Web アプリケーションを目指しています。
ユーザーは JSON 形式でゲームを構成し、それをランタイムが実行します。

## 技術構成

```
monorepo/
├── apps/
│ └── web/ # ユーザー向けのゲームエディタ＆プレイヤー（React + Vite）
├── packages/
│ └── runtime/ # ゲーム実行エンジン（PIXI.jsベース）
├── pnpm-workspace.yaml
└── tsconfig.base.json / eslint 設定など
```

### フロントエンド (apps/web)

* **フレームワーク**: React + Vite
* **言語**: TypeScript
* **スタイリング**: Chakra UI
* **状態管理**: TODO: Zustand or React Context（未定）

### ゲームランタイム (packages/runtime)

* **ベースライブラリ**: [PixiJS v7+](https://pixijs.com/)
* **アニメーション**: [GSAP + PixiPlugin](https://greensock.com/docs/v3/Plugins/PixiPlugin)
* **アセット管理**: `@pixi/assets`
* **インタラクション**: `@pixi/events`

### モジュール構成

* `GameJSON` に基づいてゲームを定義
* ランタイムは `PIXI.Application` を生成し、JSONに沿ってゲームオブジェクトを構築
* `timeline` に基づいて順序制御・イベント駆動制御を実行

### ビルド・実行

```bash
pnpm install
pnpm dev       # 開発サーバー起動（apps/web）
pnpm build     # ビルド
```

## 今後の方針・TODO

* ゲームエディタのUI構築（ドラッグ&ドロップ or JSONエディタ）

* 投稿・共有機能（OGP生成・URL共有）

* モデレーション戦略（全年齢向けコンテンツの保護）

* 収益化方針：広告 / プレミアム機能 / NFT対応（？）

* スマホ最適化対応

* JSONスキーマバリデーションの導入

* セーブ・ロード機能

* ゲームテンプレートのプリセット化

* 将来的なWebAssembly対応？（TODO: パフォーマンスが必要な場合）

## ライセンス・注意事項

このプロジェクトは個人による創作支援目的のツールです。任天堂および他社ゲームとは一切関係ありません。

