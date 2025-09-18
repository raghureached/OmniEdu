import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, createContent, deleteContent } from '../../../store/slices/contentSlice';
import './ContentModules.css';

const ContentModules = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.content);
  
  // State for filters
  const [nameSearch, setNameSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for create module form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    classification: 'Initial Training',
    team: 'Tech',
    status: 'Draft',
    version: '1.0',
    description: ''
  });
  
  // Dummy data for demonstration
  const dummyModules = [
    {
      id: 1,
      title: 'Introduction to HTML',
      classification: 'Initial Training',
      team: 'Tech',
      status: 'Published',
      version: '1.0',
      updatedAt: '2025-04-15'
    },
    {
      id: 2,
      title: 'Advanced CSS Techniques',
      classification: 'Advanced',
      team: 'Tech',
      status: 'Draft',
      version: '0.8',
      updatedAt: '2025-03-22'
    },
    {
      id: 3,
      title: 'Sales Fundamentals',
      classification: 'Initial Training',
      team: 'Sales',
      status: 'Published',
      version: '2.1',
      updatedAt: '2025-02-10'
    },
    {
      id: 4,
      title: 'HR Compliance Training',
      classification: 'Specialized',
      team: 'HR',
      status: 'Archived',
      version: '1.5',
      updatedAt: '2024-11-05'
    }
  ];
  
  useEffect(() => {
    dispatch(fetchContent({ type: 'module' }));
  }, [dispatch]);
  
  const handleDeleteModule = (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      dispatch(deleteContent(moduleId));
    }
  };
  
  // Handle input change for new module form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModule({
      ...newModule,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleCreateModule = (e) => {
    e.preventDefault();
    dispatch(createContent({
      ...newModule,
      type: 'module',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    setShowCreateForm(false);
    setNewModule({
      title: '',
      classification: 'Initial Training',
      team: 'Tech',
      status: 'Draft',
      version: '1.0',
      description: ''
    });
  };
  
  // Apply filters to modules
  const filteredModules = dummyModules.filter(module => {
    const matchesName = module.title.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesClassification = classificationFilter === 'all' || module.classification === classificationFilter;
    const matchesTeam = teamFilter === 'all' || module.team === teamFilter;
    const matchesStatus = statusFilter === 'all' || module.status === statusFilter;
    
    return matchesName && matchesClassification && matchesTeam && matchesStatus;
  });
  
  // Handle filter reset
  const handleFilterReset = () => {
    setNameSearch('');
    setClassificationFilter('all');
    setTeamFilter('all');
    setStatusFilter('all');
  };
  
  return (
    <div className="modules-container">
      <div className="modules-page-header">
        <h1> </h1>
        <button 
          className="modules-btn-create" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Module'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="modules-create-form-container">
          <h2>Create New Module</h2>
          <form onSubmit={handleCreateModule} className="modules-module-form">
            <div className="modules-form-row">
              <div className="modules-form-group">
                <label htmlFor="title">Name:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newModule.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="modules-form-group">
                <label htmlFor="classification">Classification:</label>
                <select
                  id="classification"
                  name="classification"
                  value={newModule.classification}
                  onChange={handleInputChange}
                >
                  <option value="Initial Training">Initial Training</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Specialized">Specialized</option>
                </select>
              </div>
            </div>
            
            <div className="modules-form-row">
              <div className="modules-form-group">
                <label htmlFor="team">Team:</label>
                <select
                  id="team"
                  name="team"
                  value={newModule.team}
                  onChange={handleInputChange}
                >
                  <option value="Tech">Tech</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              
              <div className="modules-form-group">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  name="status"
                  value={newModule.status}
                  onChange={handleInputChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
            
            <div className="modules-form-row">
              <div className="modules-form-group">
                <label htmlFor="version">Version:</label>
                <input
                  type="text"
                  id="version"
                  name="version"
                  value={newModule.version}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="modules-form-group modules-full-width">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={newModule.description}
                onChange={handleInputChange}
                rows="4"
              ></textarea>
            </div>
            
            <div className="modules-form-actions">
              <button type="submit" className="modules-btn-submit">Save Module</button>
              <button 
                type="button" 
                className="modules-btn-cancel"
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
          <div className="modules-filter-section">
            <div className="modules-filter-row">
              <div className="modules-filter-group">
                <label>Name:</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                />
              </div>
              
              <div className="modules-filter-group">
                <label>Classification:</label>
                <select
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Initial Training">Initial Training</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Specialized">Specialized</option>
                </select>
              </div>
              
              <div className="modules-filter-group">
                <label>Team:</label>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Tech">Tech</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              
              <div className="modules-filter-group">
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
            
            <div className="modules-filter-actions">
              <button className="modules-btn-filter">Filter</button>
              <button className="modules-btn-reset" onClick={handleFilterReset}>Reset</button>
            </div>
          </div>
          
          {/* Always show dummy data instead of loading/error states */}
          <div className="modules-list">
            {filteredModules.length === 0 ? (
              <div className="modules-no-data">No modules found</div>
            ) : (
              <table className="modules-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Classification</th>
                    <th>Team</th>
                    <th>Status</th>
                    <th>Version</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.map((module) => (
                    <tr key={module.id}>
                      <td>{module.title}</td>
                      <td>{module.classification}</td>
                      <td>{module.team}</td>
                      <td>
                        <span className={`modules-status-badge ${module.status.toLowerCase()}`}>
                          {module.status}
                        </span>
                      </td>
                      <td>{module.version}</td>
                      <td>{new Date(module.updatedAt).toLocaleDateString()}</td>
                      <td className="modules-actions-cell">
                        <button className="modules-btn-preview">Preview</button>
                        <button className="modules-btn-edit">Edit</button>
                        <button 
                          className="modules-btn-delete"
                          onClick={() => handleDeleteModule(module.id)}
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

export default ContentModules;