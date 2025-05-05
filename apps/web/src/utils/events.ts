import type {
  Action,
  Event,
  Object,
} from "../../../packages/runtime/src/types";

export type ActionType = "show" | "hide" | "tween";

export const actionOptions: { value: ActionType; label: string }[] = [
  { value: "show", label: "オブジェクトを表示する" },
  { value: "hide", label: "オブジェクトを非表示にする" },
  { value: "tween", label: "オブジェクトを動かす" },
] as const;

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

export function buildActionFormLabel(action: Action): string {
  switch (action.type) {
    case "show":
      return "オブジェクトを表示する";
    case "hide":
      return "オブジェクトを非表示にする";
    case "tween":
      return "オブジェクトを動かす";
    case "sfx":
      return "サウンドを再生する";
    case "text":
      return "テキストを表示する";
    case "end":
      return "ゲームを終了する";
    default:
      return "不明なアクション";
  }
}

export function buildEventFormValue(event: Event, objects: Object[]): string {
  const action = event.actions[0];
  switch (action.type) {
    case "show":
      return `${objects.find((o) => o.id === action.target)?.name}を表示する`;
    case "hide":
      return `${objects.find((o) => o.id === action.target)?.name}を非表示にする`;
    case "tween":
      return `${objects.find((o) => o.id === action.target)?.name}を回転させる`;
    case "sfx":
      return `${objects.find((o) => o.id === action.target)?.name}を再生する`;
    case "text":
      return `"${action.txt}"を表示する`;
    default:
      return "不明なアクション";
  }
}
