import React, { useState } from 'react'
import {
  Box,
  VStack,
  Input,
  Button,
  Alert,
  AlertIcon,
  Progress,
  Text,
  HStack,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const UploadForm = ({ onUpload, onlyPdf }) => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const { user } = useAuth()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setMessage('')
      } else {
        setMessage('Please select a PDF file')
        setMessageType('error')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a PDF file')
      setMessageType('error')
      return
    }
    setIsUploading(true)
    setUploadProgress(0)
    setMessage('')
    try {
      // Upload PDF to backend
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch('http://localhost:8002/ocr/upload', {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        setMessage(uploadData.error || 'Upload failed')
        setMessageType('error')
        setIsUploading(false)
        return
      }
      setUploadProgress(60)
      // Automatically trigger extraction
      const extractRes = await fetch('http://localhost:8002/ocr/extract-from-uploaded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: uploadData.filename })
      })
      const extractData = await extractRes.json()
      if (!extractRes.ok) {
        setMessage(extractData.error || 'Extraction failed')
        setMessageType('error')
        setIsUploading(false)
        return
      }
      setUploadProgress(100)
      setMessage('PDF uploaded and text extracted successfully')
      setMessageType('success')
      // Optionally update resources
      onUpload && onUpload({
        id: Date.now().toString(),
        type: 'pdf',
        filename: uploadData.filename,
        fileUrl: null,
        url: null,
        uploadedBy: user?.email || 'admin@example.com',
        timestamp: new Date().toISOString()
      })
      setFile(null)
      // Reset form
      const fileInput = document.getElementById('file-input')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setMessage('Upload or extraction failed. Please try again.')
      setMessageType('error')
    } finally {
      setIsUploading(false)
      setTimeout(() => {
        setUploadProgress(0)
        setMessage('')
      }, 3000)
    }
  }

  return (
    <MotionBox
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Upload PDF
        </Text>
        {message && (
          <Alert status={messageType} borderRadius="md">
            <AlertIcon />
            {message}
          </Alert>
        )}
        <VStack spacing={3} align="stretch">
          <Box>
            <Text fontSize="sm" mb={2} color="gray.600">
              Upload PDF File
            </Text>
            <Input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              size="md"
              p={1}
              border="2px dashed"
              borderColor={file ? 'green.300' : 'gray.300'}
              _hover={{ borderColor: 'brand.500' }}
              disabled={isUploading}
            />
          </Box>
        </VStack>
        {isUploading && (
          <Box>
            <Progress value={uploadProgress} colorScheme="blue" size="md" />
            <Text fontSize="sm" color="gray.500" mt={1}>
              Uploading... {uploadProgress}%
            </Text>
          </Box>
        )}
        <HStack justify="flex-end">
          <MotionButton
            colorScheme="green"
            size="md"
            onClick={handleUpload}
            isDisabled={!file || isUploading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isUploading ? <Spinner size="sm" /> : 'Upload'}
          </MotionButton>
        </HStack>
      </VStack>
    </MotionBox>
  )
}

export default UploadForm
