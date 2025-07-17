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
  const bg = useColorModeValue('white', '#000000')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const borderColor = useColorModeValue('gray.300', 'gray.700')
  const logoTextColor = useColorModeValue('gray.800', 'white')
  const userTextColor = useColorModeValue('gray.600', 'gray.300')
  const buttonBg = useColorModeValue('#f4f6fa', '#1a1a1a')
  const buttonHoverBg = useColorModeValue('#e2e8f0', '#2a2a2a')

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
      px={8}
      py={4}
      justify="space-between"
      align="center"
      boxShadow="none"
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Logo + name */}
      <Flex align="center" gap={3}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#23272F"/><path d="M24 12L28.3923 21.1764L38 22.3923L30.8 29.6077L32.7846 39L24 34.1764L15.2154 39L17.2 29.6077L10 22.3923L19.6077 21.1764L24 12Z" fill="#646cff"/></svg>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color={logoTextColor} letterSpacing="wide" style={{ fontFamily: 'Staatliches, sans-serif' }}>
            AskAway
          </Text>
        </span>
      </Flex>
      {/* User controls */}
      <Flex align="center" gap={3}>
        {user && (
          <Text fontSize="md" color={userTextColor} display={{ base: 'none', md: 'block' }} fontWeight="medium">
            {user.role === 'admin' ? 'admin' : user.email || 'User'}
          </Text>
        )}
        {user?.role === 'admin' && (
          <MotionButton
            onClick={handleAdminClick}
            size="md"
            variant="ghost"
            borderRadius="full"
            px={6}
            py={2}
            bg={buttonBg}
            color={logoTextColor}
            _hover={{ bg: buttonHoverBg }}
            _active={{ bg: buttonHoverBg }}
            _focus={{ boxShadow: '0 0 0 2px #646cff' }}
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
          size="md"
          variant="ghost"
          borderRadius="full"
          bg={buttonBg}
          color={logoTextColor}
          _hover={{ bg: buttonHoverBg }}
          _active={{ bg: buttonHoverBg }}
          _focus={{ boxShadow: '0 0 0 2px #646cff' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
        {user && (
          <MotionButton
            aria-label="Logout button"
            size="md"
            variant="ghost"
            borderRadius="full"
            px={6}
            py={2}
            bg={buttonBg}
            color={logoTextColor}
            _hover={{ bg: buttonHoverBg }}
            _active={{ bg: buttonHoverBg }}
            _focus={{ boxShadow: '0 0 0 2px #646cff' }}
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
