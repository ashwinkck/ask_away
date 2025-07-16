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
  const bg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

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
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack justify="space-between">
              <Text>Chat History</Text>
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
                  <Text color="gray.500">No chat history yet</Text>
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
                    borderColor="gray.200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        {truncateText(item.query)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {truncateText(item.response)}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
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
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear Chat History
            </AlertDialogHeader>

            <AlertDialogBody>
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