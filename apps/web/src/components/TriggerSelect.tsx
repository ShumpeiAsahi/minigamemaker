import { Select } from "@chakra-ui/react";
import { triggerOptions, type TriggerType } from "../utils/events";

type TriggerSelectProps = {
  value: TriggerType;
  onChange: (value: TriggerType) => void;
};

export function TriggerSelect({ value, onChange }: TriggerSelectProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as TriggerType)}
    >
      {triggerOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
