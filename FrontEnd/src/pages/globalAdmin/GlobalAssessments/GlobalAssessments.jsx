import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit3, Trash2, FileText, Upload, X, Calendar, Tag, Users } from 'lucide-react';
import './GlobalAssessments.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalAssessments } from '../../../store/slices/globalAssessmentSlice';
import QuestionsForm from './QuestionsForm';
const GlobalAssessments = () => {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classification: '',
    status: 'Draft',
    date: ''
  });
  const [questions, setQuestions] = useState([{
    type: '',
    question_text: '',
    options: [''],
    correct_option: '',
    file_url: ''
  }]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    dispatch(fetchGlobalAssessments())
  }, [])
  const {assessments, loading, error} = useSelector((state) => state.globalAssessments)

  const handleAddAssessment = () => {
    setCurrentAssessment(null);
    setFormData({
      title: '',
      description: '',
      classification: '',
      status: 'Draft',
      date: ''
    });
    setQuestions([{
      type: '',
      question_text: '',
      options: [''],
      correct_option: '',
      file_url: ''
    }]);
    setShowForm(true);
  };

  const handleEditAssessment = (assessment) => {
    setCurrentAssessment(assessment);
    setFormData({
      title: assessment.title || '',
      description: assessment.description || '',
      classification: assessment.classification || '',
      status: assessment.status || 'Draft',
      date: assessment.createdAt || ''
    });
    setShowForm(true);
  };

  const handleSaveAssessment = (e) => {
    e.preventDefault();
    console.log('Saving assessment:', { formData, questions });
    setShowForm(false);
  };

  const updateQuestionField = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      type: '',
      question_text: '',
      options: [''],
      correct_option: '',
      file_url: ''
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 1) {
      updated[qIndex].options.splice(optIndex, 1);
      setQuestions(updated);
    }
  };

  const handleFileUpload = (e, qIndex) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedFiles([...uploadedFiles, url]);
      updateQuestionField(qIndex, 'file_url', url);
    }
  };

  const handleDeleteAssessment = (id) => {
    console.log('Delete assessment:', id);
  };

  return (
    <div className="assess-container">
      {/* Header Section */}
      <div className="assess-header">
        <div className="assess-header-content">
          <div className="assess-header-info">
            <h1 className="assess-page-title">Assessment Management</h1>
            <p className="assess-page-subtitle">Create, manage and organize your assessments</p>
          </div>
          <div className="assess-stats">
            <div className="assess-stat-card">
              <div className="assess-stat-icon">
                <FileText size={20} />
              </div>
              <div className="assess-stat-info">
                <span className="assess-stat-number">{assessments.length}</span>
                <span className="assess-stat-label">Total Assessments</span>
              </div>
            </div>
            <div className="assess-stat-card">
              <div className="assess-stat-icon published">
                <Users size={20} />
              </div>
              <div className="assess-stat-info">
                <span className="assess-stat-number">{assessments.filter(a => a.status === 'Published').length}</span>
                <span className="assess-stat-label">Published</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="assess-toolbar">
        <div className="assess-search-container">
          <div className="assess-search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search assessments by title or description..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <button className="assess-btn-primary" onClick={handleAddAssessment}>
          <Plus size={16} />
          <span>Add Assessment</span>
        </button>
      </div>

      {/* Assessment Table */}
      <div className="assess-table-section">
        <div className="assess-table-container">
          {assessments.length === 0 ? (
            <div className="assess-empty-state">
              <div className="assess-empty-icon">
                <FileText size={48} />
              </div>
              <h3>No assessments found</h3>
              <p>Get started by creating your first assessment</p>
              <button className="assess-btn-primary" onClick={handleAddAssessment}>
                <Plus size={16} />
                Create Assessment
              </button>
            </div>
          ) : (
            <table className="assess-table">
              <thead>
                <tr>
                  <th>Assessment Details</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments
                  .filter(a => a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              a.description?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(assessment => (
                    <tr key={assessment.id} className="assess-table-row">
                      <td>
                        <div className="assess-cell-content">
                          <div className="assess-title-container">
                            <h4 className="assess-title">{assessment.title}</h4>
                            <p className="assess-description">{assessment.description || "No description provided"}</p>
                            {assessment.classification && (
                              <div className="assess-classification">
                                <Tag size={12} />
                                <span>{assessment.classification}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="assess-questions-info">
                          <span className="assess-question-count">{assessment.questions.length}</span>
                          <span className="assess-question-label">questions</span>
                        </div>
                      </td>
                      <td>
                        <span className={`assess-status-badge ${assessment.status?.toLowerCase()}`}>
                          {assessment.status}
                        </span>
                      </td>
                      <td>
                        <div className="assess-date-info">
                          <Calendar size={14} />
                          <span>{assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : ""}</span>
                        </div>
                      </td>
                      <td>
                        <div className="assess-actions">
                          <button 
                            className="assess-action-btn edit" 
                            onClick={() => handleEditAssessment(assessment)}
                            title="Edit Assessment"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="assess-action-btn delete" 
                            onClick={() => handleDeleteAssessment(assessment.id)}
                            title="Delete Assessment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
  <QuestionsForm
    currentAssessment={currentAssessment}
    formData={formData}
    setFormData={setFormData}
    questions={questions}
    showForm={showForm}
    setShowForm={setShowForm}
    uploadedFiles={uploadedFiles}
    handleSaveAssessment={handleSaveAssessment}
    handleEditAssessment={handleEditAssessment}
    handleDeleteAssessment={handleDeleteAssessment}
    updateQuestionField={updateQuestionField}
    addQuestion={addQuestion}
    removeQuestion={removeQuestion}
    addOption={addOption}
    updateOption={updateOption}
    removeOption={removeOption}
    handleFileUpload={handleFileUpload}
  />
)}

      
    </div>
  );
};

export default GlobalAssessments;