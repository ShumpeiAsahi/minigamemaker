import * as PIXI from "pixi.js";

export type GameJSON = {
  meta: {
    width: number;
    height: number;
    bgColor: string;
    loopMs: number;
    title: string;
    user: {
      name: string;
      id: string | null;
    };
  };
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

export type Event = {
  trigger: Trigger;
  actions: [Action]; // 1つだけだが、将来的に配列拡張できる形
};

export type Time = { type: "time"; at: number };
export type Click = { type: "click"; targetId: string };
export type Trigger = Time | Click;

export type Action =
  | { type: "show" | "hide"; target: string }
  | {
      type: "tween";
      target: string;
      to: Partial<PIXI.DisplayObject>;
      dur: number;
    }
  | { type: "sfx"; asset: string }
  | { type: "text"; txt: string; style: PIXI.TextStylePartial }
  | { type: "end" };
