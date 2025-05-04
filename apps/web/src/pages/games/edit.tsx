import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Editor } from "../../../../../packages/runtime/src/editor";
import { useEffect, useRef } from "react";
import gameData from "../../assets/sample-game.json";
import type { GameJSON } from "../../../../../packages/runtime/src/types";
import { useForm, FormProvider, useWatch } from "react-hook-form";

export default function Edit() {
  const mountRef = useRef<HTMLDivElement>(null);

  const methods = useForm<GameJSON>({
    defaultValues: gameData,
  });

  const objects = useWatch({ control: methods.control, name: "objects" });

  useEffect(() => {
    if (!mountRef.current) return;
    const editor = new Editor(methods.getValues(), mountRef.current); // JSONを取得して渡す
    editor.init();

    return () => {
      // editor.destroy() があるならここで呼ぶ
    };
  }, []);

  return (
    <FormProvider {...methods}>
      <Box
        width="100%"
        maxW="540px"
        mx="auto"
        position="relative"
        sx={{
          "& canvas": {
            width: "100% !important",
            height: "auto !important",
            display: "block",
          },
        }}
      >
        <Heading size="lg" mb={4}>
          ゲームエディタ
        </Heading>
        <Heading size="md" mb={4}>
          オブジェクト
        </Heading>
        <Accordion allowMultiple>
          {objects.map((object) => (
            <AccordionItem key={object.id}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {object.name}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text>アセット: {object.asset}</Text>
                <Text>X座標: {object.x}</Text>
                <Text>Y座標: {object.y}</Text>
                <Text>アンカー: {object.anchor}</Text>
                <Text>
                  インタラクティブ: {object.interactive ? "はい" : "いいえ"}
                </Text>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        <Box ref={mountRef} />
      </Box>
    </FormProvider>
  );
}
