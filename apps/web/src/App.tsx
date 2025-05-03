import { useEffect, useRef } from "react";
import { MicroGame } from "@my-maker/runtime";
import gameData from "./assets/sample-game.json";

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const game = new MicroGame(gameData as any, mountRef.current);
    game.run();
    return () => game;              // アンマウント時にガベージ回収
  }, []);

  return <div ref={mountRef} />;
}
