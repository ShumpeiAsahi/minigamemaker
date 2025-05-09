import {
  Box,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  FormControl,
  FormHelperText,
} from "@chakra-ui/react";
import type { Event, Object } from "../../../../../packages/runtime/src/types";

type TweenType = "move" | "rotate";

type ActionSettingsProps = {
  type: string;
  value: Event["actions"][0];
  objects: Object[];
  onChange: (settings: Partial<Event["actions"][0]>) => void;
};

export function ActionSettings({
  type,
  value,
  objects,
  onChange,
}: ActionSettingsProps) {
  switch (type) {
    case "show":
    case "hide":
      return (
        <Box>
          <FormLabel>対象オブジェクト</FormLabel>
          <Select
            value={value.target}
            onChange={(e) => onChange({ target: e.target.value })}
          >
            <option value="">オブジェクトを選択</option>
            {objects.map((object) => (
              <option key={object.id} value={object.id}>
                {object.name}
              </option>
            ))}
          </Select>
        </Box>
      );

    case "tween": {
      const tweenType = value.to?.rotation !== undefined ? "rotate" : "move";
      return (
        <VStack spacing={4} align="stretch">
          <Box>
            <FormLabel>対象オブジェクト</FormLabel>
            <Select
              value={value.target}
              onChange={(e) => onChange({ target: e.target.value })}
            >
              <option value="">オブジェクトを選択</option>
              {objects.map((object) => (
                <option key={object.id} value={object.id}>
                  {object.name}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <FormLabel>アニメーションの種類</FormLabel>
            <Select
              value={tweenType}
              onChange={(e) => {
                const type = e.target.value as TweenType;
                if (type === "rotate") {
                  onChange({ to: { rotation: value.to?.rotation ?? 6.283 } });
                } else {
                  onChange({
                    to: { x: value.to?.x ?? 0, y: value.to?.y ?? 0 },
                  });
                }
              }}
            >
              <option value="move">移動</option>
              <option value="rotate">回転</option>
            </Select>
          </Box>
          {tweenType === "move" ? (
            <>
              <Box>
                <FormLabel>移動先のX座標</FormLabel>
                <NumberInput
                  value={value.to?.x ?? 0}
                  onChange={(_, x) => onChange({ to: { ...value.to, x } })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Box>
                <FormLabel>移動先のY座標</FormLabel>
                <NumberInput
                  value={value.to?.y ?? 0}
                  onChange={(_, y) => onChange({ to: { ...value.to, y } })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </>
          ) : (
            <Box>
              <FormLabel>回転角度（ラジアン）</FormLabel>
              <NumberInput
                value={value.to?.rotation ?? 6.283}
                onChange={(_, rotation) => onChange({ to: { rotation } })}
                min={0}
                max={6.283}
                step={0.1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          )}
          <Box>
            <FormLabel>移動時間（ミリ秒）</FormLabel>
            <NumberInput
              value={value.dur ?? 1000}
              onChange={(_, dur) => onChange({ dur })}
              min={0}
              step={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </VStack>
      );
    }

    case "animate":
      return (
        <Box>
          <FormControl>
            <FormLabel>対象オブジェクト</FormLabel>
            <Select
              value={value.target}
              onChange={(e) => onChange({ target: e.target.value })}
            >
              <option value="">オブジェクトを選択</option>
              {objects.map((object) => (
                <option key={object.id} value={object.id}>
                  {object.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>フレームレート（fps）</FormLabel>
            <Input
              type="number"
              value={value.frameRate ?? 10}
              onChange={(e) =>
                onChange({ ...value, frameRate: Number(e.target.value) })
              }
            />
          </FormControl>

          <FormControl display="flex" alignItems="center" mt={4}>
            <FormLabel htmlFor="loop" mb="0">
              ループ再生
            </FormLabel>
            <Switch
              id="loop"
              isChecked={value.loop !== false}
              onChange={(e) => onChange({ ...value, loop: e.target.checked })}
            />
            <FormHelperText ml={2} mb={0}>
              オフにすると1回だけ再生されます
            </FormHelperText>
          </FormControl>
        </Box>
      );

    default:
      return null;
  }
}
