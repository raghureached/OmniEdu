import React, { useState } from 'react';
import './AdminForm.css';

const AdminForm = ({ title, fields, onSubmit, onCancel, initialValues = {}, isLoading = false }) => {
  const [formData, setFormData] = useState(initialValues);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="admin-form-container">
      <div className="admin-form-header">
        <h3>{title}</h3>
        <button type="button" className="close-btn" onClick={onCancel}>
          &times;
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="admin-form">
        {fields.map((field) => (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name}>{field.label}</label>
            
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                disabled={isLoading}
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder}
                rows={field.rows || 4}
                disabled={isLoading}
              />
            ) : field.type === 'checkbox' ? (
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkbox-label">{field.checkboxLabel}</span>
              </div>
            ) : (
              <input
                type={field.type || 'text'}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder}
                disabled={isLoading}
              />
            )}
            
            {field.helpText && <small className="help-text">{field.helpText}</small>}
          </div>
        ))}
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;