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
import { Atom } from 'react-loading-indicators'
import Header from '../components/Layout/Header'
import ChatInput from '../components/Chat/ChatInput'
import ResponseCard from '../components/Chat/ResponseCard'
import HistoryDrawer from '../components/Chat/HistoryDrawer'
import SplineAnimation from '../components/SplineAnimation'
import { mockChatHistory } from '../mockdata'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState(mockChatHistory)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const bg = useColorModeValue('gray.50', '#000000')
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

    try {
      // Show loading indicator as a message
      setMessages(prev => [
        ...prev,
        { id: 'loading', response: '', isUser: false, loading: true }
      ])
      // Send to LLM backend
      const res = await fetch('http://localhost:8001/llm/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
      })
      const data = await res.json()
      // Remove loading indicator
      setMessages(prev => prev.filter(m => !m.loading))
      if (res.ok && data.choices && data.choices[0]?.message?.content) {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          query: message,
          response: data.choices[0].message.content,
          sources: data.choices[0].message.sources || [],
          timestamp: new Date().toISOString(),
          isUser: false
        }
        setMessages(prev => [...prev, aiResponse])
        // Optionally update history as before
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
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          response: data.error || 'Failed to get a response from the AI.',
          isUser: false,
          error: true,
          timestamp: new Date().toISOString()
        }])
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => !m.loading))
      setMessages(prev => [...prev, {
        id: (Date.now() + 3).toString(),
        response: 'Network error: Could not reach the AI backend.',
        isUser: false,
        error: true,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
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
    <>
      <SplineAnimation blur={messages.length > 0} />
      <MotionBox
        minH="100vh"
        bg="transparent"
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
        {/* Sidebar can be added here if needed */}
        {messages.length === 0 ? (
          // Centered initial state
          <Flex direction="column" align="center" justify="center" h="100vh" pt="0" pb="0" px={4} ml={{ base: 0, md: '320px' }}>
            <Box mb={4} textAlign="center">
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="bold"
                color="white"
                mb={2}
                letterSpacing="wide"
                textShadow="2px 2px 4px rgba(0,0,0,0.5)"
              >
                What do you want to know?
              </Text>
            </Box>
            <Box w={{ base: '100%', sm: '600px', md: '700px' }}>
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} hasChatStarted={hasChatStarted} isCentered />
            </Box>
          </Flex>
        ) : (
          // Active chat state
          <Flex direction="column" h="100vh" pt="90px" pb="20px" px={4} ml={{ base: 0, md: '320px' }}>
            <Container maxW="full" flex={1} py={4} display="flex" flexDirection="column" overflow="hidden">
              <Box flex={1} overflowY="auto" pr={2}>
                <VStack spacing={4} align="stretch">
                  {messages.map((message) => (
                    <ResponseCard
                      key={message.id}
                      query={message.query}
                      response={message.response}
                      sources={message.sources}
                      timestamp={message.timestamp}
                      isUser={message.isUser}
                      loading={message.loading}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </VStack>
              </Box>
            </Container>
            <Box w="100%" bg="transparent" py={4}>
              <Container maxW="full">
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
    </>
  )
}

export default Chat
