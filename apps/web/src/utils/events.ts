import type { Event, Object } from "../../../packages/runtime/src/types";

export type EventType = "time" | "click" | "unknown";

export function getEventType(event: Event): EventType {
  // 時間イベントの判定
  if ("at" in event) {
    return "time";
  }

  // クリックイベントの判定
  if ("on" in event && event.on === "pointertap") {
    return "click";
  }

  // 将来的な拡張のために、他のイベントタイプの判定をここに追加できます
  // 例：
  // if ("on" in event && event.on === "pointerdown") {
  //   return "pointerdown";
  // }

  return "unknown";
}

export function buildEventFormLabel(event: Event, objects: Object[]): string {
  const eventType = getEventType(event);
  const object = objects.find((o) => o.id === event.target);

  if (!object && eventType === "click") {
    return "不明なイベント";
  }
  switch (eventType) {
    case "time":
      return `${event.at / 1000}秒経過した時`;
    case "click":
      return `${object?.name}がクリックされた時`;
    default:
      return "不明なイベント";
  }
}
