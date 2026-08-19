import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Flex,
  Heading,
  Link,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

type RegisterResponse = {
  message?: string;
  error?: string;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL as string;

function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: RegisterResponse = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error ?? "something went wrong");
        return;
      }

      navigate("/login");
    } catch (err) {
      setIsError(true);
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        maxW="400px"
        w="100%"
        bg="white"
        p="8"
        rounded="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading size="lg" mb="6" textAlign="center">
          Create an account
        </Heading>

        <form onSubmit={handleSubmit}>
          <FormControl mb="4">
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isDisabled={isSubmitting}
            />
          </FormControl>

          <FormControl mb="4">
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isDisabled={isSubmitting}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="100%"
            isLoading={isSubmitting}
          >
            Register
          </Button>

          {message && (
            <Text
              mt="4"
              color={isError ? "red.500" : "green.500"}
              textAlign="center"
            >
              {message}
            </Text>
          )}
        </form>
        <Text mt="4" textAlign="center" fontSize="sm">
          Already have an account?{" "}
          <Link as={RouterLink} to="/login" color="blue.500">
            Log in
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default Register;