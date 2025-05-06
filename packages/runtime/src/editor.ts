import { MicroGame } from "./index";
import type { GameJSON } from "./types";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PixiPlugin from "gsap/PixiPlugin";
import "@pixi/events";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

export class Editor {
  private game: MicroGame;
  private mount: HTMLElement;
  private spritePositions = new Map<string, { x: number; y: number }>();

  constructor(
    data: GameJSON,
    mount: HTMLElement,
    private onPositionUpdate: (id: string, x: number, y: number) => void,
  ) {
    this.game = new MicroGame(data, mount, true);
    this.mount = mount;
  }

  async init() {
    await this.game.ready();
    this.setupEditorMode();
  }

  updateGameJSON(data: GameJSON) {
    for (const [id, sprite] of this.game.getSprites()) {
      this.spritePositions.set(id, { x: sprite.x, y: sprite.y });
    }

    this.game = new MicroGame(data, this.mount, true);
    this.game.ready().then(() => {
      this.setupEditorMode();
    });
  }

  private setupEditorMode() {
    const sprites = this.game.getSprites();
    for (const [id, sprite] of sprites) {
      const savedPosition = this.spritePositions.get(id);
      if (savedPosition) {
        sprite.position.set(savedPosition.x, savedPosition.y);
      }

      sprite.eventMode = "static";
      sprite.cursor = "move";
      sprite.visible = true;

      sprite.removeAllListeners();

      sprite.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
        e.stopPropagation();
        const onMove = (ev: PIXI.FederatedPointerEvent) => {
          sprite.position.set(ev.globalX, ev.globalY);
        };
        const onUp = () => {
          sprite.off("pointermove", onMove);
          sprite.off("pointerup", onUp);
          this.onPositionUpdate(id, sprite.x, sprite.y);
          this.spritePositions.set(id, { x: sprite.x, y: sprite.y });
        };

        sprite.on("pointermove", onMove);
        sprite.on("pointerup", onUp);
      });
    }
  }

  async run() {
    await this.game.run(false);
  }
}
