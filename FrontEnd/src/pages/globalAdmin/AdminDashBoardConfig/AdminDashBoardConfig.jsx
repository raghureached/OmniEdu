import React, { useEffect, useState } from 'react'
import './AdminDashBoardConfig.css'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { fetchOrganizations } from '../../../store/slices/organizationSlice'
import { fetchAdminAllowedPermissions, fetchAdminDashboardPermissions } from '../../../store/slices/adminDashboardConfigSlice'
import { updateAdminDashboardConfig } from '../../../store/slices/adminDashboardConfigSlice'
import LoadingScreen from '../../../components/common/Loading/Loading'
import CustomSelect from '../../../components/dropdown/DropDown'
const AdminDashBoardConfig = () => {
    const [currentOrg, setCurrentOrg] = useState(null)
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchOrganizations());
        dispatch(fetchAdminDashboardPermissions());
    }, [dispatch]);
    useEffect(() => {
        dispatch(fetchAdminAllowedPermissions(currentOrg?.uuid))
    }, [currentOrg])

    const { organizations } = useSelector((state) => state.organizations);
    const { permissions, loading } = useSelector((state) => state.adminDashboardConfig);
    const { adminAllowedPermissions } = useSelector((state) => state.adminDashboardConfig);
    // console.log(adminAllowedPermissions)
    const handleOrgChange = (value) => {
        setCurrentOrg(organizations.find((org) => org.uuid === value))
    }
    const handlePermissionChange = (permissionId) => {
        dispatch(updateAdminDashboardConfig({ permissionId, orgId: currentOrg?.uuid }))
    }
    if (loading) {
        return <LoadingScreen text="Loading..." />
    }
    return (
        <div className="user-dash-dashboard-settings-container">
            <div className="message-board-form" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                <label htmlFor="" className="message-board-label">Manage Settings for an Organization</label>
                <CustomSelect
                    value={currentOrg?.uuid || ""}
                    options={[
                        { value: "", label: "Select an Organization" },
                        ...(organizations?.map((org) => ({
                            value: org.uuid,
                            label: org.name,
                        })) || [])
                    ]}
                    onChange={(value) => handleOrgChange(value)}
                    placeholder="Select an Organization"
                    style={{ width: "fit-content" }}
                />
            </div>

            {currentOrg ? <div className="user-dash-settings-card">
                <h2 className="user-dash-settings-title">
                    Manage User Dashboard Settings for <span>{currentOrg?.name}</span>
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
                                <input type="checkbox" checked={adminAllowedPermissions.includes(permission._id)} onChange={(e) => handlePermissionChange(permission._id)} />
                                <span className="user-dash-slider round"></span>
                            </label>
                        </div>
                    ))}
                </div> : <p style={{ textAlign: "center", fontSize: "16px", color: "#666", marginTop: "20px" }}>Please select an Organization</p>}

                {/* <button className="user-dash-save-btn">Save User Dashboard Settings</button> */}
            </div>
                :
                <p style={{ textAlign: "center", fontSize: "16px", color: "#666", marginTop: "20px", fontWeight: 600 }}>Please select an Organization</p>
            }
        </div>


    )
}

export default AdminDashBoardConfig