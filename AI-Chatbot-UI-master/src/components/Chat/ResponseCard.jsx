import React from 'react'
import {
  Box,
  Text,
  Link,
  VStack,
  HStack,
  Tag,
  useColorModeValue
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box) // Updated to motion.create()

const ResponseCard = ({ query, response, sources, timestamp, isUser }) => {
  const bg = useColorModeValue(
    isUser ? 'blue.50' : 'white',
    isUser ? 'blue.900' : 'gray.800'
  )
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <MotionBox
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      mb={4}
      maxW={isUser ? '80%' : '100%'}
      ml={isUser ? 'auto' : 0}
      mr={isUser ? 0 : 'auto'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <VStack align="start" spacing={3}>
        {isUser ? (
          <Text fontSize="md" fontWeight="medium">
            {query}
          </Text>
        ) : (
          <>
            <Text fontSize="md" lineHeight="tall">
              {response}
            </Text>
            
            {sources && sources.length > 0 && (
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Sources:
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  {sources.map((source, index) => (
                    <Tag key={index} size="sm" variant="subtle" colorScheme="blue">
                      <Link 
                        href={`#${source}`} 
                        color="blue.500"
                        fontSize="xs"
                        onClick={(e) => {
                          e.preventDefault()
                          // Mock source click
                          console.log('Opening source:', source)
                        }}
                      >
                        {source}
                      </Link>
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}
          </>
        )}
        
        <Text fontSize="xs" color="gray.500" alignSelf="flex-end">
          {formatTime(timestamp)}
        </Text>
      </VStack>
    </MotionBox>
  )
}

export default ResponseCard
