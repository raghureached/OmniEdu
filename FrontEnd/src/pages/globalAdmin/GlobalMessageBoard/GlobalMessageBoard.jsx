import React, { useEffect, useState } from "react";
import "./GlobalMessageBoard.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, deleteMessage, sendMessage } from "../../../store/slices/globalMessageSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomLoader from "../../../components/common/Loading/CustomLoader";

const GlobalMessageBoard = () => {
  const [newMessage, setNewMessage] = useState("");
  const [orgId,setOrgId] = useState(null)
  const dispatch = useDispatch();

  const { currentMessages, loading, error } = useSelector(
    (state) => state.globalMessage
  );
  const {organizations} = useSelector((state) => state.organizations);

  useEffect(() => {
    dispatch(fetchMessages(orgId));
  }, [dispatch,orgId]);

  const handlePostMessage = () => {
  if (newMessage.trim() === "" || !orgId) {
    toast.error("Please select an organization and write a message.");
    return;
  }
  dispatch(sendMessage({ messageText: newMessage, orgId }));
  setNewMessage("");
  toast.success("Message posted!");
};


  const handleDeleteMessage = (id) => {
    // console.log(id)
    dispatch(deleteMessage(id));
    toast.info("Message deleted");
  };

  const handleCopyMessage = (id) => {
    const msg = currentMessages.find((m) => m._id === id);
    if (msg) {
      navigator.clipboard.writeText(msg.message_text);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="message-board">
      <div className="message-board-header">
        {/* <h2>Message Board</h2> */}
      </div>
      <div className="message-board-form">
        <label htmlFor="" className="message-board-label">Organization</label>
        <select className="message-board-select" onChange={(e) => setOrgId(e.target.value)}>
        <option value="">Select Organization</option>
        {organizations.map((org) => (
          <option key={org._id} value={org.uuid}>
            {org.name}
          </option>
        ))}
      </select>
      </div>
      
      {/* Input Box */}
      <div className="message-input-box">
        <textarea
          placeholder="Write a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="post-btn"
          onClick={handlePostMessage}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Loading & Error States */}

      {/* {loading && <div className="loading">Loading messages...</div>} */}

      {error && <div className="error">Error: {error}</div>}

      {/* Messages */}
      {loading ? <CustomLoader text="Loading messages..." /> : <div className="messages-list">
        {currentMessages?.length > 0 ? (
          currentMessages.map((msg) => (
            <div key={msg._id} className="message-card">
              <div className="message-user">{msg.user || "You"}</div>
              <div className="message-text">{msg.message_text}</div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleDateString()}
              </div>
              <div className="message-actions">
                <button
                  className="message-copy-btn"
                  onClick={() => handleCopyMessage(msg._id)}
                >
                  Copy
                </button>
                <button
                  className="message-delete-btn"
                  onClick={() => handleDeleteMessage(msg.uuid)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">{orgId && currentMessages.length === 0 ? "No messages yet" : "Select an organization to see messages"}</div>
        )}
      </div>}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default GlobalMessageBoard;
