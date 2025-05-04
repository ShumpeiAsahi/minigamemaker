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
  private selected?: PIXI.Sprite;

  constructor(data: GameJSON, mount: HTMLElement) {
    this.game = new MicroGame(data, mount);
  }

  async init() {
    await this.game.ready();
    this.setupEditorMode();
  }

  private setupEditorMode() {
    const sprites = this.game.getSprites();

    sprites.forEach((sp) => {
      sp.eventMode = "static";
      sp.cursor = "move";
      sp.visible = true;

      sp.on("pointerdown", this.onSelect);
    });
  }

  private onSelect = (e: PIXI.FederatedPointerEvent) => {
    this.selected = e.currentTarget as PIXI.Sprite;

    const onMove = (ev: PIXI.FederatedPointerEvent) => {
      if (!this.selected) return;
      this.selected.position.set(ev.globalX, ev.globalY);
    };

    const onUp = () => {
      this.selected = undefined;
      this.game.getApp().stage.off("pointermove", onMove);
      this.game.getApp().stage.off("pointerup", onUp);
    };

    this.game.getApp().stage.on("pointermove", onMove);
    this.game.getApp().stage.on("pointerup", onUp);
  };
}
