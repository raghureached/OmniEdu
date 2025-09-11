import React from "react";
import { useSelector } from "react-redux";
import "./GlobalProfile.css";

const GlobalProfile = () => {
  const { user, lastLoginDateTime } = useSelector((state) => state.auth);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Admin data from user input
  const GlobaladminData = {
    personal: {
      name: "GlobalAdmin User",
      email: "globaladmin@example.com",
      designation: "System Administrator",
      organization: "Acme Corp",
      team: "Administration",
      subTeam: "IT",
      role: "GlobalAdmin",
      lastLogin: "26/05/25, 10:46 am",
    },
    organization: {
      name: "Acme Corporation Ltd.",
      logo: "logo.png",
      email: "contact@acmecorp.com",
      status: "Active",
      planId: "ACME-PRO-2025",
      planName: "Professional Tier",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    },
  };

  const getUserInitials = () => {
    const name = GlobaladminData.personal.name;
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="globaladminprofile-container">
      <div className="globaladminprofile-header">
        <div className="globaladminprofile-avatar-header">
          <div className="globaladmin_profile_word">{getUserInitials()}</div>
          <div className="globaladminprofile-header-info">
            <h2>{GlobaladminData.personal.name}</h2>
            <p className="globaladminprofile-title">
              {GlobaladminData.personal.designation}
            </p>
            <p className="globaladminprofile-department">
              {GlobaladminData.personal.organization}
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
                {GlobaladminData.personal.name}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Email</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.personal.email}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Designation</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.personal.designation}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">
                Organization
              </span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.personal.organization}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Team</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.personal.team}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Sub Team</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.personal.subTeam}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Role</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.personal.role}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Last Login</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.personal.lastLogin}
              </span>
            </div>
          </div>
        </div>

        {/* Organization Profile Section */}
        <div className="globaladminprofile-card">
          <h3 className="globaladminprofile-section-title">
            Organization Profile
          </h3>
          <div className="globaladminprofile-info">
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Name</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.organization.name}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Logo</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.organization.logo}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Email</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.organization.email}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Status</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.organization.status}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Plan ID</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.organization.planId}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Plan Name</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.organization.planName}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">Start Date</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.organization.startDate}
              </span>
            </div>
            <div className="globaladminprofile-info-group">
              <span className="globaladminprofile-info-label">End Date</span>
              <span className="globaladminprofile-info-value">
                {GlobaladminData.organization.endDate}
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
              <button className="globaladminprofile-change-password-btn">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalProfile;
