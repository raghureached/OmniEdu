import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit3, Trash2, FileText, Calendar, Users } from 'lucide-react';
import './GlobalAssessments.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalAssessments, createGlobalAssessment, updateGlobalAssessment, deleteGlobalAssessment, getGlobalAssessmentById, uploadAssessmentFile } from '../../../store/slices/globalAssessmentSlice'; 
import { fetchGroups } from '../../../store/slices/groupSlice'; 
// import api from '../../../services/api';
import QuestionsForm from './QuestionsForm';
import LoadingScreen from '../../../components/common/Loading/Loading';
const GlobalAssessments = () => {
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
    attempts: 1,             // NEW
    unlimited_attempts: false,
    percentage_to_pass: 0,   // NEW
    display_answers: true,
    display_answers_when: 'AfterAssessment',
  });
  const [questions, setQuestions] = useState([{
    type: '',
    question_text: '',
    options: ['', ''],
    correct_option: '',
    file_url: '',
    instructions: ''
  }]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sectionsPayload, setSectionsPayload] = useState([]);
  // UI helper: initial sections structure for Step 2 when editing
  const [initialSectionsUI, setInitialSectionsUI] = useState(null);

  const {assessments, loading, pagination} = useSelector((state) => state.globalAssessments)
  const { user: authUser } = useSelector((state) => state.auth || { user: null });
  const [page, setPage] = useState(pagination?.page || 1);
  const limit = 6;

  // Removed sync effect to avoid double fetch and fetch loops due to pagination object updates

  // Fetch list with pagination
  useEffect(() => {
    dispatch(fetchGlobalAssessments({ page, limit }))
  }, [dispatch, page, limit])
  useEffect(() => {
    dispatch(fetchGroups()); // fetch teams/subteams
  }, [dispatch]);

  const { groups } = useSelector(state => state.groups); 
  // console.log("groups in assessments: ",groups)
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
      unlimited_attempts: false,
      percentage_to_pass: 0,   // NEW
      display_answers: true,
      display_answers_when: 'AfterAssessment',
    });
    setQuestions([{
      type: '',
      question_text: '',
      options: ['', ''],
      correct_option: '',
      file_url: '',
      instructions: ''
    }]);
    setInitialSectionsUI([{ afterIndex: -1, title: '', description: '' }]);
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
        selectedIds.map(id => dispatch(updateGlobalAssessment({ id, data: { status } })).unwrap().catch(() => null))
      );
      clearSelection();
      dispatch(fetchGlobalAssessments({ page, limit }));
    } catch (e) {
      console.error('Bulk status update failed', e);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} assessment(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(
        selectedIds.map(id => dispatch(deleteGlobalAssessment(id)).unwrap().catch(() => null))
      );
      clearSelection();
      dispatch(fetchGlobalAssessments({ page, limit }));
    } catch (e) {
      console.error('Bulk delete failed', e);
    }
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
        unlimited_attempts: !!full.unlimited_attempts,
        percentage_to_pass: full.percentage_to_pass ?? 0,
        display_answers:
          typeof full.display_answers === 'boolean' ? full.display_answers : true,
        display_answers_when:
          full.display_answers_when || 'AfterAssessment',
      });

      // Prefer sections->questions if present; fallback to legacy top-level questions
      if (Array.isArray(full.sections) && full.sections.length > 0) {
        const flatQs = [];
        let countSoFar = 0;
        const uiSections = [];
        full.sections.forEach((sec, sIdx) => {
          // Section UI marker: first is top-level (-1), others go after last q of previous section
          const afterIndex = sIdx === 0 ? -1 : Math.max(0, countSoFar - 1);
          uiSections.push({
            afterIndex,
            title: sec?.title || '',
            description: sec?.description || ''
          });
          const qs = Array.isArray(sec?.questions) ? sec.questions : [];
          qs.forEach(q => {
            flatQs.push({
              _id: q._id,
              uuid: q.uuid,
              type: q.type || '',
              question_text: q.question_text || '',
              options: Array.isArray(q.options) && q.options.length ? q.options : [''],
              correct_option: Array.isArray(q.correct_option) ? q.correct_option : (Number.isInteger(q.correct_option) ? [q.correct_option] : []),
              file_url: q.file_url || '',
              instructions: q.instructions || '',
              shuffle_options: Boolean(q.shuffle_options),
              total_points: Number.isFinite(q.total_points) ? q.total_points : 1,
            });
          });
          countSoFar += qs.length;
        });
        setQuestions(flatQs.length ? flatQs : [{ type: '', question_text: '', options: [''], correct_option: '', file_url: '' }]);
        setInitialSectionsUI(uiSections.length ? uiSections : [{ afterIndex: -1, title: '', description: '' }]);
      } else {
        const mappedQuestions = Array.isArray(full.questions)
          ? full.questions.map(q => ({
              _id: q._id,
              uuid: q.uuid,
              type: q.type || '',
              question_text: q.question_text || '',
              options: Array.isArray(q.options) && q.options.length ? q.options : [''],
              correct_option: Array.isArray(q.correct_option) ? q.correct_option : (Number.isInteger(q.correct_option) ? [q.correct_option] : []),
              file_url: q.file_url || '',
              instructions: q.instructions || '',
              shuffle_options: Boolean(q.shuffle_options)
            }))
          : [];
        setQuestions(mappedQuestions.length
          ? mappedQuestions
          : [{ type: '', question_text: '', options: [''], correct_option: '', file_url: '' }]);
        setInitialSectionsUI([{ afterIndex: -1, title: '', description: '' }]);
      }
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
        unlimited_attempts: !!assessment.unlimited_attempts,
        percentage_to_pass: assessment.percentage_to_pass ?? 0,
        display_answers:
          typeof assessment.display_answers === 'boolean' ? assessment.display_answers : true,
        display_answers_when:
          assessment.display_answers_when || 'AfterAssessment',
      });
      setQuestions([{ type: '', question_text: '', options: ['', ''], correct_option: '', file_url: '', instructions: '', shuffle_options: false }]);
      setInitialSectionsUI([{ afterIndex: -1, title: '', description: '' }]);
      setShowForm(true);
    }
  };

  const handleSaveAssessment = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Format duration to "<minutes> mins"
    const minutesFromHhMm = (d) => {
      if (!d) return 0;
      const [h = '0', m = '0'] = String(d).split(':');
      const hh = parseInt(h, 10) || 0;
      const mm = parseInt(m, 10) || 0;
      return (Math.max(0, hh) * 60) + Math.max(0, Math.min(59, mm));
    };

    // Build sections payload if available; fallback to single section with all questions
    const builtSections = Array.isArray(sectionsPayload) && sectionsPayload.length
      ? sectionsPayload
      : [{ title: '', description: '', questions: questions }];

    const payload = {
      title: formData.title,
      description: formData.description,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      duration: `${minutesFromHhMm(formData.duration)} mins`,
      team: formData.team,
      subteam: formData.subteam,
      attempts: formData.attempts,
      unlimited_attempts: Boolean(formData.unlimited_attempts),
      percentage_to_pass: formData.percentage_to_pass,
      display_answers_when: formData.display_answers ? (formData.display_answers_when || 'AfterAssessment') : 'Never',
      status: formData.status || 'Draft',
      created_by: authUser?._id || authUser?.uuid || authUser?.id,
      sections: builtSections.map(sec => ({
        title: sec.title || '',
        description: sec.description || '',
        questions: (sec.questions || []).map(q => {
          // Normalize correct_option to array of integers
          let correct = q.correct_option;
          if (typeof correct === 'string') {
            correct = correct.includes(',')
              ? correct.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isInteger(n))
              : (Number.isInteger(parseInt(correct.trim(), 10)) ? [parseInt(correct.trim(), 10)] : []);
          } else if (Number.isInteger(correct)) {
            correct = [correct];
          } else if (Array.isArray(correct)) {
            correct = correct.filter(n => Number.isInteger(n));
          } else {
            correct = [];
          }
          return {
            question_text: q.question_text,
            type: q.type,
            options: q.options,
            correct_option: correct,
            total_points: Number.isFinite(q.total_points) ? q.total_points : 1,
          };
        })
      }))
    };

    try {
      await dispatch(createGlobalAssessment(payload)).unwrap();
      setShowForm(false);
      dispatch(fetchGlobalAssessments({ page, limit }));
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
        unlimited_attempts: Boolean(formData.unlimited_attempts),
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
            instructions: q.instructions || '',
            shuffle_options: Boolean(q.shuffle_options)
          };
        })
      };
      const id = currentAssessment?.uuid || currentAssessment?._id || currentAssessment?.id;
      try {
        await dispatch(updateGlobalAssessment({ id, data })).unwrap();
        setShowForm(false);
        dispatch(fetchGlobalAssessments({ page, limit }));
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
      options: ['', ''],
      correct_option: '',
      file_url: '',
      instructions: '',
      shuffle_options: false
    }]);
  };

  const addQuestionAfter = (afterIndex) => {
    setQuestions(prev => {
      const q = {
        type: '',
        question_text: '',
        options: ['', ''],
        correct_option: '',
        file_url: '',
        instructions: '',
        shuffle_options: false
      };
      const idx = Math.max(0, Math.min((afterIndex ?? prev.length - 1) + 1, prev.length));
      return [
        ...prev.slice(0, idx),
        q,
        ...prev.slice(idx)
      ];
    });
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
        instructions: q.instructions || '',
        shuffle_options: Boolean(q.shuffle_options)
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
      dispatch(fetchGlobalAssessments({ page, limit }));
    } catch (err) {
      console.error('Failed to delete assessment:', err?.response?.data || err.message);
    }
  };
  console.log(assessments)
  if(loading){
    return <LoadingScreen text="Loading Assessments..." />
  }

  return (
    <div className="assess-container">
      {/* Header Section */}
      <div className="assess-header">
        <div className="assess-header-content">
          <div className="assess-header-info">
            <h1 className="assess-page-title">Assessment Management</h1>
            <p className="assess-page-subtitle">Create, Manage, and Organize Your Assessments</p>
          </div>
          <div className="assess-stats">
            <div className="assess-stat-card">
              <div className="assess-stat-icon">
                <FileText size={20} />
              </div>
              <div className="assess-stat-info">
                <span className="assess-stat-number">{pagination?.total ?? assessments.length}</span>
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
              placeholder="Search Assessments by Title or Description" 
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
                  <th>
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} aria-label="Select all" />
                  </th>
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
                        <span className="assess-question-count">{Array.isArray(assessment?.sections) ? assessment.sections.reduce((total, section) => total + section.questions.length, 0) : 0}</span>
                        <span className="assess-question-label">{(Array.isArray(assessment?.sections) ? assessment.sections.length : 0) <= 1 ? 'Question' : 'Questions'}</span>
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
              {/* Pagination row */}
              <tr className="assess-table-row">
                <td colSpan={6}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {/* <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {(() => {
                        const start = assessments.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
                        const end = Math.min(pagination.page * pagination.limit, pagination.total || start);
                        const total = pagination.total || 0;
                        return `Showing ${start}-${end} of ${total}`;
                      })()}
                    </div> */}
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
          handleUpdateAssessment={handleUpdateAssessment}
          handleDeleteAssessment={handleDeleteAssessment}
          updateQuestionField={updateQuestionField}
          addQuestion={addQuestion}
          addQuestionAfter={addQuestionAfter}
          removeQuestion={removeQuestion}
          addOption={addOption}
          updateOption={updateOption}
          removeOption={removeOption}
          handleFileUpload={handleFileUpload}
          duplicateQuestion={duplicateQuestion}
          groups={groups}
          setSectionsPayload={setSectionsPayload}
          initialSections={initialSectionsUI}
        />
      )}
    </div>
  );
}

export default GlobalAssessments;