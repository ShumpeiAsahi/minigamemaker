import type { Event, Object } from "../../../packages/runtime/src/types";

export function buildEventFormLabel(event: Event, objects: Object[]): string {
  const triggerType = event.trigger.type;
  const object = objects.find((o) => o.id === event.trigger.targetId);

  if (!object && triggerType === "click") {
    return "不明なイベント";
  }
  switch (triggerType) {
    case "time":
      return `${event.trigger.at / 1000}秒経過した時`;
    case "click":
      return `${object?.name}がクリックされた時`;
    default:
      return "不明なイベント";
  }
}
