import * as PIXI from "pixi.js";

export type GameJSON = {
  meta: { width: number; height: number; bgColor: string; loopMs: number };
  assets: { id: string; url: string }[];
  objects: Object[];
  events: Event[];
};

export type Object = {
  id: string;
  name: string;
  forms: Form[];
  x: number;
  y: number;
};

export type Form = {
  index: number;
  name: string;
  asset_id?: string;
};

export type Asset = {
  id: string;
  name: string;
  url: string;
};

export type Event =
  | { at: number; action: "show" | "hide"; target: string }
  | {
      at: number;
      action: "tween";
      target: string;
      to: Partial<PIXI.DisplayObject>;
      dur: number;
    }
  | { on: string; target: string; then: Event[] }
  | { action: "sfx"; asset: string }
  | { action: "text"; txt: string; style: PIXI.TextStylePartial }
  | { action: "end" };
