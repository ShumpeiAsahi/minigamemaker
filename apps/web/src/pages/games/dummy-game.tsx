import { MicroGame } from "../../../../../packages/runtime/src";
import { useEffect, useRef, useState } from "react";
import gameData from "../../assets/sample-game.json";
import { Box, Text, IconButton, Center, VStack } from "@chakra-ui/react";
import { FaPlay } from "react-icons/fa";

export default function DummyGame() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [game, setGame] = useState<MicroGame | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
      if (!mountRef.current) return;
      const game = new MicroGame(gameData as any, mountRef.current);
      game.ready();
      setGame(game);
      return () => game;
    }, []);
  
    return (    
        <Box
        width="100%"
        maxW="540px"
        mx="auto"
        position="relative"
        sx={{
          '& canvas': {
            width: '100% !important',
            height: 'auto !important',
            display: 'block',
          },
        }}
      >
  <Box ref={mountRef} />
      <Center position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                <VStack spacing={4}>
                    {!isRunning && (
                        <>
                            <Text color="white" textShadow="1px 1px 2px black">
                                Dummy Game
                            </Text>
                            <IconButton
                                aria-label="Run game"
                                icon={<FaPlay />}
                                colorScheme="blue"
                                size="lg"
                                isRound
                        onClick={() => {
                            if (!game) return;
                            setIsRunning(true);
                            game.run();
                        }}
                        />
                        <Text color="white" textShadow="1px 1px 2px black">
                        created by: username
                        {/* // TODO: ユーザー名を取得する */}
                        </Text>
                        </> 
                    )}
                </VStack>
            </Center>
        </Box>
    );
} 