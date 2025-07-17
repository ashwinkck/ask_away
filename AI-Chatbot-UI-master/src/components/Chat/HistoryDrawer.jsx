import React from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  VStack,
  Text,
  Button,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  HStack,
  Divider
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const HistoryDrawer = ({ isOpen, onClose, history, onSelectQuery, onClearHistory }) => {
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const cancelRef = React.useRef()
  const bg = useColorModeValue('white', '#000000')
  const hoverBg = useColorModeValue('gray.50', '#1a1a1a')
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400')
  const tertiaryTextColor = useColorModeValue('gray.400', 'gray.500')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleClearHistory = () => {
    onClearHistory()
    onAlertClose()
  }

  return (
    <>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg={bg}>
          <DrawerCloseButton color={textColor} />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack justify="space-between">
              <Text color={textColor}>Chat History</Text>
              <Button
                colorScheme="red"
                size="sm"
                variant="ghost"
                onClick={onAlertOpen}
                isDisabled={history.length === 0}
              >
                Clear
              </Button>
            </HStack>
          </DrawerHeader>
          
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {history.length === 0 ? (
                <Box p={6} textAlign="center">
                  <Text color={secondaryTextColor}>No chat history yet</Text>
                </Box>
              ) : (
                history.map((item, index) => (
                  <MotionBox
                    key={item.id || index}
                    p={4}
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => onSelectQuery(item)}
                    borderBottomWidth="1px"
                    borderColor={borderColor}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        {truncateText(item.query)}
                      </Text>
                      <Text fontSize="xs" color={secondaryTextColor}>
                        {truncateText(item.response)}
                      </Text>
                      <Text fontSize="xs" color={tertiaryTextColor}>
                        {formatTime(item.timestamp)}
                      </Text>
                    </VStack>
                  </MotionBox>
                ))
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={bg}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={textColor}>
              Clear Chat History
            </AlertDialogHeader>

            <AlertDialogBody color={textColor}>
              Are you sure you want to clear all chat history? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleClearHistory} ml={3}>
                Clear
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default HistoryDrawer