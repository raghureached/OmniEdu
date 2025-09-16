import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, createContent, deleteContent } from '../../../store/slices/contentSlice';
import './LearningPaths.css';

const LearningPaths = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.content);
  
  // State for filters
  const [nameSearch, setNameSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for create path form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPath, setNewPath] = useState({
    title: '',
    classification: 'Role-Specific Training',
    status: 'Draft',
    version: '1.0',
    description: ''
  });
  
  // Dummy data for demonstration
  const dummyPaths = [
    {
      id: 1,
      title: 'Frontend Onboarding',
      classification: 'Role-Specific Training',
      status: 'Published',
      version: '1.0',
      updatedAt: '2025-04-20',
      moduleCount: 5,
      enrolledCount: 24,
      completionRate: '78%'
    },
    {
      id: 2,
      title: 'Backend Fundamentals',
      classification: 'Role-Specific Training',
      status: 'Published',
      version: '1.2',
      updatedAt: '2025-03-15',
      moduleCount: 6,
      enrolledCount: 18,
      completionRate: '65%'
    },
    {
      id: 3,
      title: 'Leadership Development',
      classification: 'Leadership',
      status: 'Draft',
      version: '0.9',
      updatedAt: '2025-05-01',
      moduleCount: 4,
      enrolledCount: 0,
      completionRate: '0%'
    },
    {
      id: 4,
      title: 'Customer Support Training',
      classification: 'Role-Specific Training',
      status: 'Archived',
      version: '2.1',
      updatedAt: '2024-12-10',
      moduleCount: 7,
      enrolledCount: 42,
      completionRate: '92%'
    }
  ];
  
  useEffect(() => {
    dispatch(fetchContent({ type: 'learning_path' }));
  }, [dispatch]);
  
  const handleDeletePath = (pathId) => {
    if (window.confirm('Are you sure you want to delete this learning path?')) {
      dispatch(deleteContent(pathId));
    }
  };
  
  // Handle input change for new path form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPath({
      ...newPath,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleCreatePath = (e) => {
    e.preventDefault();
    dispatch(createContent({
      ...newPath,
      type: 'learning_path',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      moduleCount: 0,
      enrolledCount: 0,
      completionRate: '0%'
    }));
    setShowCreateForm(false);
    setNewPath({
      title: '',
      classification: 'Role-Specific Training',
      status: 'Draft',
      version: '1.0',
      description: ''
    });
  };
  
  // Apply filters to paths
  const filteredPaths = dummyPaths.filter(path => {
    const matchesName = path.title.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesClassification = classificationFilter === 'all' || path.classification === classificationFilter;
    const matchesStatus = statusFilter === 'all' || path.status === statusFilter;
    
    return matchesName && matchesClassification && matchesStatus;
  });
  
  // Handle filter reset
  const handleFilterReset = () => {
    setNameSearch('');
    setClassificationFilter('all');
    setStatusFilter('all');
  };
  
  return (
    <div className="learning-paths-container">
      <div className="learning-page-header">
        <h1> </h1>
        <button 
          className="learning-btn-create" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Learning Path'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="learning-create-form-container">
          <h2>Create New Learning Path</h2>
          <form onSubmit={handleCreatePath} className="learning-path-form">
            <div className="learning-form-row">
              <div className="learning-form-group">
                <label htmlFor="title">Name:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newPath.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="learning-form-group">
                <label htmlFor="classification">Classification:</label>
                <select
                  id="classification"
                  name="classification"
                  value={newPath.classification}
                  onChange={handleInputChange}
                >
                  <option value="Role-Specific Training">Role-Specific Training</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Onboarding">Onboarding</option>
                </select>
              </div>
            </div>
            
            <div className="learning-form-row">
              <div className="learning-form-group">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  name="status"
                  value={newPath.status}
                  onChange={handleInputChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              
              <div className="learning-form-group">
                <label htmlFor="version">Version:</label>
                <input
                  type="text"
                  id="version"
                  name="version"
                  value={newPath.version}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="learning-form-group learning-full-width">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={newPath.description}
                onChange={handleInputChange}
                rows="4"
              ></textarea>
            </div>
            
            <div className="learning-form-actions">
              <button type="submit" className="btn-submit">Save Learning Path</button>
              <button 
                type="button" 
                className="learning-btn-cancel"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {!showCreateForm && (
        <>
          <div className="learning-filter-section">
            <div className="learning-filter-row">
              <div className="learning-filter-group">
                <label>Name:</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                />
              </div>
              
              <div className="learning-filter-group">
                <label>Classification:</label>
                <select
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Role-Specific Training">Role-Specific Training</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Onboarding">Onboarding</option>
                </select>
              </div>
              
              <div className="learning-filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
            
            <div className="learning-filter-actions">
              <button className="learning-btn-filter">Filter</button>
              <button className="learning-btn-reset" onClick={handleFilterReset}>Reset</button>
            </div>
          </div>
          
          {/* Always show dummy data instead of loading/error states */}
          <div className="learning-paths-list">
            {filteredPaths.length === 0 ? (
              <div className="learning-no-data">No learning paths found</div>
            ) : (
              <table className="learning-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Classification</th>
                    <th>Status</th>
                    <th>Version</th>
                    <th>Est. Duration</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaths.map((path) => (
                    <tr key={path.id}>
                      <td>{path.title}</td>
                      <td>{path.classification}</td>
                      <td>
                        <span className={`learning-status-badge ${path.status.toLowerCase()}`}>
                          {path.status}
                        </span>
                      </td>
                      <td>{path.version}</td>
                      <td>(Auto Calc)</td>
                      <td>{new Date(path.updatedAt).toLocaleDateString()}</td>
                      <td className="learning-actions-cell">
                        <button className="learning-btn-preview">Preview</button>
                        <button className="learning-btn-edit">Edit</button>
                        <button 
                          className="learning-btn-delete"
                          onClick={() => handleDeletePath(path.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LearningPaths;