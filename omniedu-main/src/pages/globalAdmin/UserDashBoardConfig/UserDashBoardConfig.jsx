import React from 'react'
import './UserDashBoardConfig.css'

const UserDashBoardConfig = () => {
  return (
    <div className="user-dash-dashboard-settings-container">
  <div className="user-dash-settings-header">
    <label htmlFor="org-select">Manage Settings for Organization:</label>
    <select id="org-select" className="user-dash-org-select">
      <option value="">-- Select an Organization --</option>
    </select>
  </div>

  <div className="user-dash-settings-card">
    <h2 className="user-dash-settings-title">
      Manage User Dashboard Settings for <span>[No Org Selected]</span>
    </h2>

    <p className="user-dash-settings-info">
      These toggles enable or disable features at the <strong>organization level</strong>. 
      Users will only see features that are enabled here AND permitted by their assigned Role.
    </p>

    <div className="user-dash-settings-list">
      <div className="user-dash-settings-item">
        <span>User Home Section</span>
        <label className="user-dash-switch">
          <input type="checkbox" defaultChecked />
          <span className="user-dash-slider round"></span>
        </label>
      </div>

      <div className="user-dash-settings-item">
        <span>Support Button</span>
        <label className="user-dash-switch">
          <input type="checkbox" defaultChecked />
          <span className="user-dash-slider round"></span>
        </label>
      </div>
    </div>

    <button className="user-dash-save-btn">Save User Dashboard Settings</button>
  </div>
</div>

  )
}

export default UserDashBoardConfig