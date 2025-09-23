import React, { useEffect, useState } from 'react'
import './UserDashBoardConfig.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizations } from '../../../store/slices/organizationSlice';
import { fetchUserAllowedPermissions, fetchUserDashboardPermissions, updateUserDashboardConfig } from '../../../store/slices/userDashboardConfigSlice';
import LoadingScreen from '../../../components/common/Loading/Loading';
const UserDashBoardConfig = () => {
  const [currentOrg, setCurrentOrg] = useState(null)
  const [features, setFeatures] = useState([])
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchOrganizations());
    dispatch(fetchUserDashboardPermissions());
  }, [dispatch]);
  useEffect(()=>{
    if(currentOrg){
      dispatch(fetchUserAllowedPermissions(currentOrg.uuid));
    }
  },[currentOrg])
  const { organizations } = useSelector((state) => state.organizations);
  const { permissions, userDashboardAllowedPermissions,loading } = useSelector((state) => state.userDashboardConfig);
  const handleOrgChange = (e) => {
    setCurrentOrg(organizations.find((org) => org.uuid === e.target.value))
  }
  const handlePermissionChange = (e, id) => {
    dispatch(updateUserDashboardConfig({permissionId:id,orgId:currentOrg?.uuid}))
  }
  if(loading){
    return <LoadingScreen text="Loading..."/>
  }
  return (
    <div className="user-dash-dashboard-settings-container">
      <div className="user-dash-settings-header">
        <label htmlFor="org-select">Manage Settings for Organization:</label>
        <select id="org-select" className="user-dash-org-select" onChange={handleOrgChange} value={currentOrg?.uuid}>
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
          Manage User Dashboard Settings for <span>{currentOrg?.name || "No Org Selected"}</span>
        </h2>

        <p className="user-dash-settings-info">
          These toggles enable or disable features at the <strong>organization level</strong>.
          Users will only see features that are enabled here AND permitted by their assigned Role.
        </p>

        {currentOrg ? <div className="user-dash-settings-list">
        {permissions.map((permission) => (
            <div className="user-dash-settings-item" key={permission.feature_key}>
              <span>{permission.name}</span>
              <label className="user-dash-switch">
                <input type="checkbox" checked={userDashboardAllowedPermissions.includes(permission._id)}  onChange={(e) => handlePermissionChange(e, permission._id)}/>
                <span className="user-dash-slider round"></span>
              </label>
            </div>
          ))}
        </div> : <p style={{textAlign:"center",fontSize:"16px",color:"#666",marginTop:"20px"}}>Please select an Organization</p>}

        {/* <button className="user-dash-save-btn">Save User Dashboard Settings</button> */}
      </div>
    </div>

  )
}
export default UserDashBoardConfig