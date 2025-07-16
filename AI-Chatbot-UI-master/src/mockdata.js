export const mockUsers = [
  { id: '1', name: 'John Doe', email: 'user@example.com', password: 'password123', role: 'user' },
  { id: '2', name: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', password: 'jane123', role: 'user' }
]

export const mockResources = [
  {
    id: '1',
    type: 'pdf',
    filename: 'doc1.pdf',
    fileUrl: 'https://example.com/doc1.pdf',
    url: null,
    uploadedBy: 'admin@example.com',
    timestamp: '2025-07-15T09:00:00Z'
  },
  {
    id: '2',
    type: 'url',
    filename: null,
    fileUrl: null,
    url: 'https://example.com',
    uploadedBy: 'admin@example.com',
    timestamp: '2025-07-15T09:30:00Z'
  }
]

export const mockChatHistory = [
  {
    id: '1',
    query: 'What is the main topic of document 1?',
    response: 'The main topic of document 1 is artificial intelligence and machine learning applications in healthcare.',
    sources: ['doc1.pdf'],
    timestamp: '2025-07-16T03:42:00Z' // Today at 03:42 AM IST
  },
  {
    id: '2',
    query: 'How does the system work?',
    response: 'The system uses natural language processing to understand queries and retrieves relevant information from uploaded documents.',
    sources: ['system-overview.pdf'],
    timestamp: '2025-07-15T11:15:00Z' // Yesterday
  },
  {
    id: '3',
    query: 'What are the benefits?',
    response: 'Benefits include improved efficiency, accuracy, and scalability in document analysis.',
    sources: ['benefits.pdf'],
    timestamp: '2025-07-14T14:30:00Z' // 14 July 2025
  }
]

export const mockStats = {
  documents: 25,
  queries: 100,
  storage: '500 MB'
}
