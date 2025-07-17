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
  Flex,
  Tooltip
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { mockChatHistory } from '../../mockdata.js'

const MotionBox = motion(Box)
const MotionIconButton = motion(IconButton)

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const sidebarBg = useColorModeValue('#f7fafd', '#000000')
  const chatItemBg = useColorModeValue('#e3e8f0', '#1a1a1a')
  const chatItemHoverBg = useColorModeValue('#d1d5db', '#2a2a2a')
  const chatTextColor = useColorModeValue('gray.800', 'white')
  const searchBg = useColorModeValue('#e3e8f0', '#1a1a1a')
  const searchPlaceholder = useColorModeValue('gray.500', 'gray.400')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

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
      left={0}
      w={{ base: '0', md: isOpen ? '320px' : '60px' }}
      bg={sidebarBg}
      borderRightWidth="1px"
      borderRightColor={borderColor}
      p={2}
      transition="width 0.3s ease, background-color 0.3s ease"
      overflow="hidden"
      zIndex={999}
      borderRadius="0 1.5rem 1.5rem 0"
      boxShadow="md"
      display={{ base: 'none', md: 'block' }}
    >
      <Flex justify="flex-end" mb={2}>
        <MotionIconButton
          aria-label="Toggle sidebar"
          icon={<FiChevronLeft />}
          onClick={toggleSidebar}
          size="sm"
          variant="ghost"
          borderRadius="full"
          whileHover={{ scale: 1.1, backgroundColor: chatItemHoverBg }}
          whileTap={{ scale: 0.9 }}
          transform={isOpen ? 'rotate(0deg)' : 'rotate(180deg)'}
          transition={{ duration: 0.3 }}
        />
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <InputGroup mb={3} borderRadius="full">
          <InputLeftElement pointerEvents="none">
            <FiSearch color={searchPlaceholder} />
          </InputLeftElement>
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="full"
            focusBorderColor="#646cff"
            bg={searchBg}
            color={chatTextColor}
            _placeholder={{ color: searchPlaceholder }}
            fontSize="sm"
            borderWidth="1px"
            borderColor={borderColor}
          />
        </InputGroup>
        <VStack align="stretch" spacing={3} overflowY="auto" maxH="calc(100vh - 160px)">
          {Object.entries(filteredHistory).map(([group, items]) => (
            <Box key={group} mb={2}>
              <Text fontWeight="bold" color={searchPlaceholder} mb={1} fontSize="xs" pl={2}>{group}</Text>
              {items.map((item) => (
                <Tooltip label={item.query} placement="right" hasArrow key={item.id}>
                  <Flex
                    key={item.id}
                    p={2}
                    borderRadius="lg"
                    bg={chatItemBg}
                    _hover={{ bg: chatItemHoverBg }}
                    align="center"
                    cursor="pointer"
                    transition="background 0.2s"
                  >
                    <FiMessageCircle color="#646cff" />
                    <Text ml={2} fontSize="sm" isTruncated maxW="140px" color={chatTextColor}>
                      {item.query}
                    </Text>
                  </Flex>
                </Tooltip>
              ))}
            </Box>
          ))}
        </VStack>
      </Collapse>
    </MotionBox>
  )
}

export default Sidebar
