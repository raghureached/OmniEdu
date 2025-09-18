import React, { useEffect, useState } from 'react'
import './UserDashBoardConfig.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizations } from '../../../store/slices/organizationSlice';

const UserDashBoardConfig = () => {
  const [currentOrg, setCurrentOrg] = useState(null)
  const [features, setFeatures] = useState([])
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchOrganizations());
    // fetchPlans();
  }, [dispatch]);
  const { organizations } = useSelector((state) => state.organizations);
  const handleOrgChange = (e) => {
    // console.log(e.target.value)
    setCurrentOrg(organizations.find((org) => org.uuid === e.target.value))
  }
  const handleFeatureChange = (e, featureKey) => {
    // console.log(e.target.checked)
    const feature = featuresData.find((feature) => feature.feature_key === featureKey)
    feature.is_enabled = e.target.checked
    setFeatures((prev) =>{
      prev.map((feature) => {
        if(feature.feature_key === featureKey){
          feature.is_enabled = e.target.checked
        }
        return feature
      })
      return prev
    })
    console.log(features)
  }
  const featuresData = [
    {
      "feature_key": "user_home_section",
      "label": "User Home Section",
    },
    {
      "feature_key": "support_button",
      "label": "Support Button"
    }
  ]
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
          Manage User Dashboard Settings for <span>{currentOrg?.name || "No Org Selected"}</span>
        </h2>

        <p className="user-dash-settings-info">
          These toggles enable or disable features at the <strong>organization level</strong>.
          Users will only see features that are enabled here AND permitted by their assigned Role.
        </p>

        <div className="user-dash-settings-list">
        {featuresData.map((feature) => (
            <div className="user-dash-settings-item" key={feature.feature_key}>
              <span>{feature.label}</span>
              <label className="user-dash-switch">
                <input type="checkbox" defaultChecked  onChange={(e) => handleFeatureChange(e, feature.feature_key)}/>
                <span className="user-dash-slider round"></span>
              </label>
            </div>
          ))}
        </div>

        <button className="user-dash-save-btn">Save User Dashboard Settings</button>
      </div>
    </div>

  )
}
export default UserDashBoardConfig