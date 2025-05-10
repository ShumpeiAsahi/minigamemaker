import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PixiPlugin from "gsap/PixiPlugin";
import { Assets } from "@pixi/assets";
import "@pixi/events";
import type { GameJSON, Event } from "./types";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

export class MicroGame {
  private app!: PIXI.Application;
  private sprites = new Map<string, PIXI.DisplayObject>();
  private audio = new Map<string, HTMLAudioElement>();
  private events: Event[] = [];
  private startAt = 0;
  private textures = new Map<string, PIXI.Texture>();

  constructor(
    private data: GameJSON,
    private mount: HTMLElement,
    private isEditorMode = false,
  ) {}

  private setupBackgroundImage() {
    const bgImageAsset = this.data.assets.find((a) => a.id === "bgImage");
    if (bgImageAsset) {
      const bgTexture = this.textures.get(bgImageAsset.id);
      if (bgTexture) {
        const bgSprite = new PIXI.Sprite(bgTexture);
        bgSprite.width = this.data.meta.width;
        bgSprite.height = this.data.meta.height;
        bgSprite.anchor.set(0, 0);
        bgSprite.position.set(0, 0);
        this.app.stage.addChildAt(bgSprite, 0);
      }
    }
  }

  async ready() {
    const { width, height, bgColor } = this.data.meta;
    console.log("Game meta:", { width, height, bgColor });

    this.app = new PIXI.Application({
      width,
      height,
      background: bgColor,
      antialias: true,
    });
    this.mount.innerHTML = "";
    this.mount.appendChild(this.app.view as HTMLCanvasElement);

    await this.loadAssets();
    this.setupBackgroundImage();
    this.buildObjects();
  }

  async run(loop = true) {
    this.events = [...this.data.events];
    this.startAt = performance.now();
    this.app.ticker.add(this.tick);

    if (loop) {
      this.app.ticker.add(() => {
        const now = performance.now() - this.startAt;
        if (now > this.data.meta.loopMs) {
          this.reset();
        }
      });
    }

    this.data.events
      .filter(
        (e): e is Extract<Event, { trigger: { type: "click" } }> =>
          e.trigger.type === "click",
      )
      .forEach((event) => {
        const sp = this.sprites.get(event.trigger.targetId)! as PIXI.Sprite;
        sp.on(
          "pointertap",
          () => {
            event.actions.forEach((action) => this.exec(action));
          },
          { once: true },
        );
      });
  }

  getSprites() {
    return this.sprites;
  }

  getApp(): PIXI.Application {
    return this.app;
  }

  private async loadAssets(): Promise<void> {
    // 画像アセットのURLを収集（重複を除去）
    const uniqueUrls = new Set<string>();
    const assetIdToUrl = new Map<string, string>();

    for (const asset of this.data.assets) {
      if (
        /\.(png|jpg|gif)$/i.test(asset.url) ||
        asset.url.startsWith("data:image/")
      ) {
        uniqueUrls.add(asset.url);
        assetIdToUrl.set(asset.id, asset.url);
      } else if (/\.(wav|mp3)$/i.test(asset.url)) {
        this.audio.set(asset.id, new Audio(asset.url));
      }
    }

    // ユニークなURLのテクスチャをロード
    await Assets.load(Array.from(uniqueUrls));

    // アセットIDごとにテクスチャを設定
    for (const [assetId, url] of assetIdToUrl) {
      const tex = Assets.get(url) as PIXI.Texture;
      this.textures.set(assetId, tex);
    }
  }

  private buildObjects() {
    this.data.objects.forEach((o) => {
      if ("text" in o) {
        // TextObjectの場合
        const txt = new PIXI.Text(o.text, o.style);
        txt.updateText();
        txt.position.set(o.x, o.y);
        txt.anchor.set(0.5);
        txt.visible = this.isEditorMode;
        if (o.interactive) txt.eventMode = "static";
        if (o.interactive) txt.cursor = "pointer";

        this.sprites.set(o.id, txt);
        this.app.stage.addChild(txt);
      } else {
        // 通常のObjectの場合
        const assetIds = o.forms[0].asset_ids;
        if (assetIds.length === 0) return;

        const tex = this.textures.get(assetIds[0])!;
        const sp = new PIXI.Sprite(tex);
        sp.position.set(o.x, o.y);
        sp.anchor.set(0.5);
        sp.visible = this.isEditorMode;
        if (o.interactive) sp.eventMode = "static";
        if (o.interactive) sp.cursor = "pointer";

        // アニメーションテクスチャの配列を保存
        const textures = assetIds.map((id) => this.textures.get(id)!);
        (sp as any).textures = textures;

        this.sprites.set(o.id, sp);
        this.app.stage.addChild(sp);
      }
    });
  }

  private tick = () => {
    const now = performance.now() - this.startAt;

    this.events
      .filter(
        (e): e is Extract<Event, { trigger: { type: "time" } }> =>
          e.trigger.type === "time" && now >= e.trigger.at,
      )
      .forEach((event) => {
        event.actions.forEach((action) => this.exec(action));
        this.events.splice(this.events.indexOf(event), 1);
      });
  };

  private exec(action: Event["actions"][0]) {
    console.log("Executing action:", action);
    switch (action.type) {
      case "show":
        this.sprites.get(action.target)!.visible = true;
        break;
      case "hide":
        this.sprites.get(action.target)!.visible = false;
        break;
      case "tween": {
        const sp = this.sprites.get(action.target)!;
        console.log("Tween target:", sp);
        console.log("Tween properties:", action.to);
        const start = {
          x: sp.x,
          y: sp.y,
          rotation: sp.rotation,
        };
        const end = action.to;
        const startTime = Date.now();
        const duration = action.dur;
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          if (progress < 1) {
            if (end.x !== undefined) {
              sp.x = start.x + (end.x - start.x) * progress;
            }
            if (end.y !== undefined) {
              sp.y = start.y + (end.y - start.y) * progress;
            }
            if (end.rotation !== undefined) {
              sp.rotation =
                start.rotation + (end.rotation - start.rotation) * progress;
            }
            requestAnimationFrame(animate);
          } else {
            if (end.x !== undefined) sp.x = end.x;
            if (end.y !== undefined) sp.y = end.y;
            if (end.rotation !== undefined) sp.rotation = end.rotation;
          }
        };
        animate();
        break;
      }
      case "sfx":
        this.audio.get(action.asset)?.play();
        break;
      case "end":
        this.reset();
        break;
      case "animate": {
        const sprite = this.sprites.get(action.target) as PIXI.Sprite;
        if (!sprite || !(sprite instanceof PIXI.Sprite)) return;

        const textures = (sprite as any).textures;
        if (!textures || textures.length <= 1) return;

        let currentFrame = 0;
        const frameRate = action.frameRate ?? 10;
        const frameInterval = 1000 / frameRate;
        let lastFrameTime = Date.now();

        const animate = () => {
          const now = Date.now();
          if (now - lastFrameTime >= frameInterval) {
            currentFrame = (currentFrame + 1) % textures.length;
            sprite.texture = textures[currentFrame];
            lastFrameTime = now;
          }

          if (action.loop !== false || currentFrame < textures.length - 1) {
            requestAnimationFrame(animate);
          }
        };

        animate();
        break;
      }
    }
  }

  private reset() {
    // イベントリスナーのクリーンアップ
    for (const [_, sprite] of this.sprites) {
      sprite.removeAllListeners();
    }

    this.app.stage.removeChildren();
    this.sprites.clear();
    this.events = [...this.data.events];

    this.setupBackgroundImage();
    this.buildObjects();
    this.startAt = performance.now();

    // クリックイベントの再設定
    this.data.events
      .filter(
        (e): e is Extract<Event, { trigger: { type: "click" } }> =>
          e.trigger.type === "click",
      )
      .forEach((event) => {
        const sp = this.sprites.get(event.trigger.targetId)! as PIXI.Sprite;
        sp.on(
          "pointertap",
          () => {
            event.actions.forEach((action) => this.exec(action));
          },
          { once: true },
        );
      });
  }
}
