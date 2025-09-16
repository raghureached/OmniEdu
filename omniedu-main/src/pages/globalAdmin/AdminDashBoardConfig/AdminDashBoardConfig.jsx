    import React, { useEffect, useState } from 'react'
    import './AdminDashBoardConfig.css'
    import { useSelector } from 'react-redux'
    import { useDispatch } from 'react-redux'
import { fetchOrganizations } from '../../../store/slices/organizationSlice'

    const AdminDashBoardConfig = () => {
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
        <div className="admin-dash-dashboard-settings-container">
    <div className="admin-dash-settings-header">
        <label htmlFor="org-select">Manage Settings for Organization:</label>
        <select id="org-select" className="admin-dash-org-select" onChange={handleOrgChange}>
        <option value="">-- Select an Organization --</option>
        {organizations.map((org) => (
            <option key={org._id} value={org._id}>
            {org.name}
            </option>
        ))}
        </select>
    </div>

    <div className="admin-dash-settings-card">
        <h2 className="admin-dash-settings-title">
        Manage Admin Dashboard Settings for <span>[No Org Selected]</span>
        </h2>

        <p className="admin-dash-settings-info">
        These toggles enable or disable features at the <strong>organization level</strong>. 
        Administrators will only see features that are enabled here AND permitted by their assigned Role.
        </p>

        <div className="admin-dash-settings-list">
        <div className="admin-dash-settings-item">
            <span>Admin Home Section</span>
            <label className="admin-dash-switch">
            <input type="checkbox" defaultChecked />
            <span className="admin-dash-slider admin-dash-round"></span>
            </label>
        </div>

        <div className="admin-dash-settings-item">
            <span>Support Button</span>
            <label className="admin-dash-switch">
            <input type="checkbox" defaultChecked />
            <span className="admin-dash-slider admin-dash-round"></span>
            </label>
        </div>
        </div>

        <button className="admin-dash-save-btn">Save Admin Dashboard Settings</button>
    </div>
    </div>

    )
    }

    export default AdminDashBoardConfig