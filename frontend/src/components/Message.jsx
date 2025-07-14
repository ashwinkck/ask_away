import React from 'react';
import './Message.css';

const Message = ({ text, sender }) => {
  const isUser = sender === 'user';
  return (
    <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
      <p>{text}</p>
    </div>
  );
};

export default Message;