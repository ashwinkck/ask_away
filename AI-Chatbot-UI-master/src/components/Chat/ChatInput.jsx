import React, { useState, useEffect } from 'react'
import {
  Textarea,
  Button,
  HStack,
  useColorModeValue,
  Spinner,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'
import { motion } from 'framer-motion'

const MotionButton = motion.create(Button)

const ChatInput = ({ onSendMessage, isLoading, hasChatStarted, isCentered }) => {
  const [message, setMessage] = useState('')
  const bg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.2)')
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)')
  const buttonBg = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.2)')
  const buttonHoverBg = useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)')
  const buttonIconColor = useColorModeValue('white', 'white')
  const textColor = 'white'
  const placeholderColor = 'rgba(255, 255, 255, 0.7)'

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

  if (isCentered) {
    // Centered, Grok-style input (larger height, default font size)
    return (
      <form onSubmit={handleSubmit}>
        <InputGroup size="lg">
          <Input
            aria-label="Query input"
            placeholder="What do you want to know?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            borderRadius="2xl"
            bg={bg}
            borderColor={borderColor}
            borderWidth="2px"
            pr="4.5rem"
            fontSize="lg"
            height="72px"
            boxShadow="0 4px 20px rgba(0,0,0,0.1)"
            backdropFilter="blur(10px)"
            color={textColor}
            _placeholder={{ color: placeholderColor }}
            _focus={{ boxShadow: '0 0 0 2px #646cff', borderColor: 'blue.400' }}
            autoFocus
          />
          <InputRightElement width="4.5rem" height="100%" display="flex" alignItems="center">
            <MotionButton
              aria-label="Send button"
              size="lg"
              type="submit"
              isDisabled={!message.trim() || isLoading}
              borderRadius="2xl"
              bg={buttonBg}
              color={buttonIconColor}
              _hover={{ bg: buttonHoverBg }}
              _active={{ bg: buttonHoverBg }}
              _focus={{ boxShadow: '0 0 0 2px #646cff' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              px={0}
              minW="3rem"
              borderWidth="2px"
              borderColor={borderColor}
              boxShadow="0 2px 10px rgba(0,0,0,0.1)"
              height="56px"
            >
              {isLoading ? <Spinner size="sm" /> : <FiArrowRight />}
            </MotionButton>
          </InputRightElement>
        </InputGroup>
      </form>
    )
  }

  // Classic chat input at the bottom
  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <InputGroup size="lg">
        <Input
          aria-label="Query input"
          placeholder="Ask a question about the documents..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          borderRadius="2xl"
          bg={bg}
          borderColor={borderColor}
          borderWidth="2px"
          pr="4.5rem"
          fontSize="lg"
          height="64px"
          boxShadow="0 4px 20px rgba(0,0,0,0.1)"
          backdropFilter="blur(10px)"
          color={textColor}
          _placeholder={{ color: placeholderColor }}
          _focus={{ boxShadow: '0 0 0 2px #646cff', borderColor: 'blue.400' }}
        />
        <InputRightElement width="4.5rem">
          <MotionButton
            aria-label="Send button"
            size="lg"
            type="submit"
            isDisabled={!message.trim() || isLoading}
            borderRadius="2xl"
            bg={buttonBg}
            color={buttonIconColor}
            _hover={{ bg: buttonHoverBg }}
            _active={{ bg: buttonHoverBg }}
            _focus={{ boxShadow: '0 0 0 2px #646cff' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            px={0}
            minW="3rem"
            borderWidth="2px"
            borderColor={borderColor}
            boxShadow="0 2px 10px rgba(0,0,0,0.1)"
            height="48px"
          >
            {isLoading ? <Spinner size="sm" /> : <FiArrowRight />}
          </MotionButton>
        </InputRightElement>
      </InputGroup>
    </form>
  )
}

export default ChatInput
