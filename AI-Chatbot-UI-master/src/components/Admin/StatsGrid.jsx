import React from 'react'
import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  useColorModeValue,
  Icon
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MotionBox = motion(Box)

const StatsGrid = ({ stats }) => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Mock chart data
  const chartData = [
    { name: 'Mon', queries: 12 },
    { name: 'Tue', queries: 19 },
    { name: 'Wed', queries: 15 },
    { name: 'Thu', queries: 25 },
    { name: 'Fri', queries: 22 },
    { name: 'Sat', queries: 18 },
    { name: 'Sun', queries: 16 }
  ]

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
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
          <Stat>
            <StatLabel>Total Documents</StatLabel>
            <StatNumber color="brand.500">{stats.documents}</StatNumber>
            <StatHelpText>Currently uploaded</StatHelpText>
          </Stat>
        </MotionBox>

        <MotionBox
          bg={bg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Stat>
            <StatLabel>Total Queries</StatLabel>
            <StatNumber color="green.500">{stats.queries}</StatNumber>
            <StatHelpText>Questions processed</StatHelpText>
          </Stat>
        </MotionBox>

        <MotionBox
          bg={bg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Stat>
            <StatLabel>Storage Used</StatLabel>
            <StatNumber color="orange.500">{stats.storage}</StatNumber>
            <StatHelpText>Document storage</StatHelpText>
          </Stat>
        </MotionBox>
      </SimpleGrid>

      <MotionBox
        bg={bg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Box mb={4}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Query Trends (Last 7 Days)</h3>
        </Box>
        <Box height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="queries" stroke="#3182CE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </MotionBox>
    </Box>
  )
}

export default StatsGrid