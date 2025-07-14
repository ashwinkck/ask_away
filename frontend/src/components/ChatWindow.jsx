import React, { useState } from 'react';
import MessageList from './MessageList';
import InputBar from './InputBar';
import './ChatWindow.css';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);

  const handleSendMessage = async (messageText) => {
    const newMessage = { text: messageText, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);

    // Show loading message
    setMessages((prev) => [...prev, { text: '...', sender: 'bot', loading: true }]);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove loading
        { text: data.reply, sender: 'bot' }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { text: 'Sorry, there was an error connecting to the server.', sender: 'bot' }
      ]);
    }
  };

  return (
    <div className="chat-window">
      <MessageList messages={messages} />
      <InputBar onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;