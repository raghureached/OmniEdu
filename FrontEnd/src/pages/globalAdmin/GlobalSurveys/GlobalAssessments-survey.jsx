import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit3, Trash2, FileText, Calendar, Users } from 'lucide-react';
import './GlobalAssessments-survey.css'
import { useDispatch, useSelector } from 'react-redux';
//import { uploadAssessmentFile } from '../../../store/slices/globalAssessmentSlice'; 
import { fetchGroups } from '../../../store/slices/groupSlice'; 


import {
  fetchSurveys,
  deleteSurvey,
  createSurvey,
  updateSurvey,
  getSurveyById,
} from "../../../store/slices/surveySlice";

// import api from '../../../services/api';
import QuestionsForm from './QuestionsForm-survey';
import LoadingScreen from '../../../components/common/Loading/Loading';
const GlobalSurveys = () => {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
 
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
    // attempts: 1,             // NEW
    // unlimited_attempts: false,
    // percentage_to_pass: 0,   // NEW
    // display_answers: true,
    // display_answers_when: 'AfterAssessment',
  });
  const [formElements, setFormElements] = useState([{
    type: 'section',
    description: ''
  }, {
    type: 'question',
    question_type: '',
    question_text: '',
    options: ['', '']
  }]);
  // Feedback block state (top instruction, central text, bottom instruction)
  const [feedback, setFeedback] = useState({ instructionTop: '', instruction_header_top: '', question_text: '', instructionBottom: '', instruction_header_bottom: '' });
  //const [uploadedFiles, setUploadedFiles] = useState([]);

  const sel = useSelector((state) => state.surveys || {});
  const surveys = sel.surveys || [];
  const loading = !!sel.loading;
  const pagination = sel.pagination || { total: 0, page: 1, limit: 6, totalPages: 0, hasNextPage: false };
  const assessments = surveys; // keep variable name used throughout component
  const [page, setPage] = useState(pagination.page || 1);
  const limit = 6;

  // Removed sync effect to avoid double fetch and fetch loops due to pagination object updates

  // Fetch list with pagination (surveys)
  useEffect(() => {
    dispatch(fetchSurveys({ page, limit }))
  }, [dispatch, page, limit])
  useEffect(() => {
    dispatch(fetchGroups()); // fetch teams/subteams
  }, [dispatch]);

  const { groups } = useSelector(state => state.groups); 
  console.log("groups in assessments: ",groups)
  const splitInstructions = (str) => {
    const raw = String(str || '');
    if (!raw.trim()) return { instruction_header: '', instruction_text: '' };
    const parts = raw.split(/\n{2,}/);
    const header = (parts[0] || '').trim();
    const text = parts.slice(1).join('\n\n').trim();
    return { instruction_header: header, instruction_text: text };
  };

  const handleAddAssessment = () => {
    setCurrentAssessment(null);
    setFormData({
      title: '',
      description: '',
      status: 'published',
      // duration: '',            // NEW
      tags: [],                // NEW
      team: '',                // NEW
      subteam: '',            // NEW
      // attempts: 1,             // NEW
      // unlimited_attempts: false,
      // percentage_to_pass: 0,   // NEW
      // display_answers: true,
      // display_answers_when: 'AfterAssessment',
    
    });
    setFormElements([{
      type: 'section',
      description: ''
    }, {
      type: 'question',
      question_type: '',
      question_text: '',
      options: ['', '']
    }]);
    setFeedback({ instructionTop: '', instruction_header_top: '', question_text: '', instructionBottom: '', instruction_header_bottom: '' });
    setShowForm(true);
  };
  
  // Visible IDs in the current table page
  const visibleIds = (assessments || []).map(a => a?.uuid || a?._id || a?.id).filter(Boolean);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const allSelected = visibleIds.length > 0 && visibleIds.every(id => prev.includes(id));
      if (allSelected) {
        // Deselect only visible
        return prev.filter(id => !visibleIds.includes(id));
      }
      // Select union of prev and visible
      const set = new Set([...prev, ...visibleIds]);
      return Array.from(set);
    });
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkUpdateStatus = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map(id => dispatch(updateSurvey({ uuid: id, data: { status } })).unwrap().catch(() => null))
      );
      clearSelection();
      dispatch(fetchSurveys({ page, limit }));
    } catch (e) {
      console.error('Bulk status update failed', e);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} survey(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(
        selectedIds.map(id => dispatch(deleteSurvey(id)).unwrap().catch(() => null))
      );
      clearSelection();
      dispatch(fetchSurveys({ page, limit }));
    } catch (e) {
      console.error('Bulk delete failed', e);
    }
  };

  const handleEditAssessment = async (assessment) => {
    // Always fetch the latest populated assessment so questions are available
    const id = assessment?.uuid || assessment?._id || assessment?.id;
    try {
      const full = await dispatch(getSurveyById(id)).unwrap();
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
        status: full.status || 'published',
        // duration: full.duration || '',
        tags: full.tags || [],
        team: full.team || '',
        subteam: full.subteam || '',
        // attempts: full.attempts ?? 1,
        // unlimited_attempts: !!full.unlimited_attempts,
        // percentage_to_pass: full.percentage_to_pass ?? 0,
        // display_answers:
        //   typeof full.display_answers === 'boolean' ? full.display_answers : true,
        // display_answers_when:
        //   full.display_answers_when || 'AfterAssessment',
      });

      // Populate feedback from backend if present
      const f = full.feedback || {};
      setFeedback({
        instructionTop: f.instructionTop || '',
        instruction_header_top: f.instruction_header_top || '',
        question_text: f.question_text || '',
        instructionBottom: f.instructionBottom || '',
        instruction_header_bottom: f.instruction_header_bottom || ''
      });

      // Build formElements from sections if present; fallback to legacy questions
      let mappedFormElements = [];
      if (Array.isArray(full.sections) && full.sections.length > 0) {
        full.sections.forEach((sec, sIdx) => {
          // Push a section descriptor first
          mappedFormElements.push({
            type: 'section',
            title: sec?.title || '',
            description: sec?.description || ''
          });
          // Then its questions
          (sec?.questions || []).forEach(q => {
            mappedFormElements.push({
              _id: q._id,
              uuid: q.uuid,
              type: 'question',
              question_type: q.type || '',
              question_text: q.question_text || '',
              options: (() => {
                const arr = Array.isArray(q.options) && q.options.length ? [...q.options] : ['',''];
                return arr.length >= 2 ? arr : [...arr, ''].slice(0, 2);
              })()
            });
          });
        });
        // Ensure at least one question follows a section
        if (mappedFormElements.length === 1) {
          mappedFormElements.push({ type: 'question', question_type: '', question_text: '', options: ['', ''] });
        }
      } else if (Array.isArray(full.questions)) {
        mappedFormElements = [
          { type: 'section', description: full.description || '' },
          ...full.questions.map(q => ({
            _id: q._id,
            uuid: q.uuid,
            type: 'question',
            question_type: q.type || '',
            question_text: q.question_text || '',
            options: (() => {
              const arr = Array.isArray(q.options) && q.options.length ? [...q.options] : ['',''];
              return arr.length >= 2 ? arr : [...arr, ''].slice(0, 2);
            })()
          }))
        ];
      } else {
        mappedFormElements = [
          { type: 'section', description: full.description || '' },
          { type: 'question', question_type: '', question_text: '', options: ['', ''] }
        ];
      }
      setFormElements(mappedFormElements);
      setShowForm(true);
    } catch (e) {
      // Fallback to given assessment if API fails
      console.error('Failed to fetch populated assessment. Using table data.', e);
      setCurrentAssessment(assessment);
      setFormData({
        title: assessment.title || '',
        description: assessment.description || '',
        status: assessment.status || 'Draft',
        // duration: assessment.duration || '',
        tags: assessment.tags || [],
        team: assessment.team || '',
        subteam: assessment.subteam || '',
        // attempts: assessment.attempts ?? 1,
        // unlimited_attempts: !!assessment.unlimited_attempts,
        // percentage_to_pass: assessment.percentage_to_pass ?? 0,
        // display_answers:
        //   typeof assessment.display_answers === 'boolean' ? assessment.display_answers : true,
        // display_answers_when:
        //   assessment.display_answers_when || 'AfterAssessment',
      });
      setFeedback({ instructionTop: '', instruction_header_top: '', question_text: '', instructionBottom: '', instruction_header_bottom: '' });
      setFormElements([
        {
          type: 'section',
          description: assessment.description || ''
        },
        {
          type: 'question',
          question_type: '',
          question_text: '',
          options: ['', '']
        }
      ]);
    }
  };

  const handleSaveAssessment = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Group formElements by sections and extract questions
    const sections = [];
    let currentSection = null;
    let surveyTitle = formData.title || '';
    let surveyDescription = formData.description || '';

    for (const element of formElements) {
      if (element.type === 'section') {
        // Save previous section if it exists
        if (currentSection && currentSection.questions.length > 0) {
          sections.push(currentSection);
        }
        // Start new section
        currentSection = {
          description: element.description || '',
          questions: []
        };
      } else if (element.type === 'question') {
        const question_type = (element.question_type || '').trim();
        const question_text = (element.question_text || '').trim();
        const options = (Array.isArray(element.options) ? element.options : []).map(o => (o || '').trim()).filter(Boolean);

        if (!question_type || !['Multiple Choice', 'Multi Select'].includes(question_type)) {
          alert('Each question must have a valid type: Multiple Choice or Multi Select');
          return;
        }
        if (!question_text) {
          alert('Each question must have non-empty text');
          return;
        }
        if (options.length < 2) {
          alert('Each question must have at least two non-empty options');
          return;
        }
        currentSection.questions.push({
          question_text: question_text,
          type: question_type,
          instruction_text: element.instruction_text || '',
          options: options,
          order: currentSection.questions.length + 1
        });
      }
    }

    // Don't forget the last section
    if (currentSection && currentSection.questions.length > 0) {
      sections.push(currentSection);
    }

    const payload = {
      title: surveyTitle,
      description: surveyDescription,
      status: formData.status,
      // duration: formData.duration,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      team: formData.team,
      subteam: formData.subteam,
      // attempts: formData.attempts,
      // unlimited_attempts: Boolean(formData.unlimited_attempts),
      // percentage_to_pass: formData.percentage_to_pass,
      // display_answers: Boolean(formData.display_answers),
      // Map UI values to backend-friendly strings if needed; using form as-is
     // display_answers_when: formData.display_answers ? (formData.display_answers_when || 'AfterAssessment') : 'Never',
      sections: sections,
      feedback: {
       
        question_text: feedback.question_text || '',
        instructionBottom: feedback.instructionBottom || '',
      
      }
    };
 console.log(sections )
    try {
      await dispatch(createSurvey(payload)).unwrap();
      setShowForm(false);
      dispatch(fetchSurveys({ page, limit }));
    } catch (err) {
      console.error('Failed to create assessment:', err?.response?.data || err.message);
    }
  };

  const handleUpdateAssessment = async () => {
      // Group formElements by sections and extract questions for update
      const sections = [];
      let currentSection = null;
      let surveyTitle = formData.title || '';
      let surveyDescription = formData.description || '';

      for (const element of formElements) {
        if (element.type === 'section') {
          // Save previous section if it exists
          if (currentSection && currentSection.questions.length > 0) {
            sections.push(currentSection);
          }
          // Start new section
          currentSection = {
            description: element.description || '',
            questions: []
          };
        } else if (element.type === 'question') {
          const question_type = (element.question_type || '').trim();
          const question_text = (element.question_text || '').trim();
          const options = (Array.isArray(element.options) ? element.options : []).map(o => (o || '').trim()).filter(Boolean);

          if (!question_type || !['Multiple Choice', 'Multi Select'].includes(question_type)) {
            alert('Each question must have a valid type: Multiple Choice or Multi Select');
            return;
          }
          if (!question_text) {
            alert('Each question must have non-empty text');
            return;
          }
          if (options.length < 2) {
            alert('Each question must have at least two non-empty options');
            return;
          }
          currentSection.questions.push({
            _id: element._id || element.uuid,
            question_text: question_text,
            type: question_type,
            instruction_text: element.instruction_text || '',
            options: options,
            order: currentSection.questions.length + 1
          });
        }
      }

      // Don't forget the last section
      if (currentSection && currentSection.questions.length > 0) {
        sections.push(currentSection);
      }

      const data = {
        title: surveyTitle,
        description: surveyDescription,
        status: formData.status,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        // duration: formData.duration,
        team: formData.team,
        subteam: formData.subteam,
        // Send questions with identifiers so backend can update GlobalQuestion
        sections: sections,
        feedback: {
          instructionTop: feedback.instructionTop || '',
          instruction_header_top: feedback.instruction_header_top || '',
          question_text: feedback.question_text || '',
          instructionBottom: feedback.instructionBottom || '',
          instruction_header_bottom: feedback.instruction_header_bottom || ''
        }
      };
      const id = currentAssessment?.uuid || currentAssessment?._id || currentAssessment?.id;
      try {
        await dispatch(updateSurvey({ uuid: id, data })).unwrap();
        setShowForm(false);
        dispatch(fetchSurveys({ page, limit }));
      } catch (err) {
        console.error('Failed to update assessment:', err?.response?.data || err.message);
      }
    };

    const updateFormElementField = (elementIndex, field, value) => {
    const updated = [...formElements];
    updated[elementIndex][field] = value;
    setFormElements(updated);
  };

  const addFormElement = (type, initialData = {}, insertIndex = null) => {
    const baseElement = {
      type,
      ...initialData
    };

    switch (type) {
      case 'info':
        const infoElem = {
          type: 'info',
          title: '',
          description: '',
          ...initialData
        };
        if (insertIndex === null || insertIndex === undefined) {
          setFormElements([...formElements, infoElem]);
        } else {
          const idx = Math.max(0, Math.min(insertIndex, formElements.length));
          setFormElements([
            ...formElements.slice(0, idx),
            infoElem,
            ...formElements.slice(idx)
          ]);
        }
        break;
      case 'question':
        const qElem = {
          type: 'question',
          question_type: '',
          question_text: '',
          options: ['', ''],
          ...initialData
        };
        if (insertIndex === null || insertIndex === undefined) {
          setFormElements([...formElements, qElem]);
        } else {
          const idx = Math.max(0, Math.min(insertIndex, formElements.length));
          setFormElements([
            ...formElements.slice(0, idx),
            qElem,
            ...formElements.slice(idx)
          ]);
        }
        break;
      case 'section':
        const sElem = {
          type: 'section',
          title: '',
          description: '',
          ...initialData
        };
        if (insertIndex === null || insertIndex === undefined) {
          setFormElements([...formElements, sElem]);
        } else {
          const idx = Math.max(0, Math.min(insertIndex, formElements.length));
          setFormElements([
            ...formElements.slice(0, idx),
            sElem,
            ...formElements.slice(idx)
          ]);
        }
        break;
      default:
        if (insertIndex === null || insertIndex === undefined) {
          setFormElements([...formElements, baseElement]);
        } else {
          const idx = Math.max(0, Math.min(insertIndex, formElements.length));
          setFormElements([
            ...formElements.slice(0, idx),
            baseElement,
            ...formElements.slice(idx)
          ]);
        }
    }
  };

  const removeFormElement = (index) => {
    if (formElements.length > 2) { // Always keep at least info box and 1 question
      setFormElements(formElements.filter((_, i) => i !== index));
    }
  };

  const addOption = (elementIndex) => {
    const updated = [...formElements];
    if (updated[elementIndex].options) {
      updated[elementIndex].options.push('');
      setFormElements(updated);
    }
  };

  const updateOption = (elementIndex, optIndex, value) => {
    const updated = [...formElements];
    if (updated[elementIndex].options) {
      updated[elementIndex].options[optIndex] = value;
      setFormElements(updated);
    }
  };

  const removeOption = (elementIndex, optIndex) => {
    const updated = [...formElements];
    if (updated[elementIndex].options && updated[elementIndex].options.length > 2) {
      updated[elementIndex].options.splice(optIndex, 1);
      setFormElements(updated);
    }
  };

  const duplicateFormElement = (index) => {
    setFormElements(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      if (index < 0 || index >= arr.length) return arr;
      const element = arr[index] || {};
      // Shallow copy element and deep-copy nested arrays we mutate in UI
      const dup = { ...element };
      if (Array.isArray(element.options)) {
        dup.options = [...element.options];
      }

      // Remove database identifiers for the duplicate
      delete dup._id;
      delete dup.uuid;

      return [
        ...arr.slice(0, index + 1),
        dup,
        ...arr.slice(index + 1)
      ];
    });
  };

  // const handleFileUpload = async (e, qIndex) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   try {
  //     const url = await dispatch(uploadAssessmentFile(file)).unwrap();
  //     if (url) {
  //       setUploadedFiles(prev => [...prev, url]);
  //       updateQuestionField(qIndex, 'file_url', url);
  //     }
  //   } catch (err) {
  //     console.error('File upload failed', err?.response?.data || err.message);
  //   }
  // };

  const handleDeleteAssessment = async (id) => {
    try {
      await dispatch(deleteSurvey(id)).unwrap();
      dispatch(fetchSurveys({ page, limit }));
    } catch (err) {
      console.error('Failed to delete assessment:', err?.response?.data || err.message);
    }
  };
  if(loading){
    return <LoadingScreen text="Loading Surveys..."/>
  }
  return (
    <div className="assess-container">
      {/* Header Section */}
      <div className="assess-header">
        <div className="assess-header-content">
          <div className="assess-header-info">
            <h1 className="assess-page-title">Survey Management</h1>
            <p className="assess-page-subtitle">Create, Manage, and Organize Your Surveys</p>
          </div>
          <div className="assess-stats">
            <div className="assess-stat-card">
              <div className="assess-stat-icon">
                <FileText size={20} />
              </div>
              <div className="assess-stat-info">
                <span className="assess-stat-number">{pagination?.total ?? assessments.length}</span>
                <span className="assess-stat-label">Total Surveys</span>
              </div>
            </div>
            <div className="assess-stat-card">
              <div className="assess-stat-icon published">
                <Users size={20} />
              </div>
              <div className="assess-stat-info">
                <span className="assess-stat-number">{assessments.filter(a => a.status === 'published').length}</span>
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
              placeholder="Search surveys by title or description " 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <button className="assess-btn-primary" onClick={handleAddAssessment}>
          <Plus size={16} />
          <span>Create Survey</span>
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', margin: '8px 0' }}>
          <div style={{ color: '#0f172a' }}>
            <strong>{selectedIds.length}</strong> selected
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* <button className="assess-btn-secondary" onClick={() => bulkUpdateStatus('Published')} disabled={loading}>Publish</button>
            <button className="assess-btn-secondary" onClick={() => bulkUpdateStatus('Draft')} disabled={loading}>Move to Draft</button>*/}
            <button className="assess-btn-secondary" onClick={bulkDelete} disabled={loading} title="Delete selected">Delete</button> 
            <button className="assess-btn-secondary" onClick={clearSelection}>Clear</button>
          </div>
        </div>
      )}

      {/* Assessment Table */}
      <div className="assess-table-section">
        <div className="assess-table-container">
          {assessments.length === 0 ? (
            <div className="assess-empty-state">
              <div className="assess-empty-icon">
                <FileText size={48} />
              </div>
              <h3>No Survey found</h3>
              <p>Get started by creating your first Survey</p>
              <button className="assess-btn-primary" onClick={handleAddAssessment} >
                <Plus size={16} />
                Create Survey
              </button>
            </div>
          ) : (
            <table className="assess-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} aria-label="Select all" />
                  </th>
                  <th>Survey Details</th>
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
                  <tr key={assessment.uuid || assessment._id || assessment.id} className="assess-table-row">
                    <td>
                      {(() => { const rowId = assessment.uuid || assessment._id || assessment.id; const checked = selectedIds.includes(rowId); return (
                        <input type="checkbox" checked={checked} onChange={() => toggleSelectOne(rowId)} aria-label="Select row" />
                      ); })()}
                    </td>
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
                        <span className="assess-question-count">{Array.isArray(assessment.sections) ? assessment.sections.reduce((acc, section) => acc + ((section && Array.isArray(section.questions)) ? section.questions.length : 0), 0) : 0}</span>
                        <span className="assess-question-label">{(Array.isArray(assessment.sections) ? assessment.sections.reduce((acc, section) => acc + ((section && Array.isArray(section.questions)) ? section.questions.length : 0), 0) : 0) <= 1 ? 'Question' : 'Questions'}</span>
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
                          className="assess-action-btn delete" 
                          onClick={() => handleDeleteAssessment(assessment.uuid)}
                          title="Delete Assessment"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button 
                          className="assess-action-btn edit" 
                          onClick={() => handleEditAssessment(assessment)}
                          title="Edit Assessment"
                        >
                          <Edit3 size={14} />
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              {/* Pagination row */}
              <tr className="assess-table-row">
                <td colSpan={6}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                   
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1 || loading}
                        style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: page <= 1 || loading ? 'not-allowed' : 'pointer' }}
                      >
                        Prev
                      </button>
                      <span style={{ color: '#0f172a' }}>
                        {(() => {
                          const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 1)));
                          return `Page ${page} of ${totalPages}`;
                        })()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 1)));
                          setPage(p => Math.min(totalPages, p + 1));
                        }}
                        disabled={loading || (pagination && page >= Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 1))))}
                        style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: loading || (pagination && page >= Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 1)))) ? 'not-allowed' : 'pointer' }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          )}
        </div>
      </div>
      {showForm && <QuestionsForm
        currentAssessment={currentAssessment}
        formData={formData}
        setFormData={setFormData}
        formElements={formElements}
        showForm={showForm}
        setShowForm={setShowForm}
        // uploadedFiles={uploadedFiles}
        handleSaveAssessment={handleSaveAssessment}
        handleEditAssessment={handleEditAssessment}
        handleUpdateAssessment={handleUpdateAssessment}
        handleDeleteAssessment={handleDeleteAssessment}
        updateFormElementField={updateFormElementField}
        addFormElement={addFormElement}
        removeFormElement={removeFormElement}   
        addOption={addOption}
        updateOption={updateOption}
        removeOption={removeOption}
        // handleFileUpload={handleFileUpload}
        duplicateFormElement={duplicateFormElement}
        groups={groups}
        feedback={feedback}
        setFeedback={setFeedback}
      />}
    </div>
  );
};
export default GlobalSurveys;