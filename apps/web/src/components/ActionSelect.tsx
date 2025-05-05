import { Select } from "@chakra-ui/react";
import { actionOptions, type ActionType } from "../utils/events";

type ActionSelectProps = {
  value: ActionType;
  onChange: (value: ActionType) => void;
};

export function ActionSelect({ value, onChange }: ActionSelectProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as ActionType)}
    >
      {actionOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
