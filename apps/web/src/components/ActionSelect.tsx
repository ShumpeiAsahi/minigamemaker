import { Select } from "@chakra-ui/react";

type ActionType = "show" | "hide" | "tween" | "animate" | "end";

interface ActionSelectProps {
  value: ActionType;
  onChange: (type: ActionType) => void;
}

export function ActionSelect({ value, onChange }: ActionSelectProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as ActionType)}
    >
      <option value="show">表示</option>
      <option value="hide">非表示</option>
      <option value="tween">移動</option>
      <option value="animate">アニメーション</option>
      <option value="end">終了</option>
    </Select>
  );
}
