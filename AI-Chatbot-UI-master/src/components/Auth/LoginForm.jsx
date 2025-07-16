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
    <MotionBox
      maxW="md"
      mx="auto"
      mt={20}
      p={6}
      bg={bg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={4} as="form" onSubmit={handleSubmit}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
          Welcome Back
        </Text>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Input
          aria-label="Email input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="md"
          focusBorderColor="brand.500"
        />
        
        <InputGroup>
          <Input
            aria-label="Password input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="md"
            focusBorderColor="brand.500"
          />
          <InputRightElement>
            <IconButton
              aria-label="Toggle password visibility"
              icon={showPassword ? <FiEyeOff /> : <FiEye />}
              onClick={() => setShowPassword(!showPassword)}
              variant="ghost"
              size="sm"
            />
          </InputRightElement>
        </InputGroup>
        
        <MotionButton
          type="submit"
          colorScheme="blue"
          size="lg"
          width="full"
          isLoading={loading}
          spinner={<Spinner size="sm" />}
          loadingText="Signing in..."
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </MotionButton>
        
        <Text fontSize="sm" color="gray.500">
          Need access?{' '}
          <Link color="brand.500" href="mailto:admin@example.com">
            Contact admin
          </Link>
        </Text>
      </VStack>
    </MotionBox>
  )
}

export default LoginForm