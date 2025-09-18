import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, createContent, deleteContent } from '../../../store/slices/contentSlice';
import './ContentAssessments.css';

const ContentAssessments = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.content);
  
  // State for filters
  const [nameSearch, setNameSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for create assessment form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    classification: 'Initial Training',
    status: 'Draft',
    version: '1.0',
    questionCount: 0,
    description: ''
  });
  
  // Dummy data for demonstration
  const dummyAssessments = [
    {
      id: 1,
      title: 'HTML Basics Quiz',
      classification: 'Initial Training',
      status: 'Published',
      version: '1.1',
      questionCount: 10,
      updatedAt: '2025-04-18'
    },
    {
      id: 2,
      title: 'CSS Advanced Concepts',
      classification: 'Advanced',
      status: 'Draft',
      version: '0.9',
      questionCount: 15,
      updatedAt: '2025-03-12'
    },
    {
      id: 3,
      title: 'JavaScript Fundamentals',
      classification: 'Initial Training',
      status: 'Published',
      version: '2.0',
      questionCount: 20,
      updatedAt: '2025-02-28'
    },
    {
      id: 4,
      title: 'React Component Lifecycle',
      classification: 'Specialized',
      status: 'Archived',
      version: '1.5',
      questionCount: 12,
      updatedAt: '2024-12-10'
    }
  ];
  
  useEffect(() => {
    dispatch(fetchContent({ type: 'assessment' }));
  }, [dispatch]);
  
  const handleDeleteAssessment = (assessmentId) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      dispatch(deleteContent(assessmentId));
    }
  };
  
  // Handle input change for new assessment form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssessment({
      ...newAssessment,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleCreateAssessment = (e) => {
    e.preventDefault();
    dispatch(createContent({
      ...newAssessment,
      type: 'assessment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    setShowCreateForm(false);
    setNewAssessment({
      title: '',
      classification: 'Initial Training',
      status: 'Draft',
      version: '1.0',
      questionCount: 0,
      description: ''
    });
  };
  
  // Apply filters to assessments
  const filteredAssessments = dummyAssessments.filter(assessment => {
    const matchesName = assessment.title.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesClassification = classificationFilter === 'all' || assessment.classification === classificationFilter;
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    
    return matchesName && matchesClassification && matchesStatus;
  });
  
  // Handle filter reset
  const handleFilterReset = () => {
    setNameSearch('');
    setClassificationFilter('all');
    setStatusFilter('all');
  };
  
  return (
    <div className="assessments-container">
      <div className="assessments-page-header">
        <h1> </h1>
        <button 
          className="assessments-btn-create" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Assessment'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="assessments-create-form-container">
          <h2>Create New Assessment</h2>
          <form onSubmit={handleCreateAssessment} className="assessment-form">
            <div className="assessments-form-row">
              <div className="assessments-form-group">
                <label htmlFor="title">Name:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newAssessment.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="assessments-form-group">
                <label htmlFor="classification">Classification:</label>
                <select
                  id="classification"
                  name="classification"
                  value={newAssessment.classification}
                  onChange={handleInputChange}
                >
                  <option value="Initial Training">Initial Training</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Specialized">Specialized</option>
                </select>
              </div>
            </div>
            
            <div className="assessments-form-row">
              <div className="assessments-form-group">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  name="status"
                  value={newAssessment.status}
                  onChange={handleInputChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              
              <div className="assessments-form-group">
                <label htmlFor="version">Version:</label>
                <input
                  type="text"
                  id="version"
                  name="version"
                  value={newAssessment.version}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="assessments-form-row">
              <div className="assessments-form-group">
                <label htmlFor="questionCount">Total Questions:</label>
                <input
                  type="number"
                  id="questionCount"
                  name="questionCount"
                  value={newAssessment.questionCount}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="assessments-form-group full-width">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={newAssessment.description}
                onChange={handleInputChange}
                rows="4"
              ></textarea>
            </div>
            
            <div className="assessments-form-actions">
              <button type="submit" className="assessments-btn-submit">Save Assessment</button>
              <button 
                type="button" 
                className="assessments-btn-cancel"
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
          <div className="assessments-filter-section">
            <div className="assessments-filter-row">
              <div className="assessments-filter-group">
                <label>Name:</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                />
              </div>
              
              <div className="assessments-filter-group">
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
              
              <div className="assessments-filter-group">
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
            
            <div className="assessments-filter-actions">
              <button className="assessments-btn-filter">Filter</button>
              <button className="assessments-btn-reset" onClick={handleFilterReset}>Reset</button>
            </div>
          </div>
          
          {/* Always show dummy data instead of loading/error states */}
          <div className="assessments-list">
            {filteredAssessments.length === 0 ? (
              <div className="no-data">No assessments found</div>
            ) : (
              <table className="assessments-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Classification</th>
                    <th>Status</th>
                    <th>Version</th>
                    <th>Total Questions</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment.id}>
                      <td>{assessment.title}</td>
                      <td>{assessment.classification}</td>
                      <td>
                        <span className={`status-badge ${assessment.status.toLowerCase()}`}>
                          {assessment.status}
                        </span>
                      </td>
                      <td>{assessment.version}</td>
                      <td>{assessment.questionCount}</td>
                      <td>{new Date(assessment.updatedAt).toLocaleDateString()}</td>
                      <td className="assessments-actions-cell">
                        <button className="assessments-btn-preview">Preview</button>
                        <button className="assessments-btn-edit">Edit</button>
                        <button 
                          className="assessments-btn-delete"
                          onClick={() => handleDeleteAssessment(assessment.id)}
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

export default ContentAssessments;