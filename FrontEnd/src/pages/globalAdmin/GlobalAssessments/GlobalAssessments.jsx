import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit3, Trash2, FileText, Upload, X, Calendar, Tag, Users } from 'lucide-react';
import './GlobalAssessments.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalAssessments, createGlobalAssessment, updateGlobalAssessment, deleteGlobalAssessment, getGlobalAssessmentById, uploadAssessmentFile } from '../../../store/slices/globalAssessmentSlice'; 
import { fetchGroups } from '../../../store/slices/groupSlice'; 
// import api from '../../../services/api';
import QuestionsForm from './QuestionsForm';
const GlobalAssessments = () => {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
 
  // const [formData, setFormData] = useState({
  //   title: '',
  //   description: '',
  //   classification: '',
  //   status: 'Draft',
  //   date: ''
  // });
  
  
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Draft',
    duration: '',            // NEW
    tags: [],                // NEW
    team: '',  
    subteam:'',          // NEW    
    attempts: 1,             // NEW
    percentage_to_pass: 0,   // NEW
    display_answers: true,
    display_answers_when: 'AfterAssessment',
  });
  const [questions, setQuestions] = useState([{
    type: '',
    question_text: '',
    options: [''],
    correct_option: '',
    file_url: '',
    instructions: ''
  }]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    dispatch(fetchGlobalAssessments())
  }, [])
  const {assessments, loading, error} = useSelector((state) => state.globalAssessments)
  useEffect(() => {
    dispatch(fetchGroups()); // fetch teams/subteams
  }, [dispatch]);

  const { groups } = useSelector(state => state.groups); 
  console.log("groups in assessments: ",groups)
  const handleAddAssessment = () => {
    setCurrentAssessment(null);
    setFormData({
      title: '',
      description: '',
      status: 'Draft',
      duration: '',            // NEW
      tags: [],                // NEW
      team: '',                // NEW
      subteam: '',            // NEW
      attempts: 1,             // NEW
      percentage_to_pass: 0,   // NEW
      display_answers: true,
      display_answers_when: 'AfterAssessment',
    
    });
    setQuestions([{
      type: '',
      question_text: '',
      options: [''],
      correct_option: '',
      file_url: '',
      instructions: ''
    }]);
    setShowForm(true);
  };

  const handleEditAssessment = async (assessment) => {
    // Always fetch the latest populated assessment so questions are available
    const id = assessment?.uuid || assessment?._id || assessment?.id;
    try {
      const full = await dispatch(getGlobalAssessmentById(id)).unwrap();
      // Fallback if thunk returns nothing (shouldn't)
      if (!full) {
        setCurrentAssessment(assessment);
        setShowForm(true);
        return;
      }
      setCurrentAssessment(full);

      setFormData({
        title: full.title || '',
        description: full.description || '',
        status: full.status || 'Draft',
        duration: full.duration || '',
        tags: full.tags || [],
        team: full.team || '',
        subteam: full.subteam || '',
        attempts: full.attempts ?? 1,
        percentage_to_pass: full.percentage_to_pass ?? 0,
        display_answers:
          typeof full.display_answers === 'boolean' ? full.display_answers : true,
        display_answers_when:
          full.display_answers_when || 'AfterAssessment',
      });

      const mappedQuestions = Array.isArray(full.questions)
        ? full.questions.map(q => ({
            _id: q._id,
            uuid: q.uuid,
            type: q.type || '',
            question_text: q.question_text || '',
            options: Array.isArray(q.options) && q.options.length ? q.options : [''],
            correct_option: Array.isArray(q.correct_option) ? q.correct_option : (Number.isInteger(q.correct_option) ? [q.correct_option] : []),
            file_url: q.file_url || '',
            instructions: q.instructions || ''
          }))
        : [];
      setQuestions(mappedQuestions.length
        ? mappedQuestions
        : [{ type: '', question_text: '', options: [''], correct_option: '', file_url: '' }]);
      setShowForm(true);
    } catch (e) {
      // Fallback to given assessment if API fails
      console.error('Failed to fetch populated assessment. Using table data.', e);
      setCurrentAssessment(assessment);
      setFormData({
        title: assessment.title || '',
        description: assessment.description || '',
        status: assessment.status || 'Draft',
        duration: assessment.duration || '',
        tags: assessment.tags || [],
        team: assessment.team || '',
        subteam: assessment.subteam || '',
        attempts: assessment.attempts ?? 1,
        percentage_to_pass: assessment.percentage_to_pass ?? 0,
        display_answers:
          typeof assessment.display_answers === 'boolean' ? assessment.display_answers : true,
        display_answers_when:
          assessment.display_answers_when || 'AfterAssessment',
      });
      setQuestions([{ type: '', question_text: '', options: [''], correct_option: '', file_url: '' }]);
      // Ensure default includes instructions
      setQuestions([{ type: '', question_text: '', options: [''], correct_option: '', file_url: '', instructions: '' }]);
      setShowForm(true);
    }
  };

  const handleSaveAssessment = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Build payload matching backend expectations
    const payload = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      duration: formData.duration,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      team: formData.team,
      subteam: formData.subteam,
      attempts: formData.attempts,
      percentage_to_pass: formData.percentage_to_pass,
      display_answers: Boolean(formData.display_answers),
      // Map UI values to backend-friendly strings if needed; using form as-is
      display_answers_when: formData.display_answers ? (formData.display_answers_when || 'AfterAssessment') : 'Never',
      questions: questions.map(q => {
        // Normalize correct_option: convert string like "0,2" to [0,2]
        let correct = q.correct_option;
        if (typeof correct === 'string') {
          correct = correct.includes(',')
            ? correct.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isInteger(n))
            : parseInt(correct.trim(), 10);
        }
        return {
          type: q.type,
          question_text: q.question_text,
          options: q.options,
          correct_option: correct,
          file_url: q.file_url || null,
          instructions: q.instructions || ''
        };
      }),
    };

    try {
      await dispatch(createGlobalAssessment(payload)).unwrap();
      setShowForm(false);
      dispatch(fetchGlobalAssessments());
    } catch (err) {
      console.error('Failed to create assessment:', err?.response?.data || err.message);
    }
  };

  const handleUpdateAssessment = async () => {
      // Build data for update (questions are not updated by edit endpoint)
      const data = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        duration: formData.duration,
        team: formData.team,
        subteam: formData.subteam,
        attempts: formData.attempts,
        percentage_to_pass: formData.percentage_to_pass,
        display_answers: Boolean(formData.display_answers),
        display_answers_when: formData.display_answers ? (formData.display_answers_when || 'AfterAssessment') : 'Never',
        // Send questions with identifiers so backend can update GlobalQuestion
        questions: questions.map(q => {
          // Normalize correct_option to array of integers
          let correct = q.correct_option;
          if (typeof correct === 'string') {
            correct = correct.includes(',')
              ? correct.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isInteger(n))
              : Number.isInteger(parseInt(correct.trim(), 10)) ? [parseInt(correct.trim(), 10)] : [];
          } else if (Number.isInteger(correct)) {
            correct = [correct];
          } else if (Array.isArray(correct)) {
            correct = correct.filter(n => Number.isInteger(n));
          } else {
            correct = [];
          }
          return {
            id: q.uuid || q._id,
            question_text: q.question_text,
            type: q.type,
            options: q.options,
            correct_option: correct,
            file_url: q.file_url || null,
            instructions: q.instructions || ''
          };
        })
      };
      const id = currentAssessment?.uuid || currentAssessment?._id || currentAssessment?.id;
      try {
        await dispatch(updateGlobalAssessment({ id, data })).unwrap();
        setShowForm(false);
        dispatch(fetchGlobalAssessments());
      } catch (err) {
        console.error('Failed to update assessment:', err?.response?.data || err.message);
      }
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

  const duplicateQuestion = (index) => {
    setQuestions(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      if (index < 0 || index >= arr.length) return arr;
      const q = arr[index] || {};
      const dup = {
        // Do not carry over DB identifiers
        type: q.type || '',
        question_text: q.question_text || '',
        options: Array.isArray(q.options) ? [...q.options] : [''],
        // Normalize correct_option into array form if it's array, keep number or empty otherwise
        correct_option: Array.isArray(q.correct_option)
          ? [...q.correct_option]
          : (Number.isInteger(q.correct_option) ? q.correct_option : ''),
        file_url: q.file_url || '',
        instructions: q.instructions || ''
      };
      return [
        ...arr.slice(0, index + 1),
        dup,
        ...arr.slice(index + 1)
      ];
    });
  };

  const handleFileUpload = async (e, qIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await dispatch(uploadAssessmentFile(file)).unwrap();
      if (url) {
        setUploadedFiles(prev => [...prev, url]);
        updateQuestionField(qIndex, 'file_url', url);
      }
    } catch (err) {
      console.error('File upload failed', err?.response?.data || err.message);
    }
  };

  const handleDeleteAssessment = async (id) => {
    try {
      await dispatch(deleteGlobalAssessment(id)).unwrap();
      dispatch(fetchGlobalAssessments());
    } catch (err) {
      console.error('Failed to delete assessment:', err?.response?.data || err.message);
    }
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
          <span>Create Assessment</span>
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
              <button className="assess-btn-primary" onClick={handleAddAssessment} >
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
                            {Array.isArray(assessment.tags) && assessment.tags.length > 0 && (
                              <div className="assess-tags">
                                {assessment.tags.map((t, idx) => (
                                  <span key={`${assessment.id}-tag-${idx}`} className="assess-classification">{t}</span>
                                ))}
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
                            onClick={() => handleDeleteAssessment(assessment.uuid)}
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

      {showForm && <QuestionsForm
        currentAssessment={currentAssessment}
        formData={formData}
        setFormData={setFormData}
        questions={questions}
        showForm={showForm}
        setShowForm={setShowForm}
        uploadedFiles={uploadedFiles}
        handleSaveAssessment={handleSaveAssessment}
        handleEditAssessment={handleEditAssessment}
        handleUpdateAssessment={handleUpdateAssessment}
        handleDeleteAssessment={handleDeleteAssessment}
        updateQuestionField={updateQuestionField}
        addQuestion={addQuestion}
        removeQuestion={removeQuestion}
        addOption={addOption}
        updateOption={updateOption}
        removeOption={removeOption}
        handleFileUpload={handleFileUpload}
        duplicateQuestion={duplicateQuestion}
        groups={groups}
      />
    }

      
    </div>
  );
};
export default GlobalAssessments;