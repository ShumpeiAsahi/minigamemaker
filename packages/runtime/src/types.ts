import * as PIXI from "pixi.js";

export type GameJSON = {
  meta: { width: number; height: number; bgColor: string; loopMs: number };
  assets: { id: string; url: string }[];
  objects: {
    id: string;
    asset: string;
    x: number;
    y: number;
    anchor?: number;
    interactive?: boolean;
  }[];
  timeline: TimelineStep[];
};

export type TimelineStep =
  | { at: number; action: "show" | "hide"; target: string }
  | {
      at: number;
      action: "tween";
      target: string;
      to: Partial<PIXI.DisplayObject>;
      dur: number;
    }
  | { on: string; target: string; then: TimelineStep[] }
  | { action: "sfx"; asset: string }
  | { action: "text"; txt: string; style: PIXI.TextStylePartial }
  | { action: "end" };
