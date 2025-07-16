import { FiSun, FiMoon } from 'react-icons/fi'
import React from 'react'
import {
  Flex,
  Text,
  IconButton,
  Button,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  Link as RouterLink
} from '@chakra-ui/react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const MotionFlex = motion.create(Flex)
const MotionIconButton = motion.create(IconButton)
const MotionButton = motion.create(Button)

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const bg = useColorModeValue('white', 'gray.800')
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleAdminClick = () => {
    navigate('/admin')
  }

  return (
    <MotionFlex
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bg}
      px={4}
      py={3}
      justify="space-between"
      align="center"
      shadow="sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        transition: 'background-color 0.3s ease',
      }}
    >
      <Text fontSize={isMobile ? 'lg' : 'xl'} fontWeight="bold" color="brand.500">
        AskAway
      </Text>
      
      <Flex align="center" gap={2}>
        {user && (
          <Text fontSize="sm" color="gray.500" display={{ base: 'none', md: 'block' }}>
            {user.role === 'admin' ? 'admin' : user.email || 'User'}
          </Text>
        )}
        
        {user?.role === 'admin' && (
          <MotionButton
            onClick={handleAdminClick} // Use onClick instead of RouterLink for direct navigation
            colorScheme="blue"
            size="sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Admin Dashboard
          </MotionButton>
        )}
        
        <MotionIconButton
          aria-label="Toggle color mode"
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          onClick={toggleColorMode}
          size="sm"
          variant="ghost"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
        
        {user && (
          <MotionButton
            aria-label="Logout button"
            colorScheme="gray"
            size="sm"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </MotionButton>
        )}
      </Flex>
    </MotionFlex>
  )
}

export default Header
