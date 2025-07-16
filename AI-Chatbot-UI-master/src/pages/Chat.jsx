import { FiMenu } from 'react-icons/fi'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  VStack,
  IconButton,
  useDisclosure,
  useBreakpointValue,
  useColorModeValue,
  Container,
  Text
} from '@chakra-ui/react'
import Header from '../components/Layout/Header'
import ChatInput from '../components/Chat/ChatInput'
import ResponseCard from '../components/Chat/ResponseCard'
import HistoryDrawer from '../components/Chat/HistoryDrawer'
import { mockChatHistory } from '../mockdata'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState(mockChatHistory)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const bg = useColorModeValue('gray.50', 'gray.900')
  const [hasChatStarted, setHasChatStarted] = useState(false) // New state for chat position

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleSendMessage = async (message) => {
    const userMessage = {
      id: Date.now().toString(),
      query: message,
      timestamp: new Date().toISOString(),
      isUser: true
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    if (!hasChatStarted) {
      setHasChatStarted(true) // Set to true on first message
    }

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        query: message,
        response: `This is a mock response to: "${message}". The AI would analyze the uploaded documents and provide relevant information based on the query.`,
        sources: ['doc1.pdf', 'example.com'],
        timestamp: new Date().toISOString(),
        isUser: false
      }

      setMessages(prev => [...prev, aiResponse])
      
      const newHistoryItem = {
        id: aiResponse.id,
        query: message,
        response: aiResponse.response,
        sources: aiResponse.sources,
        timestamp: aiResponse.timestamp
      }
      
      const updatedHistory = [newHistoryItem, ...history]
      setHistory(updatedHistory)
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory))
      
      setIsLoading(false)
    }, 2000)
  }

  const handleSelectQuery = (historyItem) => {
    const userMessage = {
      id: Date.now().toString(),
      query: historyItem.query,
      timestamp: new Date().toISOString(),
      isUser: true
    }

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      query: historyItem.query,
      response: historyItem.response,
      sources: historyItem.sources,
      timestamp: historyItem.timestamp,
      isUser: false
    }

    setMessages([userMessage, aiMessage])
    setHasChatStarted(true) // Set to true when selecting from history
    onClose()
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('chatHistory')
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
      
      <Flex direction="column" pt="70px" pb="80px" minH="100vh">
        {isMobile && (
          <Box position="fixed" top="70px" left={4} zIndex={100}>
            <IconButton
              aria-label="Open chat history"
              icon={<FiMenu />}
              onClick={onOpen}
              size="md"
              colorScheme="blue"
              variant="ghost"
            />
          </Box>
        )}

        <Container maxW="4xl" flex={1} py={4}>
          <VStack spacing={4} align="stretch" minH="full">
            {messages.length === 0 ? (
              <Box textAlign="center" color="gray.500" mt={20}>
                <Text
                  fontSize="4xl"
                  fontFamily="Staatliches, sans-serif"
                  fontWeight="bold"
                  mb={4}
                >
                  AskAway
                </Text>
              </Box>
            ) : (
              messages.map((message) => (
                <ResponseCard
                  key={message.id}
                  query={message.query}
                  response={message.response}
                  sources={message.sources}
                  timestamp={message.timestamp}
                  isUser={message.isUser}
                />
              ))
            )}
          </VStack>
        </Container>
      </Flex>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} hasChatStarted={hasChatStarted} />
      
      <HistoryDrawer
        isOpen={isOpen}
        onClose={onClose}
        history={history}
        onSelectQuery={handleSelectQuery}
        onClearHistory={handleClearHistory}
      />
    </MotionBox>
  )
}

export default Chat
