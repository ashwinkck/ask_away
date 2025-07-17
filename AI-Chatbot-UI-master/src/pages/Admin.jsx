
import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import ResourceTable from '../components/Admin/ResourceTable'
import UploadForm from '../components/Admin/UploadForm'
import { mockResources } from '../mockdata'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const Admin = () => {
  const [resources, setResources] = useState(() => {
    const storedResources = localStorage.getItem('resources')
    return storedResources ? JSON.parse(storedResources) : mockResources
  })
  const [allowedSites, setAllowedSites] = useState([])
  const [newLink, setNewLink] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkError, setLinkError] = useState('')
  const toast = useToast()
  const navigate = useNavigate()
  
  const bg = useColorModeValue('white', '#000000')
  const boxBg = useColorModeValue('gray.50', '#1a1a1a')
  const textColor = useColorModeValue('gray.800', 'white')

  useEffect(() => {
    localStorage.setItem('resources', JSON.stringify(resources))
  }, [resources])

  useEffect(() => {
    fetchAllowedSites()
  }, [])

  const fetchAllowedSites = async () => {
    try {
      const res = await fetch('http://localhost:8001/admin/allowed-sites')
      const data = await res.json()
      setAllowedSites(data.allowed_sites || [])
    } catch (err) {
      setAllowedSites([])
    }
  }

  const handleAddLink = async () => {
    setLinkLoading(true)
    setLinkError('')
    try {
      const res = await fetch('http://localhost:8001/admin/add-allowed-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: newLink })
      })
      const data = await res.json()
      if (res.ok) {
        setAllowedSites(data.allowed_sites)
        setNewLink('')
        toast({ title: 'Link added!', status: 'success', duration: 2000, isClosable: true })
      } else {
        setLinkError(data.error || 'Failed to add link')
      }
    } catch (err) {
      setLinkError('Failed to add link')
    } finally {
      setLinkLoading(false)
    }
  }

  const handleUpload = (resource) => {
    setResources([...resources, resource])
  }

  const handleDeleteResource = (id) => {
    setResources(resources.filter((resource) => resource.id !== id))
  }

  const handleReorderResources = (reorderedResources) => {
    setResources(reorderedResources)
  }

  // Combine PDFs and allowed sites for the resources table
  const combinedResources = [
    ...resources,
    ...allowedSites.map((site, idx) => ({
      id: `allowed-site-${idx}`,
      type: 'url',
      url: site,
      filename: null,
      uploadedBy: 'admin',
      timestamp: null
    }))
  ]

  return (
    <MotionBox
      p={6}
      bg={bg}
      minH="100vh"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading color={textColor}>Admin Dashboard</Heading>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/')}
            color={textColor}
            _hover={{ bg: useColorModeValue('gray.100', '#2a2a2a') }}
          >
            Back to Chat
          </Button>
        </HStack>
        {/* Upload PDF Section */}
        <Box bg={boxBg} borderRadius="lg" p={6} mb={2}>
          <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Upload PDF</Text>
          <UploadForm onUpload={handleUpload} onlyPdf />
        </Box>
        {/* Add Reference Link Section */}
        <Box bg={boxBg} borderRadius="lg" p={6} mb={2}>
          <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Add Reference Link</Text>
          <HStack spacing={3} align="start">
            <Input
              placeholder="Enter a reference link (e.g., https://example.com)"
              value={newLink}
              onChange={e => setNewLink(e.target.value)}
              isDisabled={linkLoading}
              size="md"
              focusBorderColor="brand.500"
            />
            <Button
              colorScheme="blue"
              onClick={handleAddLink}
              isLoading={linkLoading}
              isDisabled={!newLink.trim() || linkLoading}
            >
              Add Link
            </Button>
          </HStack>
          {linkError && <Text color="red.400" mt={2}>{linkError}</Text>}
        </Box>
        {/* Uploaded Resources Table (PDFs + Links) */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Uploaded Resources</Text>
          <ResourceTable
            resources={combinedResources}
            onDeleteResource={handleDeleteResource}
            onReorderResources={handleReorderResources}
          />
        </Box>
      </VStack>
    </MotionBox>
  )
}

export default Admin
