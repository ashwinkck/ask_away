import React, { useState } from 'react';
import MessageList from './MessageList';
import InputBar from './InputBar';
import './ChatWindow.css';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);

  const handleSendMessage = (messageText) => {
    const newMessage = { text: messageText, sender: 'user' };
    setMessages([...messages, newMessage]);

    // Here you would add the logic to get a response from a bot
    // For now, we'll just simulate a bot response
    setTimeout(() => {
      const botResponse = { text: 'This is a simulated bot response.', sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };

  return (
    <div className="chat-window">
      <MessageList messages={messages} />
      <InputBar onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;