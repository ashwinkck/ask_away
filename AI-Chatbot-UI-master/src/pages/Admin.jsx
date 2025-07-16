
import React, { useState, useEffect } from 'react'
import { Box, Heading, VStack } from '@chakra-ui/react'
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

  useEffect(() => {
    localStorage.setItem('resources', JSON.stringify(resources))
  }, [resources])

  const handleUpload = (resource) => {
    setResources([...resources, resource])
  }

  const handleDeleteResource = (id) => {
    setResources(resources.filter((resource) => resource.id !== id))
  }

  const handleReorderResources = (reorderedResources) => {
    setResources(reorderedResources)
  }

  return (
    <MotionBox
      p={6}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={6} align="stretch">
        <Heading>Admin Dashboard</Heading>
        <UploadForm onUpload={handleUpload} />
        <ResourceTable
          resources={resources}
          onDeleteResource={handleDeleteResource}
          onReorderResources={handleReorderResources}
        />
      </VStack>
    </MotionBox>
  )
}

export default Admin
