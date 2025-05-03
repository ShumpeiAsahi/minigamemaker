import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PixiPlugin from "gsap/PixiPlugin";   // ← パスは gsap/PixiPlugin
import { Assets } from "@pixi/assets";
import '@pixi/events';  

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


type GameJSON = {
  meta:  { width: number; height: number; bgColor: string; loopMs: number };
  assets:  { id: string; url: string }[];
  objects: { id: string; asset: string; x: number; y: number;
             anchor?: number; interactive?: boolean }[];
  timeline: TimelineStep[];
};

type TimelineStep =
  | { at: number;  action: "show" | "hide"; target: string }
  | { at: number;  action: "tween"; target: string;
      to: Partial<PIXI.DisplayObject>; dur: number }
  | { on: string; target: string; then: TimelineStep[] }
  | { action: "sfx"; asset: string }
  | { action: "text"; txt: string; style: PIXI.TextStylePartial }
  | { action: "end" };

export class MicroGame {
  private app!: PIXI.Application;
  private sprites = new Map<string, PIXI.DisplayObject>();
  private audio  = new Map<string, HTMLAudioElement>();
  private steps: TimelineStep[] = [];
  private startAt = 0;
  private textures = new Map<string, PIXI.Texture>();

  constructor(private data: GameJSON, private mount: HTMLElement) {}

  async run() {
    const { width, height, bgColor } = this.data.meta;

    this.app = new PIXI.Application({
      width, height,
      background: bgColor,
      antialias: true
    });
    this.mount.innerHTML = "";
    this.mount.appendChild(this.app.view as HTMLCanvasElement);

    await this.loadAssets();
    this.buildObjects();

    this.steps = [...this.data.timeline];
    this.startAt = performance.now();
    this.app.ticker.add(this.tick);
  }

  private async loadAssets(): Promise<void> {
    const imageUrls: string[] = [];
    this.data.assets.forEach(a => {
      if (/\.(png|jpg|gif)$/i.test(a.url)) imageUrls.push(a.url);
      else if (/\.(wav|mp3)$/i.test(a.url)) this.audio.set(a.id, new Audio(a.url));
    });
  
    await Assets.load(imageUrls);

    for (const url of imageUrls) {
      const tex = Assets.get(url) as PIXI.Texture;
      const id  = this.data.assets.find(a => a.url === url)!.id;
      this.textures.set(id, tex);
    }

  }  

  private buildObjects() {
    this.data.objects.forEach(o => {
      const tex = this.textures.get(o.asset)!;         // ← Texture 取得
      const sp  = new PIXI.Sprite(tex);                // 新規 Sprite
      sp.position.set(o.x, o.y);
      sp.anchor.set(o.anchor ?? 0);
      sp.visible = false;
      if (o.interactive) sp.eventMode = 'static'; 
      if (o.interactive) sp.cursor = 'pointer';
      sp.on('pointertap', () => {
        console.log('pointertap');
      });
       
      this.sprites.set(o.id, sp);                      // o.id で登録
      this.app.stage.addChild(sp);
    });
  }
  
  

  private tick = () => {
    const now = performance.now() - this.startAt;

    if (now > this.data.meta.loopMs) {
      this.reset();
      return;
    }

    this.steps
      .filter((s): s is Extract<TimelineStep, { at: number }> => "at" in s && now >= s.at)
      .forEach(s => {
        this.exec(s);
        this.steps.splice(this.steps.indexOf(s), 1);
      });
  };

  private exec(step: TimelineStep) {
    if ("on" in step) {
      const sp = this.sprites.get(step.target)! as PIXI.Sprite;
      sp.on(step.on, () => step.then.forEach(t => this.exec(t)), { once: true });
      return;
    }

    switch (step.action) {
      case "show":
      case "hide":
        this.sprites.get(step.target)!.visible = step.action === "show";
        break;

        case "tween": {
            const sp = this.sprites.get(step.target)!;
            gsap.to(sp, {
              duration: step.dur / 1000,    // ms → 秒
              pixi: step.to as any,         // 例 { rotation: 6.283, x: 400 }
              ease: "quad.inOut"
            });
            break;
          }
          

      case "sfx":
        this.audio.get(step.asset)?.play();
        break;

      case "text":
        const txt = new PIXI.Text(step.txt, step.style);
        txt.anchor.set(0.5);
        txt.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        this.app.stage.addChild(txt);
        break;

      case "end":
        this.reset();
        break;
    }
  }

  private reset() {
    this.app.stage.removeChildren();  // ← Stage から外すだけ
    this.sprites.clear();             // ← Texture マップは保持
    this.steps  = [...this.data.timeline];
    this.buildObjects();
    this.startAt = performance.now();
  }
  
}
