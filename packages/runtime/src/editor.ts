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
  private mount: HTMLElement;
  constructor(
    data: GameJSON,
    mount: HTMLElement,
    private onPositionUpdate: (id: string, x: number, y: number) => void,
  ) {
    this.game = new MicroGame(data, mount);
    this.mount = mount;
  }

  async init() {
    await this.game.ready();
    this.setupEditorMode();
  }

  updateGameJSON(data: GameJSON) {
    const sprites = this.game.getSprites();
    for (const [id, sprite] of sprites) {
      const object = data.objects.find((obj) => obj.id === id);
      if (object) {
        sprite.position.set(object.x, object.y);
      }
    }
  }

  private setupEditorMode() {
    const sprites = this.game.getSprites();

    sprites.forEach((sp) => {
      sp.eventMode = "static";
      sp.cursor = "move";
      sp.visible = true;

      sp.on("pointerdown", this.onSelect);
    });
    this.enableDrag();
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

  private enableDrag() {
    const sprites = this.game.getSprites();

    sprites.forEach((sp) => {
      const id = [...this.game.getSprites().entries()].find(
        ([, s]) => s === sp,
      )?.[0];
      if (!id) return;

      sp.eventMode = "static";
      sp.cursor = "move";

      sp.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
        console.log("pointerdown");
        const onMove = (ev: PIXI.FederatedPointerEvent) => {
          sp.position.set(ev.globalX, ev.globalY);
        };
        const onUp = () => {
          console.log("onUp");
          sp.off("pointermove", onMove);
          sp.off("pointerup", onUp);
          this.onPositionUpdate(id, sp.x, sp.y);
        };

        sp.on("pointermove", onMove);
        sp.on("pointerup", onUp);
      });
    });
  }
}
