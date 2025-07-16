import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Layout/Header'
import Chat from './pages/Chat'
import Admin from './pages/Admin'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Sidebar from './components/Sidebar/Sidebar'
import Login from './pages/Login'
import { useAuth } from './hooks/useAuth'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const AppContent = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Hide sidebar during loading or on login page
  const showSidebar = user && !loading && location.pathname !== '/login'

  return (
    <>
      <Header />
      <Flex>
        {showSidebar && <Sidebar />} {/* Sidebar only when logged in and not loading */}
        <Box flex={1} pt="70px" pb="80px" ml={showSidebar ? { base: 0, md: '250px' } : 0}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={<Login />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
      </Flex>
    </>
  )
}

const App = () => {
  return (
    <MotionBox
      minH="100vh"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AppContent />
    </MotionBox>
  )
}

export default App
