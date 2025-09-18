import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, createContent, deleteContent } from '../../../store/slices/contentSlice';
import './Surveys.css';

const Surveys = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.content);
  
  // State for filters
  const [nameSearch, setNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // State for create survey form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    type: 'Employee Feedback',
    status: 'Draft',
    description: '',
    questionCount: 0
  });
  
  // Dummy data for demonstration
  const dummySurveys = [
    {
      id: 1,
      title: 'Employee Engagement Q2 2025',
      type: 'Employee Feedback',
      status: 'Active',
      questionCount: 15,
      responseCount: 84,
      createdAt: '2025-04-15'
    },
    {
      id: 2,
      title: 'Training Effectiveness Survey',
      type: 'Training Evaluation',
      status: 'Closed',
      questionCount: 10,
      responseCount: 45,
      createdAt: '2025-03-10'
    },
    {
      id: 3,
      title: 'New Hire Onboarding Feedback',
      type: 'Onboarding',
      status: 'Draft',
      questionCount: 8,
      responseCount: 0,
      createdAt: '2025-05-01'
    },
    {
      id: 4,
      title: 'Leadership 360 Feedback',
      type: 'Performance Review',
      status: 'Active',
      questionCount: 20,
      responseCount: 32,
      createdAt: '2025-04-22'
    }
  ];
  
  useEffect(() => {
    dispatch(fetchContent({ type: 'survey' }));
  }, [dispatch]);
  
  const handleDeleteSurvey = (surveyId) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      dispatch(deleteContent(surveyId));
    }
  };
  
  // Handle input change for new survey form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSurvey({
      ...newSurvey,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleCreateSurvey = (e) => {
    e.preventDefault();
    dispatch(createContent({
      ...newSurvey,
      type: 'survey',
      responseCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    setShowCreateForm(false);
    setNewSurvey({
      title: '',
      type: 'Employee Feedback',
      status: 'Draft',
      description: '',
      questionCount: 0
    });
  };
  
  // Apply filters to surveys
  const filteredSurveys = dummySurveys.filter(survey => {
    const matchesName = survey.title.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    const matchesType = typeFilter === 'all' || survey.type === typeFilter;
    
    return matchesName && matchesStatus && matchesType;
  });
  
  // Handle filter reset
  const handleFilterReset = () => {
    setNameSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
  };
  
  return (
    <div className="surveys-container">
      <div className="surveys-page-header">
        <h1> </h1>
        <button 
          className="surveys-btn-create" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Survey'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="surveys-create-form-container">
          <h2>Create New Survey</h2>
          <form onSubmit={handleCreateSurvey} className="survey-form">
            <div className="surveys-form-row">
              <div className="surveys-form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newSurvey.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="surveys-form-group">
                <label htmlFor="type">Type:</label>
                <select
                  id="type"
                  name="type"
                  value={newSurvey.type}
                  onChange={handleInputChange}
                >
                  <option value="Employee Feedback">Employee Feedback</option>
                  <option value="Training Evaluation">Training Evaluation</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Performance Review">Performance Review</option>
                  <option value="Customer Satisfaction">Customer Satisfaction</option>
                </select>
              </div>
            </div>
            
            <div className="surveys-form-row">
              <div className="surveys-form-group">
                <label htmlFor="surveys-status">Status:</label>
                <select
                  id="status"
                  name="status"
                  value={newSurvey.status}
                  onChange={handleInputChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div className="surveys-form-group">
                <label htmlFor="questionCount">Number of Questions:</label>
                <input
                  type="number"
                  id="questionCount"
                  name="questionCount"
                  value={newSurvey.questionCount}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="surveys-form-group surveys-full-width">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={newSurvey.description}
                onChange={handleInputChange}
                rows="4"
              ></textarea>
            </div>
            
            <div className="surveys-form-actions">
              <button type="submit" className="surveys-btn-submit">Save Survey</button>
              <button 
                type="button" 
                className="surveys-btn-cancel"
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
          <div className="surveys-filter-section">
            <div className="surveys-filter-row">
              <div className="surveys-filter-group">
                <label>Title:</label>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                />
              </div>
              
              <div className="surveys-filter-group">
                <label>Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Employee Feedback">Employee Feedback</option>
                  <option value="Training Evaluation">Training Evaluation</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Performance Review">Performance Review</option>
                  <option value="Customer Satisfaction">Customer Satisfaction</option>
                </select>
              </div>
              
              <div className="surveys-filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div className="surveys-filter-actions">
              <button className="surveys-btn-filter">Filter</button>
              <button className="surveys-btn-reset" onClick={handleFilterReset}>Reset</button>
            </div>
          </div>
          
          {/* Always show dummy data instead of loading/error states */}
          <div className="surveys-surveys-list">
            {filteredSurveys.length === 0 ? (
              <div className="surveys-no-data">No surveys found</div>
            ) : (
              <table className="surveys-data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Questions</th>
                    <th>Responses</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurveys.map((survey) => (
                    <tr key={survey.id}>
                      <td>{survey.title}</td>
                      <td>{survey.type}</td>
                      <td>
                        <span className={`surveys-status-badge ${survey.status.toLowerCase()}`}>
                          {survey.status}
                        </span>
                      </td>
                      <td>{survey.questionCount}</td>
                      <td>{survey.responseCount}</td>
                      <td>{new Date(survey.createdAt).toLocaleDateString()}</td>
                      <td className="surveys-actions-cell">
                        <button className="surveys-btn-view">View Results</button>
                        <button className="surveys-btn-edit">Edit</button>
                        <button 
                          className="surveys-btn-delete"
                          onClick={() => handleDeleteSurvey(survey.id)}
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

export default Surveys;