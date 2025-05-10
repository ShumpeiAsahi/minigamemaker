import React from "react";
import {
  Box,
  Container,
  Flex,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      py={8}
    >
      <Container maxW="container.xl">
        <Flex direction="column" align="center" gap={4}>
          <Flex
            gap={{ base: 4, md: 8 }}
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="center"
            wrap="wrap"
          >
            <Link
              as={RouterLink}
              to="/disclaimer"
              color="gray.600"
              _hover={{ color: "blue.500" }}
            >
              免責事項
            </Link>
            <Link
              as={RouterLink}
              to="/legal"
              color="gray.600"
              _hover={{ color: "blue.500" }}
            >
              特定商取引法に基づく表記
            </Link>
            <Link
              as={RouterLink}
              to="/contact"
              color="gray.600"
              _hover={{ color: "blue.500" }}
            >
              お問い合わせ（運営者のX）
            </Link>
          </Flex>
          <Text textAlign="center" color="gray.600" fontSize="sm" mt={4}>
            Copyright © 2025 Beavers
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
