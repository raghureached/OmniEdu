import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "../../../store/slices/organizationSlice";
import api from "../../../services/api";
import "../../../components/layouts/GlobalAdminLayout/GlobalAdminLayout.css";

const OrganizationManagement = () => {
  const dispatch = useDispatch();
  const { organizations, loading, error } = useSelector(
    (state) => state.organizations
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
    logo: null,
    planId: "",
    start_date: "",
    end_date: "",
  });

  const [planOptions, setPlanOptions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch organizations
  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  // Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("/api/globalAdmin/plans");
        if (res.data?.success) {
          setPlanOptions(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    };
    fetchPlans();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Build FormData for backend
  const buildFormData = (data) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("email", data.email);
    fd.append("status", data.status);
    fd.append("planId", data.planId);
    fd.append("start_date", data.start_date);
    fd.append("end_date", data.end_date);
    if (data.logo) {
      fd.append("logo", data.logo);
    }
    return fd;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = buildFormData(formData);

    if (editingId) {
      await dispatch(updateOrganization({ id: editingId, data: fd }));
      setEditingId(null);
    } else {
      await dispatch(createOrganization(fd));
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      status: "Active",
      logo: null,
      planId: "",
      start_date: "",
      end_date: "",
    });
  };

  // Handle edit
  const handleEdit = (org) => {
    setEditingId(org._id);
    setFormData({
      name: org.name || "",
      email: org.email || "",
      status: org.status || "Active",
      logo: null,
      planId: org.plan?._id || "",
      start_date: org.start_date
        ? new Date(org.start_date).toISOString().split("T")[0]
        : "",
      end_date: org.end_date
        ? new Date(org.end_date).toISOString().split("T")[0]
        : "",
    });
  };

  // Handle delete
  const handleDelete = (id) => {
    dispatch(deleteOrganization(id));
  };

  return (
    <div className="container">
      <h2>Organization Management</h2>

      <form onSubmit={handleSubmit} className="org-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Organization Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Organization Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="logo">Logo</label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="planId">Plan *</label>
            <select
              id="planId"
              name="planId"
              value={formData.planId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a Plan</option>
              {planOptions.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_date">Start Date *</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date *</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn">
          {editingId ? "Update Organization" : "Add Organization"}
        </button>
      </form>

      <h3>Organizations List</h3>
      {loading ? (
        <p>Loading organizations...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="org-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org._id}>
                <td>{org.name}</td>
                <td>{org.email}</td>
                <td>{org.status}</td>
                <td>{org.planName || org.plan?.name}</td>
                <td>
                  {org.start_date
                    ? new Date(org.start_date).toLocaleDateString()
                    : ""}
                </td>
                <td>
                  {org.end_date
                    ? new Date(org.end_date).toLocaleDateString()
                    : ""}
                </td>
                <td>
                  <button onClick={() => handleEdit(org)}>Edit</button>
                  <button onClick={() => handleDelete(org._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrganizationManagement;
