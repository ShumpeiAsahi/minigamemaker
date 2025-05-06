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

  async ready() {
    const { width, height, bgColor } = this.data.meta;

    this.app = new PIXI.Application({
      width,
      height,
      background: bgColor,
      antialias: true,
    });
    this.mount.innerHTML = "";
    this.mount.appendChild(this.app.view as HTMLCanvasElement);

    await this.loadAssets();
    this.buildObjects();
  }

  async run(loop = true) {
    this.events = [...this.data.events];
    this.startAt = performance.now();
    this.app.ticker.add(this.tick(loop));

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
    const imageUrls: string[] = [];
    this.data.assets.forEach((a) => {
      if (/\.(png|jpg|gif)$/i.test(a.url) || a.url.startsWith("data:image/")) {
        imageUrls.push(a.url);
      } else if (/\.(wav|mp3)$/i.test(a.url))
        this.audio.set(a.id, new Audio(a.url));
    });

    await Assets.load(imageUrls);

    for (const url of imageUrls) {
      const tex = Assets.get(url) as PIXI.Texture;
      const id = this.data.assets.find((a) => a.url === url)!.id;
      this.textures.set(id, tex);
    }
  }

  private buildObjects() {
    this.data.objects.forEach((o) => {
      const tex = this.textures.get(o.forms[0].asset_id)!;
      const sp = new PIXI.Sprite(tex);
      console.log(o);
      sp.position.set(o.x, o.y);
      sp.anchor.set(0.5);
      sp.visible = this.isEditorMode;
      if (o.interactive) sp.eventMode = "static";
      if (o.interactive) sp.cursor = "pointer";

      this.sprites.set(o.id, sp);
      this.app.stage.addChild(sp);
    });
  }

  private tick = (loop = true) => {
    const now = performance.now() - this.startAt;
    if (loop && now > this.data.meta.loopMs) {
      this.reset();
      return;
    }

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
    switch (action.type) {
      case "show":
      case "hide":
        this.sprites.get(action.target)!.visible = action.type === "show";
        break;

      case "tween": {
        const sp = this.sprites.get(action.target)!;
        gsap.to(sp, {
          duration: action.dur / 1000,
          pixi: action.to as any,
          ease: "quad.inOut",
        });
        break;
      }

      case "sfx":
        this.audio.get(action.asset)?.play();
        break;

      case "text": {
        const txt = new PIXI.Text(action.txt, action.style);

        txt.updateText();

        txt.pivot.set(txt.width / 2, txt.height / 2);
        txt.position.set(this.app.screen.width / 2, this.app.screen.height / 8);

        this.app.stage.addChild(txt);
        break;
      }

      case "end":
        this.reset();
        break;
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
