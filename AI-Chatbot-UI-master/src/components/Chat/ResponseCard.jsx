import React from 'react'
import {
  Box,
  Text,
  Link,
  VStack,
  HStack,
  Tag,
  useColorModeValue,
  Flex
} from '@chakra-ui/react'
import LoadingThreeDotsJumping from './LoadingThreeDotsJumping'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box) // Updated to motion.create()

const ResponseCard = ({ query, response, sources, timestamp, isUser, loading }) => {
  const bg = useColorModeValue(
    isUser ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
    isUser ? 'rgba(26, 26, 26, 0.3)' : 'rgba(0, 0, 0, 0.3)'
  )
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.2)')
  const textColor = 'white'
  const secondaryTextColor = 'rgba(255, 255, 255, 0.8)'

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <MotionBox
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      mb={4}
      maxW={isUser ? '80%' : '100%'}
      ml={isUser ? 'auto' : 0}
      mr={isUser ? 0 : 'auto'}
      backdropFilter="blur(10px)"
      boxShadow="0 4px 20px rgba(0,0,0,0.1)"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <VStack align="start" spacing={3}>
        {isUser ? (
          <Text fontSize="md" fontWeight="medium" color={textColor}>
            {query}
          </Text>
        ) : (
          <>
            {loading ? (
              <Flex align="center" gap={2} py={2}>
                <Text fontSize="md" color={textColor}>thinking</Text>
                <LoadingThreeDotsJumping />
              </Flex>
            ) : (
              <Text fontSize="md" lineHeight="tall" color={textColor}>
                {response}
              </Text>
            )}
            
            {!loading && sources && sources.length > 0 && (
              <Box>
                <Text fontSize="sm" color={secondaryTextColor} mb={2}>
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
        
        {!loading && (
          <Text fontSize="xs" color={secondaryTextColor} alignSelf="flex-end">
            {formatTime(timestamp)}
          </Text>
        )}
      </VStack>
    </MotionBox>
  )
}

export default ResponseCard
