import { FiMenu } from 'react-icons/fi'
import React, { useState, useEffect, useRef } from 'react'
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
  const [hasChatStarted, setHasChatStarted] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

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
      setHasChatStarted(true)
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
    setHasChatStarted(true)
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
      {/* Sidebar can be added here if needed */}
      {messages.length === 0 ? (
        // Centered initial state
        <Flex direction="column" align="center" justify="center" minH="100vh" pt="0" pb="0">
          <Box mb={8} textAlign="center">
            <Text
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="bold"
              color="gray.100"
              mb={2}
              letterSpacing="wide"
              style={{ fontFamily: 'Staatliches, sans-serif' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}><circle cx="24" cy="24" r="24" fill="#23272F"/><path d="M24 12L28.3923 21.1764L38 22.3923L30.8 29.6077L32.7846 39L24 34.1764L15.2154 39L17.2 29.6077L10 22.3923L19.6077 21.1764L24 12Z" fill="#646cff"/></svg>
                AskAway
              </span>
            </Text>
            <Text color="gray.400" fontSize="lg">What do you want to know?</Text>
          </Box>
          <Box w={{ base: '90%', sm: '400px' }}>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} hasChatStarted={hasChatStarted} isCentered />
          </Box>
        </Flex>
      ) : (
        // Active chat state
        <Flex direction="column" pt="70px" minH="100vh" justify="flex-end">
          <Container maxW="4xl" flex={1} py={4} display="flex" flexDirection="column" justifyContent="flex-end">
            <VStack spacing={4} align="stretch" flex={1}>
              {messages.map((message) => (
                <ResponseCard
                  key={message.id}
                  query={message.query}
                  response={message.response}
                  sources={message.sources}
                  timestamp={message.timestamp}
                  isUser={message.isUser}
                />
              ))}
              <div ref={messagesEndRef} />
            </VStack>
          </Container>
          <Box w="100%" position="sticky" bottom={0} bg={bg} px={{ base: 2, md: 0 }} py={4} boxShadow="0 -2px 16px 0 rgba(0,0,0,0.12)">
            <Container maxW="4xl">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} hasChatStarted={hasChatStarted} />
            </Container>
          </Box>
        </Flex>
      )}
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
