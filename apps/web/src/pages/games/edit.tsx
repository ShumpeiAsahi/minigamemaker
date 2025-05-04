import { Box, Heading, Text } from "@chakra-ui/react";
import { Editor } from "../../../../../packages/runtime/src/editor";
import { useEffect, useRef, useState } from "react";
import gameData from "../../assets/sample-game.json";
import type { GameJSON } from "../../../../../packages/runtime/src/types";

export default function Edit() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Editor | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const editor = new Editor(gameData as GameJSON, mountRef.current);
    setGame(editor);
  }, []);
  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>
        ゲームエディタ
      </Heading>
      <Text>ここにエディタの内容が入ります</Text>
      <div ref={mountRef} />
    </Box>
  );
}
