import React, { useEffect, useState } from 'react'
import './UserDashBoardConfig.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizations } from '../../../store/slices/organizationSlice';

const UserDashBoardConfig = () => {
    const [currentOrg,setCurrentOrg] = useState(null)
            const dispatch = useDispatch();
            useEffect(() => {
                dispatch(fetchOrganizations());
                // fetchPlans();
              }, [dispatch]);
            const {organizations } = useSelector((state) => state.organizations);
            const handleOrgChange = (e) => {
                // console.log(e.target.value)
                setCurrentOrg(organizations.find((org) => org.uuid === e.target.value))
            }
  return (
    <div className="user-dash-dashboard-settings-container">
  <div className="user-dash-settings-header">
    <label htmlFor="org-select">Manage Settings for Organization:</label>
    <select id="org-select" className="user-dash-org-select" onChange={handleOrgChange}>
      <option value="">-- Select an Organization --</option>
      {organizations.map((org) => (
        <option key={org.uuid} value={org.uuid}>
          {org.name}
        </option>
      ))}
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