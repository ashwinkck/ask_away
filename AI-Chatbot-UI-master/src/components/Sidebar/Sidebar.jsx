import { FiMessageCircle, FiSearch, FiChevronLeft } from 'react-icons/fi'
import React, { useState } from 'react'
import {
  Box,
  VStack,
  InputGroup,
  Input,
  InputLeftElement,
  IconButton,
  Text,
  useColorModeValue,
  Collapse,
  Flex
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { mockChatHistory } from '../../mockdata.js'

const MotionBox = motion(Box)
const MotionIconButton = motion(IconButton)

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const lightBg = useColorModeValue('white', 'gray.800') // Match header
  const bg = isOpen ? lightBg : lightBg // Same color when collapsed
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const toggleSidebar = () => setIsOpen(!isOpen)

  const getTimestampGroup = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
  }

  const groupedHistory = mockChatHistory.reduce((acc, item) => {
    const group = getTimestampGroup(item.timestamp)
    acc[group] = acc[group] || []
    acc[group].push(item)
    return acc
  }, {})

  const filteredHistory = Object.entries(groupedHistory).reduce((acc, [group, items]) => {
    const filteredItems = items.filter(item =>
      item.query.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filteredItems.length > 0) acc[group] = filteredItems
    return acc
  }, {})

  return (
    <MotionBox
      as="aside"
      position="fixed"
      top="70px"
      bottom={0}
      w={{ base: '0', md: isOpen ? '250px' : '60px' }}
      bg={bg}
      borderRightWidth="1px"
      borderRightColor={borderColor}
      p={4}
      transition="width 0.3s ease, background-color 0.3s ease"
      overflow="hidden"
      zIndex={999}
    >
      <Flex justify="flex-end" mb={4}>
        <MotionIconButton
          aria-label="Toggle sidebar"
          icon={<FiChevronLeft />}
          onClick={toggleSidebar}
          size="sm"
          variant="ghost"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transform={isOpen ? 'rotate(0deg)' : 'rotate(180deg)'}
          transition={{ duration: 0.3 }}
        />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <InputGroup mb={4} borderRadius="full">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="full"
            focusBorderColor="brand.500"
          />
        </InputGroup>

        <VStack align="stretch" spacing={4} overflowY="auto" maxH="calc(100vh - 180px)">
          {Object.entries(filteredHistory).map(([group, items]) => (
            <Box key={group}>
              <Text fontWeight="bold" color="gray.500" mb={2}>{group}</Text>
              {items.map((item) => (
                <Flex
                  key={item.id}
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                  align="center"
                  cursor="pointer"
                >
                  <FiMessageCircle color={useColorModeValue('gray.600', 'gray.400')} />
                  <Text ml={2} fontSize="sm">{item.query}</Text>
                </Flex>
              ))}
            </Box>
          ))}
        </VStack>
      </Collapse>
    </MotionBox>
  )
}

export default Sidebar
