import React, { useEffect, useState } from "react";
import "./AdminMessageBoard.css";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomLoader from "../../../components/common/Loading/CustomLoader";
import { deleteAdminMessage, fetchAdminMessage, updateAdminMessage } from "../../../store/slices/adminMessageSlice";

const AdminMessageBoard = () => {
  const [newMessage, setNewMessage] = useState("");
  const dispatch = useDispatch();

  const { currentMessages, loading,posting, error } = useSelector(
    (state) => state.adminMessages
  );

  useEffect(() => {
    dispatch(fetchAdminMessage());
  }, [dispatch]);

  const handlePostMessage = () => {
  if (newMessage.trim() === "") {
    toast.error("Please select an organization and write a message.");
    return;
  }
  dispatch(updateAdminMessage(newMessage));
  setNewMessage("");
  toast.success("Message posted!");
};


  const handleDeleteMessage = (id) => {
    // console.log(id)
    dispatch(deleteAdminMessage(id));
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
      {/* Input Box */}
      <div className="message-input-box">
        <textarea
          placeholder="Write a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="post-btn"
          onClick={handlePostMessage}
          disabled={posting || loading  || newMessage === ""}
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>


      {/* Messages */}
      {loading ? <CustomLoader text="Loading messages..." /> : <div className="messages-list">
        {currentMessages?.length > 0 ? (
          currentMessages.map((msg) => (
            <div key={msg._id} className="message-card">
              {/* <div className="message-user">{msg.user || "You"}</div> */}
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
          <div className="no-messages">No messages yet</div>
        )}
      </div>}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default AdminMessageBoard;
