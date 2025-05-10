import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Footer from "../components/Footer";

const sampleGames = [
  {
    id: "dummy-game",
    title: "サンプルゲーム",
    description: "クリックして遊べる簡単なゲーム",
    imageUrl: "/sample-game.png",
  },
];

export default function Home() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box bg={bgColor} minH="100vh" display="flex" flexDirection="column">
      <Box flex="1">
        {/* ヒーローセクション */}
        <Box py={20} textAlign="center">
          <Container maxW="container.xl">
            <VStack spacing={6}>
              <Heading
                as="h1"
                size="2xl"
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
              >
                誰でも遊べる・作れるミニゲーム体験
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl">
                プログラミングの知識がなくても、直感的な操作でオリジナルのミニゲームを作成できます。
                作ったゲームはすぐに遊べる、シンプルで楽しいゲーム制作プラットフォームです。
              </Text>
              <Button
                as={RouterLink}
                to="/edit"
                size="lg"
                colorScheme="blue"
                mt={8}
              >
                まずは作ってみよう！
              </Button>
            </VStack>
          </Container>
        </Box>

        {/* サンプルゲームセクション */}
        <Box py={16}>
          <Container maxW="container.xl">
            <VStack spacing={12}>
              <Heading as="h2" size="xl">
                サンプルゲーム
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {sampleGames.map((game) => (
                  <Box
                    key={game.id}
                    bg={cardBg}
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="md"
                    transition="transform 0.2s"
                    _hover={{ transform: "scale(1.02)" }}
                  >
                    <Image
                      src={game.imageUrl}
                      alt={game.title}
                      w="full"
                      h="48"
                      objectFit="cover"
                    />
                    <Box p={6}>
                      <Heading as="h3" size="md" mb={2}>
                        {game.title}
                      </Heading>
                      <Text color="gray.600" mb={4}>
                        {game.description}
                      </Text>
                      <Button
                        as={RouterLink}
                        to={`/games/${game.id}`}
                        colorScheme="blue"
                        variant="outline"
                        w="full"
                      >
                        プレイする
                      </Button>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
