import React, { useState } from "react";
import "./GlobalMessageBoard.css";

const GlobalMessageBoard = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: "Alice", text: "Welcome to the new platform!", time: "10:15 AM" },
    { id: 2, user: "Bob", text: "Don’t forget the training tomorrow 🚀", time: "11:05 AM" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handlePostMessage = () => {
    if (newMessage.trim() === "") return;
    const message = {
      id: Date.now(),
      user: "You",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([message, ...messages]);
    setNewMessage("");
  };

  return (
    <div className="message-board">
      <div className="message-board-header">
        <h2>Message Board</h2>
      </div>

      {/* Input Box */}
      <div className="message-input-box">
        <textarea
          placeholder="Write a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="post-btn" onClick={handlePostMessage}>
          Post
        </button>
      </div>

      {/* Messages */}
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className="message-card">
            <div className="message-user">{msg.user}</div>
            <div className="message-text">{msg.text}</div>
            <div className="message-time">{msg.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalMessageBoard;
