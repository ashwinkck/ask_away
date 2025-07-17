import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Container,
  Divider
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Layout/Header'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const Settings = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const bg = useColorModeValue('gray.50', '#000000')
  const cardBg = useColorModeValue('white', '#1a1a1a')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <MotionBox
      minH="100vh"
      bg={bg}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      
      <Container maxW="md" pt="90px" pb={8}>
        <MotionBox
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={6} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" textAlign="center" color={textColor}>
              Account Settings
            </Text>
            
            <Divider borderColor={borderColor} />
            
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" color={secondaryTextColor} mb={1}>
                  Email Address
                </Text>
                <Text fontSize="md" fontWeight="medium" color={textColor}>
                  {user?.email}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color={secondaryTextColor} mb={1}>
                  Role
                </Text>
                <Text fontSize="md" fontWeight="medium" textTransform="capitalize" color={textColor}>
                  {user?.role}
                </Text>
              </Box>
            </VStack>
            
            <Divider borderColor={borderColor} />
            
            <VStack spacing={3}>
              <Button
                colorScheme="blue"
                size="md"
                isDisabled
                width="full"
              >
                Change Password (Coming Soon)
              </Button>
              
              <MotionButton
                aria-label="Logout button"
                colorScheme="gray"
                size="md"
                width="full"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </MotionButton>
            </VStack>
          </VStack>
        </MotionBox>
      </Container>
    </MotionBox>
  )
}

export default Settings