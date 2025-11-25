import React, { useEffect, useState } from "react";
import "./GlobalMessageBoard.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, deleteMessage, sendMessage } from "../../../store/slices/globalMessageSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomLoader from "../../../components/common/Loading/CustomLoader";
import { useNotification } from "../../../components/common/Notification/NotificationProvider";

const GlobalMessageBoard = () => {
  const [newMessage, setNewMessage] = useState("");
  const [orgId,setOrgId] = useState(null);
  const [sendUsers,setSendUsers] = useState(false);
  const dispatch = useDispatch();
  const {showNotification} = useNotification();

  const { currentMessages, loading,posting, error } = useSelector(
    (state) => state.globalMessage
  );
  const {organizations} = useSelector((state) => state.organizations);

  useEffect(() => {
    if(!orgId){
      
      return;
    }
    dispatch(fetchMessages(orgId));
  }, [dispatch,orgId]);

  const handlePostMessage = async () => {
  if (newMessage.trim() === "" || !orgId || !orgId.trim()) {
    showNotification({
    type: "error",
    title: "Message posting failed!",
    message: "Please select an organization and write a message.",
    duration: 5000,
  });
    return;
  }
  const res = await dispatch(sendMessage({ messageText: newMessage, orgId, sendUsers }));
  if(sendMessage.fulfilled.match(res)){
    showNotification({
    type: "success",
    title: "Message posted!",
    message: "Message posted successfully",
    duration: 5000,
  });
  }
  else{
    showNotification({
    type: "error",
    title: "Message posting failed!",
    message: "Message posting failed",
    duration: 5000,
  });
}}


  const handleDeleteMessage = (id) => {
    // console.log(id)
    dispatch(deleteMessage(id));
    showNotification({
    type: "success",
    title: "Message deleted!",
    message: "Message deleted successfully",
    duration: 5000,
  });
  };

  const handleCopyMessage = (id) => {
    const msg = currentMessages.find((m) => m._id === id);
    if (msg) {
      navigator.clipboard.writeText(msg.message_text);
      showNotification({
      type: "success",
      title: "Message copied!",
      message: "Message copied to clipboard",
      duration: 5000,
    });
    }
  };

  return (
    <div className="message-board">
      <div className="message-board-form" style={{display: "flex", flexDirection: "row", alignItems: "center",justifyContent:"center",gap:"20px"}}>
        <label htmlFor="" className="message-board-label">Manage Messages for an Organization</label>
        <select className="message-board-select" onChange={(e) => setOrgId(e.target.value)} style={{width:"fit-content"}}>
        <option value="">Select an Organization</option>
        {organizations.map((org) => (
          <option key={org._id} value={org._id}>
            {org.name}
          </option>
        ))}
      </select>
      </div>
      
      {/* Input Box */}
      <div className="message-input-box">
        <textarea
          placeholder="Write a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <div style={{display:"flex", flexDirection:"row", alignItems:"center",gap:"10px"}}>
        <input type="checkbox" checked={sendUsers} id="sendUsers" onChange={(e) => setSendUsers(e.target.checked)} />
        <label htmlFor="sendUsers">Send to Users</label>
        </div>
        <button
          className="post-btn"
          onClick={handlePostMessage}
          disabled={posting || loading || orgId === null || newMessage === "" || orgId === ""}
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {/* Messages */}
      {loading ? <CustomLoader text="Loading messages..." /> : <div className="messages-list">
        {currentMessages?.length > 0  && orgId  ? (
          currentMessages.map((msg) => (
            <div key={msg._id} className="message-card">
              {/* <div className="message-user">{msg.user || "You"}</div> */}
              <div className="message-text">{msg.message_text}</div>
              <div className="message-time">
                {msg.send_users ? "Sent to Users and Admin" : "Sent to Admin"}
              </div>
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
