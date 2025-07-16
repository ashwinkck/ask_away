import React, { useState, useEffect } from 'react'
import {
  Box,
  Textarea,
  Button,
  HStack,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'
import { motion } from 'framer-motion'

const MotionButton = motion.create(Button)

const ChatInput = ({ onSendMessage, isLoading, hasChatStarted }) => {
  const [message, setMessage] = useState('')
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Box
      position={hasChatStarted ? 'fixed' : 'absolute'}
      bottom={hasChatStarted ? '20px' : '50%'}
      left={0}
      right={0}
      p={4}
      bg={bg}
      zIndex={1000}
      style={{ transition: 'background-color 0.3s ease, bottom 0.3s ease' }}
    >
      <Box maxW="3xl" mx="auto" textAlign="center">
        <HStack spacing={2} justify="center" align="center">
          <Textarea
            aria-label="Query input"
            placeholder="Ask a question about the documents..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            resize="vertical"
            maxH="150px"
            minH="40px"
            size="md"
            focusBorderColor="brand.500"
            flex={1}
            maxW="70%"
            borderRadius="full"
            border="none"
            _focus={{ boxShadow: '0 0 0 2px rgba(66, 153, 225, 0.6)' }}
          />
          <MotionButton
            aria-label="Send button"
            colorScheme="blue"
            size="md"
            onClick={handleSubmit}
            isDisabled={!message.trim() || isLoading}
            minW="40px"
            borderRadius="full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? <Spinner size="sm" /> : <FiArrowRight />}
          </MotionButton>
        </HStack>
      </Box>
    </Box>
  )
}

export default ChatInput
