import { Button, Icon } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import type { Event } from "../../../packages/runtime/src/types";

type AddEventButtonProps = {
  onAdd: (event: Event) => void;
};

export function AddEventButton({ onAdd }: AddEventButtonProps) {
  const handleAddEvent = () => {
    const newEvent: Event = {
      trigger: {
        type: "time",
        at: 0,
      },
      actions: [
        {
          type: "show",
          target: "",
        },
      ],
    };
    onAdd(newEvent);
  };

  return (
    <Button leftIcon={<Icon as={FaPlus} />} size="sm" onClick={handleAddEvent}>
      イベントを追加
    </Button>
  );
}
