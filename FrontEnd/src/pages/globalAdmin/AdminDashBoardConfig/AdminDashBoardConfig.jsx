import React, { useEffect, useState } from 'react'
import './AdminDashBoardConfig.css'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { fetchOrganizations } from '../../../store/slices/organizationSlice'
import { fetchAdminAllowedPermissions, fetchAdminDashboardPermissions } from '../../../store/slices/adminDashboardConfigSlice'
import { updateAdminDashboardConfig } from '../../../store/slices/adminDashboardConfigSlice'
import LoadingScreen from '../../../components/common/Loading/Loading'
const AdminDashBoardConfig = () => {
    const [currentOrg, setCurrentOrg] = useState(null)
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchOrganizations());
        dispatch(fetchAdminDashboardPermissions());
    }, [dispatch]);
    useEffect(()=>{
        dispatch(fetchAdminAllowedPermissions(currentOrg?.uuid))
    },[currentOrg])

    const { organizations } = useSelector((state) => state.organizations);
    const { permissions,loading } = useSelector((state) => state.adminDashboardConfig);
    const {adminAllowedPermissions} = useSelector((state) => state.adminDashboardConfig);
    // console.log(adminAllowedPermissions)
    const handleOrgChange = (e) => {
        setCurrentOrg(organizations.find((org) => org.uuid === e.target.value))
    }
    const handlePermissionChange = (permissionId) => {
        dispatch(updateAdminDashboardConfig({permissionId, orgId:currentOrg?.uuid}))
    }
    if(loading){
        return <LoadingScreen text="Loading..."/>
    }
    return (
        <div className="admin-dash-dashboard-settings-container">
            <div className="admin-dash-settings-header">
                <label htmlFor="org-select">Manage Settings for Organization:</label>
                <select id="org-select" className="admin-dash-org-select" onChange={handleOrgChange} value={currentOrg?.uuid}>
                    <option value="">-- Select an Organization --</option>
                    {organizations.map((org) => (
                        <option key={org._id} value={org.uuid}>
                            {org.name}
                        </option>
                    ))}
                </select>
            </div>

             <div className="admin-dash-settings-card">
                <h2 className="admin-dash-settings-title">
                    Manage Admin Dashboard Settings for <span>{currentOrg?.name || "No Org Selected"}</span>
                </h2>

                <p className="admin-dash-settings-info">
                    These toggles enable or disable features at the <strong>organization level</strong>.
                    Administrators will only see features that are enabled here AND permitted by their assigned Role.
                </p>

                {currentOrg ?<div className="admin-dash-settings-list">
                    {permissions.map((permission) => (
                        <div className="admin-dash-settings-item" key={permission._id}>
                            <span>{permission.name}</span>
                            <label className="admin-dash-switch">
                                <input
                                    type="checkbox"
                                    checked={adminAllowedPermissions.includes(permission._id)}
                                    onChange={()=>handlePermissionChange(permission._id)}
                                />
                                <span className="admin-dash-slider admin-dash-round"></span>
                            </label>
                        </div>
                    ))}
                </div> : <p style={{textAlign:"center",fontSize:"16px",color:"#666",marginTop:"20px"}}>Please select an Organization</p>}

                    {/* <button className="admin-dash-save-btn">Save Admin Dashboard Settings</button> */}
                </div> 
            </div>

            )
    }

            export default AdminDashBoardConfig