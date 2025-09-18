import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessage, updateMessage, deleteMessage } from '../../../store/slices/messageSlice';
import './AdminMessageBoard.css';

const AdminMessageBoard = () => {
  const dispatch = useDispatch();
  const { currentMessage, loading, error } = useSelector((state) => state.message);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    dispatch(fetchMessage());
  }, [dispatch]);

  useEffect(() => {
    setMessageText(currentMessage || '');
  }, [currentMessage]);

  const handleSaveMessage = () => {
    if (messageText.trim()) {
      dispatch(updateMessage(messageText));
    }
  };

  const handleDeleteMessage = () => {
    if (window.confirm('Are you sure you want to delete the current message?')) {
      dispatch(deleteMessage());
    }
  };

  return (
    <div className="admin-message-board">
      {/* <h2>Manage User Message Board</h2> */}
      <div className="message-form">
        <div className="form-group">
          <label htmlFor="messageText">Message Text:</label>
          <textarea
            id="messageText"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Enter message to display on user dashboard"
            rows={4}
          />
        </div>
        <div className="message-actions">
          <button 
            className="btn-save" 
            onClick={handleSaveMessage}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Message'}
          </button>
          <button 
            className="btn-delete" 
            onClick={handleDeleteMessage}
            disabled={loading || !currentMessage}
          >
            Delete Current Message
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="message-preview">
        <h3>Current Message Preview:</h3>
        <div className="preview-content">
          {currentMessage || 'No message set'}
        </div>
      </div>
    </div>
  );
};

export default AdminMessageBoard;