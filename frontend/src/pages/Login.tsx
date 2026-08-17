import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Input, Text, Flex, Heading, Image, Link } from "@chakra-ui/react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // step 1: submit email + password
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setIsSubmitting(false);
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("image")) {
      // first time login -> got a QR code back
      const blob = await res.blob();
      setQrUrl(URL.createObjectURL(blob));
      setStep("code");
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      setIsError(true);
      setMessage(data.error ?? "something went wrong");
      return;
    }

    if (data.requiresCode) {
      setStep("code"); // already enrolled, no QR needed, just ask for code
    }
  };

  // step 2: submit the 6-digit code (with or without QR shown above it)
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code }),
    });

    const data = await res.json();
    setIsSubmitting(false);

    if (!res.ok) {
      setIsError(true);
      setMessage(data.error ?? "invalid code");
      return;
    }

    navigate("/home");
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box maxW="400px" w="100%" bg="white" p="8" rounded="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
        <Heading size="lg" mb="6" textAlign="center">
          {step === "credentials" ? "Log in" : "Enter your code"}
        </Heading>

        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit}>
            <FormControl mb="4">
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} isDisabled={isSubmitting} />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} isDisabled={isSubmitting} />
            </FormControl>
            <Button type="submit" colorScheme="blue" width="100%" isLoading={isSubmitting}>
              Continue
            </Button>
            <Text mt="4" textAlign="center" fontSize="sm">
              Don't have an account?{" "}
              <Link as={RouterLink} to="/register" color="blue.500">
                Register
              </Link>
            </Text>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleCodeSubmit}>
            {qrUrl && (
              <Box textAlign="center" mb="4">
                <Text mb="2" fontSize="sm" color="gray.600">Scan this with your authenticator app</Text>
                <Image src={qrUrl} alt="2FA QR code" mx="auto" />
              </Box>
            )}
            <FormControl mb="4">
              <FormLabel>6-digit code</FormLabel>
              <Input value={code} onChange={(e) => setCode(e.target.value)} isDisabled={isSubmitting} />
            </FormControl>
            <Button type="submit" colorScheme="blue" width="100%" isLoading={isSubmitting}>
              Verify
            </Button>
          </form>
        )}

        {message && (
          <Text mt="4" color={isError ? "red.500" : "green.500"} textAlign="center">
            {message}
          </Text>
        )}
      </Box>
    </Flex>
  );
}

export default Login;