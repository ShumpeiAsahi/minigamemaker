# Webミニゲームメーカー – 技術方針

## 概要

このプロジェクトは、誰でも簡単にミニゲームを作成・公開できる Web アプリケーションを目指しています。
ユーザーは JSON 形式でゲームを構成し、それをランタイムが実行します。

## MVP機能

### コア機能
* ゲームのプレイ機能
* ゲームの編集機能
* サンプルゲーム・ユーザー投稿ゲームのRemix機能
* 広告視聴後のRemix機能（仕様検討中）
* Twitter等での共有機能（OGP生成対応）

### アセット
* Beaverの無料アセット利用可能
* サンプルゲームのアセット一部利用可能
* ユーザーによる画像アセットのアップロード機能

### デザイン
* Chakra UIによるモダンなUI構築
* 統一されたデザインシステム
  * 専用フォント
  * メインカラー
  * アクセントカラー

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
* **状態管理**: React-hooks-form

### ゲームランタイム (packages/runtime)

* **ベースライブラリ**: [PixiJS v7+](https://pixijs.com/)
* **アニメーション**: [GSAP + PixiPlugin](https://greensock.com/docs/v3/Plugins/PixiPlugin)
* **アセット管理**: `@pixi/assets`
* **インタラクション**: `@pixi/events`

### モジュール構成

* `GameJSON` に基づいてゲームを定義
* ランタイムは `PIXI.Application` を生成し、JSONに沿ってゲームオブジェクトを構築
* `events` に基づいて順序制御・イベント駆動制御を実行

### ビルド・実行

```bash
pnpm install
pnpm dev       # 開発サーバー起動（apps/web）
pnpm build     # ビルド
```

## 今後の方針・TODO

* 投稿・共有機能（OGP生成・URL共有）

* 収益化方針：広告

* スマホ最適化対応

* JSONスキーマバリデーションの導入

* セーブ・ロード機能

* ゲームテンプレートのプリセット化

## ライセンス・注意事項

このプロジェクトは個人による創作支援目的のツールです。任天堂および他社ゲームとは一切関係ありません。

