import { useState, useEffect } from 'react'
import { mockUsers } from '../mockdata'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userSession = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role }
      setUser(userSession)
      localStorage.setItem('user', JSON.stringify(userSession))
      setLoading(false)
      return { success: true }
    }
    
    setLoading(false)
    return { success: false, error: 'Invalid email or password' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return { user, login, logout, loading }
}
