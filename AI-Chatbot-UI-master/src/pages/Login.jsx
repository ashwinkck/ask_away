import React, { useEffect } from 'react'
import { Box, Center, useColorModeValue } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/Auth/LoginForm'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const Login = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const bg = useColorModeValue('gray.50', 'gray.900')

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/')
    }
  }, [user, navigate])

  return (
    <MotionBox
      minH="100vh"
      bg={bg}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Center minH="100vh">
        <LoginForm />
      </Center>
    </MotionBox>
  )
}

export default Login