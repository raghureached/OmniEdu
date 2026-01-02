import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./GlobalProfile.css";
import PasswordChangeModal from "./PasswordModal";

const GlobalProfile = () => {
  const { user, lastLoginDateTime } = useSelector((state) => state.auth);
  const [showModal,setShowModal] = useState(false);
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "NA";
    const name = user.name;
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const handlePasswordChange = () => {
    setShowModal(true)

  }
  const handleCloseForm = () =>{
    setShowModal(false)
  }
  return (
    <div className="globaladminprofile-container">
      <div className="globaladminprofile-header">
        <div className="globaladminprofile-avatar-header">
          <div className="globaladmin_profile_word">{getUserInitials()}</div>
          <div className="globaladminprofile-header-info">
            <h2>{user?.name}</h2>
            <p className="globaladminprofile-title">
              Global Admin
            </p>
            <p className="globaladminprofile-department">
              {user?.organization}
            </p>
          </div>
        </div>
      </div>

      <div className="globaladminprofile-sections">
        {/* Admin Profile Section */}
        <div className="globaladminprofile-card">
          <h3 className="globaladminprofile-section-title">
            Global-Admin Profile
          </h3>
          <div className="globaladminprofile-info">
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Name</span>
              <span className="globaladminprofile-info-value">
                {user?.name}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Email</span>
              <span className="globaladminprofile-info-value">
                {user?.email}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Last Login</span>
              <span className="globaladminprofile-info-value">
                {formatDate(lastLoginDateTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="globaladminprofile-card password-card">
          <h3 className="globaladminprofile-section-title">Password</h3>
          <div className="globaladminprofile-info password-info">
            <div className="globaladminprofile-info-group password-group">
              <span className="globaladminprofile-info-label">Password</span>
              <span className="globaladminprofile-info-value">••••••••</span>
              <button className="globaladminprofile-change-password-btn" onClick={() => handlePasswordChange()}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && <PasswordChangeModal isOpen={showModal} onClose={handleCloseForm} />}
    </div>

  );
};

export default GlobalProfile;
