import { FiEye, FiEyeOff } from 'react-icons/fi' // Replace ViewIcon, ViewOffIcon
import React, { useState } from 'react'
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Link,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hyperspeed from '../Hyperspeed'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const result = await login(email, password)
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  return (
    <Box 
      position="relative" 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg={useColorModeValue('white', '#000000')}
      w="100vw"
      h="100vh"
      overflow="hidden"
    >
      <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={0}>
        <Hyperspeed />
      </Box>
      <MotionBox
        maxW="xl"
        mx="auto"
        p={10}
        borderRadius="2xl"
        borderWidth="2px"
        borderColor="rgba(255,255,255,0.4)"
        shadow="2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        zIndex={1}
        position="relative"
        bg="rgba(0,0,0,0.4)"
        backdropFilter="blur(8px)"
      >
        <VStack spacing={8} as="form" onSubmit={handleSubmit}>
          <Text fontSize="4xl" fontWeight="bold" color="white" textShadow="0 0 20px rgba(255,255,255,0.7)">
            Welcome Back
          </Text>
          {error && (
            <Alert status="error" borderRadius="lg" bg="rgba(255,0,0,0.3)" borderColor="red.400" p={4}>
              <AlertIcon />
              <Text color="white" fontSize="md">{error}</Text>
            </Alert>
          )}
          <Input
            aria-label="Email input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            size="lg"
            focusBorderColor="white"
            bg="rgba(255,255,255,0.15)"
            borderColor="rgba(255,255,255,0.4)"
            color="white"
            _placeholder={{ color: 'rgba(255,255,255,0.7)' }}
            _hover={{ bg: 'rgba(255,255,255,0.2)' }}
            _focus={{ bg: 'rgba(255,255,255,0.25)' }}
            fontSize="lg"
            h="60px"
            p={4}
          />
          <InputGroup>
            <Input
              aria-label="Password input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="lg"
              focusBorderColor="white"
              bg="rgba(255,255,255,0.15)"
              borderColor="rgba(255,255,255,0.4)"
              color="white"
              _placeholder={{ color: 'rgba(255,255,255,0.7)' }}
              _hover={{ bg: 'rgba(255,255,255,0.2)' }}
              _focus={{ bg: 'rgba(255,255,255,0.25)' }}
              fontSize="lg"
              h="60px"
              p={4}
            />
            <InputRightElement h="60px">
              <IconButton
                aria-label="Toggle password visibility"
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="lg"
                color="white"
                _hover={{ bg: 'rgba(255,255,255,0.15)' }}
              />
            </InputRightElement>
          </InputGroup>
          <MotionButton
            type="submit"
            size="lg"
            width="full"
            isLoading={loading}
            spinner={<Spinner size="lg" />}
            loadingText="Signing in..."
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            bg="rgba(255,255,255,0.25)"
            color="white"
            borderColor="rgba(255,255,255,0.4)"
            borderWidth="2px"
            _hover={{ bg: 'rgba(255,255,255,0.35)' }}
            _active={{ bg: 'rgba(255,255,255,0.45)' }}
            fontSize="lg"
            h="60px"
            fontWeight="bold"
            p={6}
          >
            Sign In
          </MotionButton>
          <Text fontSize="lg" color="rgba(255,255,255,0.9)" textAlign="center">
            Need access?{' '}
            <Link color="white" href="mailto:admin@example.com" textDecoration="underline" fontWeight="bold">
              Contact admin
            </Link>
          </Text>
        </VStack>
      </MotionBox>
    </Box>
  )
}

export default LoginForm