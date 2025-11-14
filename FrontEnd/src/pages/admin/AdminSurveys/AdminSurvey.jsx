import React, { useEffect, useRef, useState } from 'react';
import { Search, Plus, Edit3, Trash2, FileText, Calendar, Users, ChevronDown, Filter } from 'lucide-react';
import { GoX } from 'react-icons/go';
import { RiDeleteBinFill } from 'react-icons/ri';
import './AdminSurvey.css'
import { useDispatch, useSelector } from 'react-redux';
//import { uploadAssessmentFile } from '../../../store/slices/globalAssessmentSlice'; 
import { fetchGroups } from '../../../store/slices/groupSlice';


import {
  fetchSurveys,
  deleteSurvey,
  createSurvey,
  updateSurvey,
  getSurveyById,
} from "../../../store/slices/adminSurveySlice";

// import api from '../../../services/api';
import QuestionsForm from './QuestionsForm-survey';
import LoadingScreen from '../../../components/common/Loading/Loading';
import api from '../../../services/apiOld';
const AdminSurveys = () => {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: ''
  });
  const [tempFilters, setTempFilters] = useState({
    status: ''
  });
  const filterButtonRef = useRef(null);
  const bulkButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const bulkPanelRef = useRef(null);
  const [filterPanelStyle, setFilterPanelStyle] = useState({ top: 0, left: 0 });
  const [bulkPanelStyle, setBulkPanelStyle] = useState({ top: 0, left: 0 });

  const updateFilterPanelPosition = () => {
    const rect = filterButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setFilterPanelStyle({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  };

  const updateBulkPanelPosition = () => {
    const rect = bulkButtonRef.current?.getBoundingClientRect();
    if (rect) {
      const panelWidth = bulkPanelRef.current?.offsetWidth || 0;
      const fallbackLeft = rect.left + window.scrollX;
      setBulkPanelStyle({
        top: rect.bottom + window.scrollY + 8,
        left: panelWidth ? rect.right + window.scrollX - panelWidth : fallbackLeft,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const filterBtn = filterButtonRef.current;
      const bulkBtn = bulkButtonRef.current;
      const filterPanel = filterPanelRef.current;
      const bulkPanel = bulkPanelRef.current;

      if (
        (showFilters || showBulkAction) &&
        !(
          (filterPanel && filterPanel.contains(target)) ||
          (bulkPanel && bulkPanel.contains(target)) ||
          (filterBtn && filterBtn.contains(target)) ||
          (bulkBtn && bulkBtn.contains(target))
        )
      ) {
        setShowFilters(false);
        setShowBulkAction(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, showBulkAction]);

  useEffect(() => {
    if (showFilters) {
      updateFilterPanelPosition();
    }
    if (showBulkAction) {
      updateBulkPanelPosition();
    }
  }, [showFilters, showBulkAction]);

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (showFilters) {
        updateFilterPanelPosition();
      }
      if (showBulkAction) {
        updateBulkPanelPosition();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [showFilters, showBulkAction]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Saved',
    duration: '',            // NEW
    tags: [],                // NEW
    team: '',
    subteam: '',          // NEW    
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
  //const [feedback, setFeedback] = useState({ instructionTop: '', instruction_header_top: '', question_text: '', instructionBottom: '', instruction_header_bottom: '' });
  //const [uploadedFiles, setUploadedFiles] = useState([]);

  const sel = useSelector((state) => state.surveys || {});
  const surveys = sel.surveys || [];
  const loading = !!sel.loading;
  const creating = !!sel.creating;
  const updating = !!sel.updating;
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
    const fetchGroups = async () => {
      try {
        const response = await api.get('/api/admin/getGroups');
        setGroups(response.data.data)
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups(); // fetch teams/subteams
  }, [dispatch]);

  // const { groups } = useSelector(state => state.groups); 
  // console.log("groups in assessments: ",groups)
  // const splitInstructions = (str) => {
  //   const raw = String(str || '');
  //   if (!raw.trim()) return { instruction_header: '', instruction_text: '' };
  //   const parts = raw.split(/\n{2,}/);
  //   const header = (parts[0] || '').trim();
  //   const text = parts.slice(1).join('\n\n').trim();
  //   return { instruction_header: header, instruction_text: text };
  // };

  const handleAddAssessment = () => {
    setCurrentAssessment(null);
    setFormData({
      title: '',
      description: '',
      status: 'Saved',
      // duration: '',            // NEW
      tags: [],                // NEW
      team: '',                // NEW
      subteam: '',            // NEW
      // attempts: 1,             // NEW
      // unlimited_attempts: false,
      // percentage_to_pass: 0,   // NEW
      // display_answers: true,
      // display_answers_when: 'AfterAssessment',
      noOfSections: 0,
      noOfQuestions: 0,
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
    // setFeedback({ instructionTop: '', instruction_header_top: '', question_text: '', instructionBottom: '', instruction_header_bottom: '' });
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

  const bulkDelete = async (itemsToDelete = selectedIds) => {
    if (itemsToDelete.length === 0) return;
    if (!window.confirm(`Delete ${itemsToDelete.length} survey(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(
        itemsToDelete.map(id => dispatch(deleteSurvey(id)).unwrap().catch(() => null))
      );
      clearSelection();
      setShowBulkAction(false);
      dispatch(fetchSurveys({ page, limit }));
    } catch (e) {
      console.error('Bulk delete failed', e);
    }
  };

  // Alias handleBulkDelete to bulkDelete for backward compatibility
  const handleBulkDelete = bulkDelete;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setTempFilters({ status: '' });
  };

  const handleFilter = () => {
    // Apply the temporary filters
    setFilters({ ...tempFilters });
    // Close the filter panel
    setShowFilters(false);
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
        status: full.status || 'Saved',
        // duration: full.duration || '',
        tags: full.tags || [],
        team: full.team || '',
        subteam: full.subteam || '',
        noOfSections: full.noOfSections || 0,
        noOfQuestions: full.noOfQuestions || 0,

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
                const arr = Array.isArray(q.options) && q.options.length ? [...q.options] : ['', ''];
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
              const arr = Array.isArray(q.options) && q.options.length ? [...q.options] : ['', ''];
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
        status: assessment.status || 'Saved',
        duration: assessment.duration || '',
        tags: assessment.tags || [],
        team: assessment.team || '',
        subteam: assessment.subteam || '',
        noOfSections: assessment.noOfSections || 0,
        noOfQuestions: assessment.noOfQuestions || 0,
      });
      // setFeedback({ instructionTop: '', instruction_header_top: '', question_text: '', instructionBottom: '', instruction_header_bottom: '' });
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

  const handleSaveAssessment = async (e, statusOverride) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Group formElements by sections and extract questions
    const sections = [];
    let currentSection = null;
    let surveyTitle = formData.title || '';
    let surveyDescription = formData.description || '';
    let noOfSections = formData.noOfSections || 0;
    let noOfQuestions = formData.noOfQuestions || 0;
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
          // instruction_text: element.instruction_text || '',
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
      status: statusOverride ?? (formData.status || 'Saved'),
      // duration: formData.duration,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      team: formData.team,
      subteam: formData.subteam,
      sections: sections,
      noOfSections: noOfSections,
      noOfQuestions: noOfQuestions,
    };
    //  console.log(sections )
    try {
      await dispatch(createSurvey(payload)).unwrap();
      setShowForm(false);
      dispatch(fetchSurveys({ page, limit }));
    } catch (err) {
      console.error('Failed to create assessment:', err?.response?.data || err.message);
    }
  };

  const handleUpdateAssessment = async (statusOverride) => {
    // Validate that we have a current assessment to update

    if (!currentAssessment) {
      console.error('❌ currentAssessment is null/undefined');
      alert('Error: No assessment selected for update. Please select an assessment to edit first.');
      return;
    }

    if (typeof currentAssessment !== 'object') {
      console.error('❌ currentAssessment is not an object:', currentAssessment);
      alert('Error: Invalid assessment data. Please try again.');
      return;
    }

    if (!currentAssessment.uuid && !currentAssessment._id && !currentAssessment.id) {
      console.error('❌ currentAssessment missing ID fields');
      console.error('Available fields:', Object.keys(currentAssessment));
      alert('Error: Assessment ID fields missing. Please try editing again.');
      return;
    }

    // Group formElements by sections and extract questions for update
    const sections = [];
    let currentSection = null;
    let surveyTitle = formData.title || '';
    let surveyDescription = formData.description || '';
    let noOfSections = formData.noOfSections || 0;
    let noOfQuestions = formData.noOfQuestions || 0;

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
          //instruction_text: element.instruction_text || '',
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
      status: statusOverride ?? formData.status,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      // duration: formData.duration,
      team: formData.team,
      subteam: formData.subteam,
      // Send questions with identifiers so backend can update GlobalQuestion
      sections: sections,
      noOfSections: formData.noOfSections,
      noOfQuestions: formData.noOfQuestions,

    };

    const id = currentAssessment?.uuid || currentAssessment?._id || currentAssessment?.id;


    if (!id) {
      console.error('❌ No valid ID found for current assessment:', currentAssessment);
      alert('Error: Assessment ID not found. Please try again.');
      return;
    }
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
    // Limit to maximum 5 options
    if (updated[elementIndex].options && updated[elementIndex].options.length < 5) {
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
    // Keep minimum 2 options
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


  const handleDeleteAssessment = async (id) => {
    try {
      await dispatch(deleteSurvey(id)).unwrap();
      dispatch(fetchSurveys({ page, limit }));
    } catch (err) {
      console.error('Failed to delete assessment:', err?.response?.data || err.message);
    }
  };
  if (creating) {
    return <LoadingScreen text="Creating Surveys..." />
  }
  if (updating) {
    return <LoadingScreen text="Updating Surveys..." />
  }
  if (loading) {
    return <LoadingScreen text="Loading Surveys..." />
  }

  // Filter the assessments based on search term and status filter
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = searchTerm === '' || 
      (assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       assessment.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !filters.status || assessment.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

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



      {/* Controls */}
      <div className="controls">
        <div className="roles-search-bar">
          <Search size={16} color="#6b7280" className="search-icon" />
          <input
            type="text"
            name="name"
            placeholder="Search Surveys"
            className="search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="controls-right">
          <button
            ref={filterButtonRef}
            className="control-btn"
            onClick={() => {
              setShowFilters(prev => {
                const next = !prev;
                if (next) {
                  setShowBulkAction(false);
                  const rect = filterButtonRef.current?.getBoundingClientRect();
                  if (rect) {
                    setFilterPanelStyle({
                      top: rect.bottom + window.scrollY + 8,
                      left: rect.left + window.scrollX,
                    });
                  }
                }
                return next;
              });
            }}
          >
            <Filter size={16} />
            Filter
          </button>

          {/* <button className="control-btn">
                  <Share size={16} />
                  Share
                </button> */}
          <button
            ref={bulkButtonRef}
            className="control-btn"
            onClick={() => {
              setShowBulkAction(prev => {
                const next = !prev;
                if (next) {
                  setShowFilters(false);
                  const rect = bulkButtonRef.current?.getBoundingClientRect();
                  if (rect) {
                    setBulkPanelStyle({
                      top: rect.bottom + window.scrollY + 8,
                      left: rect.left + window.scrollX,
                    });
                  }
                }
                return next;
              });
            }}
          >
            Bulk Action <ChevronDown size={16} />
          </button>
          <button className="assess-btn-primary" onClick={handleAddAssessment}>
            <Plus size={16} />
            <span>Create Survey</span>
          </button>
        </div>
      </div>
      {showFilters && (
        <div
          ref={filterPanelRef}
          className="adminsurvey-filter-panel"
          style={{ top: filterPanelStyle.top, left: filterPanelStyle.left, position: 'absolute' }}
        >
          <span style={{ cursor: "pointer", position: "absolute", right: "10px", top: "10px", hover: { color: "#6b7280" } }} onClick={() => setShowFilters(false)}><GoX size={20} color="#6b7280" /></span>
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={tempFilters?.status || ""}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="Saved">Saved</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>


          <div className="filter-actions">
          <button className="btn-primary" onClick={handleFilter}>
              Apply
            </button>
            <button className="reset-btn" onClick={resetFilters}>
              Clear
            </button>
            
           
          </div>
        </div>
      )}
      {showBulkAction && (
        <div
          ref={bulkPanelRef}
          className="adminsurvey-bulk-action-panel"
          style={{ top: bulkPanelStyle.top, left: bulkPanelStyle.left, position: 'absolute' }}
        >
          <div className="bulk-action-header">
            <label className="bulk-action-title">Items Selected: {selectedIds.length}</label>
            <GoX
              size={20}
              title="Close"
              aria-label="Close bulk action panel"
              onClick={() => setShowBulkAction(false)}
              className="bulk-action-close"
            />
          </div>
          <div className="bulk-action-actions">
            <button
              className="bulk-action-delete-btn"
              disabled={selectedIds.length === 0}
              onClick={() => handleBulkDelete(selectedIds)}
            >
              <RiDeleteBinFill size={16} color="#fff" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}




      {/* {selectedIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', margin: '8px 0' }}>
          <div style={{ color: '#0f172a' }}>
            <strong>{selectedIds.length}</strong> selected
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="assess-btn-secondary" onClick={() => bulkUpdateStatus('Published')} disabled={loading}>Publish</button>
            <button className="assess-btn-secondary" onClick={() => bulkUpdateStatus('Draft')} disabled={loading}>Move to Draft</button>
            <button className="assess-btn-secondary" onClick={bulkDelete} disabled={loading} title="Delete selected">Delete</button>
            <button className="assess-btn-secondary" onClick={clearSelection}>Clear</button>
          </div>
        </div>
      )} */}

      {/* Assessment Table */}
      <div className="assess-table-section">
        <div className="assess-table-container">
          {assessments.length === 0 ? (
            <div className="assess-empty-state">
                          <div className="assess-empty-icon" style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                            <FileText size={48} />
                          </div>
                          <h3>No surveys found</h3>
                          <p>Get started by creating your first survey</p>
                          <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                            <button className="assess-btn-primary" onClick={handleAddAssessment} >
                            <Plus size={16} />
                            Create Survey
                          </button>
                          </div>
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

               {filteredAssessments.map(assessment => (
                    <tr key={assessment.uuid || assessment._id || assessment.id} className="assess-table-row">
                      <td>
                        {(() => {
                          const rowId = assessment.uuid || assessment._id || assessment.id; const checked = selectedIds.includes(rowId); return (
                            <input type="checkbox" checked={checked} onChange={() => toggleSelectOne(rowId)} aria-label="Select row" />
                          );
                        })()}
                      </td>
                      <td>
                        <div className="assess-cell-content">
                          <div className="assess-title-container">
                            <h4 className="assess-title">{assessment.title}</h4>
                            <p className="assess-description">{assessment.description || "No description provided"}</p>
                            {Array.isArray(assessment.tags) && assessment.tags.length > 0 && (
                              <div className="assess-tags">
                                {assessment.tags.slice(0,4).map((t, idx) => (
                                  <span key={`${assessment.id}-tag-${idx}`} className="assess-classification">{t}</span>
                                ))}
                                {assessment.tags.length > 4 && (
                                  <span className="assess-classification">+ {assessment.tags.length - 4}</span>
                                )}
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
        setFormElements={setFormElements}
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

      />}
    </div>
  );
};
export default AdminSurveys;