import React, { useEffect, useState,useRef } from 'react';
import { Search, Plus, Edit3, Trash2, FileText, Calendar, Users, Filter, ChevronDown} from 'lucide-react';
import { RiDeleteBinFill } from 'react-icons/ri';
import { GoX } from 'react-icons/go';
import './GlobalAssessments.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalAssessments, createGlobalAssessment, updateGlobalAssessment, deleteGlobalAssessment, getGlobalAssessmentById, uploadAssessmentFile } from '../../../store/slices/globalAssessmentSlice'; 
import { fetchGroups } from '../../../store/slices/groupSlice'; 
// import api from '../../../services/api';
import QuestionsForm from './QuestionsForm';
import LoadingScreen from '../../../components/common/Loading/Loading';
import api from '../../../services/apiOld';
const GlobalAssessments = () => {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
 const [groups,setGroups] = useState([])
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
    status: '',
    duration: '',            // NEW
    tags: [],                // NEW
    team: '',  
    subteam:'', 
    Level: '',
    noOfQuestions: 0,          // NEW    
    attempts: 1,             // NEW
    unlimited_attempts: false,
    percentage_to_pass: 0,   // NEW
    instructions: '',
    display_answers: 'AfterAssessment',
    // Newly added fields for assessments
    credits: 0,
    stars: 0,
    badges: 0,
    category: '',
    feedbackEnabled: false,
   
    // Shuffle controls
    shuffle_questions: false,
    shuffle_options: false,
    // Assessment thumbnail (UI preview + server URL)
    thumbnail: '',
    // thumbnail_file: null,
  });
  const [questions, setQuestions] = useState([{
    type: '',
    question_text: '',
    options: ['', ''],
    correct_option: '',
    file_url: '',
   
  }]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
//filters
const [showFilters, setShowFilters] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  
  const [tempFilters, setTempFilters] = useState({
    status: '',
    search: ''
  });
  const filterButtonRef = useRef(null);
  const bulkButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const bulkPanelRef = useRef(null);
  const [filterPanelStyle, setFilterPanelStyle] = useState({ top: 0, left: 0 });
  const [bulkPanelStyle, setBulkPanelStyle] = useState({ top: 0, left: 0 });
  
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
    const fetchGroups = async () => {
      try {
        const response = await api.get('/api/globalAdmin/getGroups');
        setGroups(response.data.data)
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups(); // fetch teams/subteams
  }, []);

  // const { groups } = useSelector(state => state.groups); 
  // console.log("groups in assessments: ",groups)
  const handleAddAssessment = () => {
    setCurrentAssessment(null);
    setFormData({
      title: '',
      description: '',
      status: 'Saved',
      duration: '',            // NEW
      tags: [],                // NEW
      team: '', 
      Level: '',
      noOfQuestions: 0,                 // NEW
      subteam: '',            // NEW
      attempts: 1,             // NEW
      unlimited_attempts: false,
      percentage_to_pass: 0,   // NEW
      instructions: '',
      
      display_answers: 'AfterAssessment',
      // Newly added fields
      credits: 0,
      stars: 0,
      badges: 0,
      category: '',
      feedbackEnabled: false,
      
      // Shuffle controls
      shuffle_questions: false,
      shuffle_options: false,
      // Thumbnail reset
      thumbnail: '',
      // thumbnail_file: null,
    });
    setQuestions([{
      type: '',
      question_text: '',
      options: ['', ''],
      correct_option: '',
      file_url: '',
    }]);
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

  // Filter handlers
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setTempFilters(prev => ({
        ...prev,
        [name]: value
      }));
    };
    
    // Update search term when filters change
    useEffect(() => {
      if (filters.search !== searchTerm) {
        setSearchTerm(filters.search || '');
      }
    }, [filters.search]);

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
    
    const handleFilter = () => {
      setFilters({
        ...tempFilters,
        search: searchTerm
      });
      setShowFilters(false);
    };
  
    const resetFilters = () => {
      const resetFilters = {
        status: '',
        search: ''
      };
      setTempFilters(resetFilters);
      setFilters(resetFilters);
      setSearchTerm('');
    };
  
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
  const handleBulkDelete = bulkDelete;

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
        status: full.status || 'Saved',
        duration: full.duration || '',
        tags: full.tags || [],
        team: full.team || '',
        subteam: full.subteam || '',
        Level: full.Level || '',
        noOfQuestions: full.noOfQuestions || 0,
        attempts: full.attempts ?? 1,
        unlimited_attempts: !!full.unlimited_attempts,
        percentage_to_pass: full.percentage_to_pass ?? 0,
        instructions:full.instructions,
        display_answers:
          full.display_answers || 'AfterAssessment',
        // Newly added fields
        credits: Number.isFinite(full.credits) ? full.credits : 0,
        stars: Number.isFinite(full.stars) ? full.stars : 0,
        badges: Number.isFinite(full.badges) ? full.badges : 0,
        category: full.category || '',
        feedbackEnabled: !!full.feedbackEnabled,
       
        // Shuffle controls
        shuffle_questions: !!full.shuffle_questions,
        shuffle_options: !!full.shuffle_options,
        // Thumbnail (prefer explicit thumbnail_url, fallback to thumbnail)
        thumbnail: full.thumbnail || '',
        // thumbnail_file: null,
      });

      // Prefer sections->questions if present; fallback to legacy top-level questions
      if (Array.isArray(full.sections) && full.sections.length > 0) {
        const flatQs = [];
        let countSoFar = 0;
        full.sections.forEach((sec, sIdx) => {
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
             
             
              total_points: Number.isFinite(q.total_points) ? q.total_points : 1,
            });
          });
          countSoFar += qs.length;
        });
        setQuestions(flatQs.length ? flatQs : [{ type: '', question_text: '', options: [''], correct_option: '', file_url: '' }]);
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
            }))
          : [];
        setQuestions(mappedQuestions.length
          ? mappedQuestions
          : [{ type: '', question_text: '', options: [''], correct_option: '', file_url: ''}]);
      }
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
        Level: assessment.Level || '',
        noOfQuestions: assessment.noOfQuestions || 0,
        attempts: assessment.attempts ?? 1,
        unlimited_attempts: !!assessment.unlimited_attempts,
        percentage_to_pass: assessment.percentage_to_pass ?? 0,
        instructions:assessment.instructions,
        display_answers:
          assessment.display_answers || 'AfterAssessment',
        // Newly added fields
        credits: Number.isFinite(assessment.credits) ? assessment.credits : 0,
        stars: Number.isFinite(assessment.stars) ? assessment.stars : 0,
        badges: Number.isFinite(assessment.badges) ? assessment.badges : 0,
        category: assessment.category || '',
        feedbackEnabled: !!assessment.feedbackEnabled,
     
        // Shuffle controls
        shuffle_questions: !!assessment.shuffle_questions,
        shuffle_options: !!assessment.shuffle_options,
        // Thumbnail (fallback)
        thumbnail: assessment.thumbnail_url || assessment.thumbnail || '',
        thumbnail_file: null,
      });
      setQuestions([{ type: '', question_text: '', options: ['', ''], correct_option: '', file_url: '' }]);
      setShowForm(true);
    }
  };

  const handleSaveAssessment = async (e, statusOverride) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Normalize duration to a plain number of minutes
    const toMinutesNumber = (d) => {
      if (d === undefined || d === null || d === '') return 0;
      if (typeof d === 'number') return Math.max(0, d);
      const s = String(d).trim();
      // Handle values like "120 mins"
      const match = s.match(/^(\d+)\s*min/i);
      if (match) return Math.max(0, parseInt(match[1], 10) || 0);
      // Fallback: try plain integer string
      const n = parseInt(s, 10);
      return Number.isNaN(n) ? 0 : Math.max(0, n);
    };

    // Resolve thumbnail URL to send (upload if local file)
    let resolvedThumbUrl = formData.thumbnail || '';
    try {
      if (formData.thumbnail && typeof formData.thumbnail === 'string' && formData.thumbnail.startsWith('blob:')) {
        const uploaded = await dispatch(uploadAssessmentFile(formData.thumbnail_file)).unwrap();
        if (uploaded) {
          resolvedThumbUrl = uploaded;
        }
      }
    } catch (thumbErr) {
      console.error('Thumbnail upload failed', thumbErr?.response?.data || thumbErr.message);
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions || '',
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      duration: toMinutesNumber(formData.duration),
      team: formData.team,
      subteam: formData.subteam,
      Level: formData.Level || '',
      noOfQuestions: formData.noOfQuestions || 0,
      attempts: formData.attempts,
      unlimited_attempts: Boolean(formData.unlimited_attempts),
      percentage_to_pass: formData.percentage_to_pass,
      display_answers: formData.display_answers ,
      status: statusOverride ?? (formData.status || 'Saved'),
      created_by: authUser?._id || authUser?.uuid || authUser?.id,
      // Newly added fields
      credits: Number.isFinite(formData.credits) ? formData.credits : 0,
      stars: Number.isFinite(formData.stars) ? formData.stars : 0,
      badges: Number.isFinite(formData.badges) ? formData.badges : 0,
      category: formData.category || '',
      feedbackEnabled: Boolean(formData.feedbackEnabled),
    
      // Shuffle controls
      shuffle_questions: Boolean(formData.shuffle_questions),
      shuffle_options: Boolean(formData.shuffle_options),
      // Thumbnail URL (server path)
      thumbnail: resolvedThumbUrl || '',
      // Flat questions payload (sections removed)
      questions: questions.map(q => {
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
          file_url: q.file_url ,
          total_points: Number.isFinite(q.total_points) ? q.total_points : 1,
        };
      })
    };

    try {
      console.log("payload",payload)
      await dispatch(createGlobalAssessment(payload)).unwrap();
      setShowForm(false);
      dispatch(fetchGlobalAssessments({ page, limit }));
    } catch (err) {
      console.error('Failed to create assessment:', err?.response?.data || err.message);
    }
  };

  const handleUpdateAssessment = async (statusOverride) => {
      // Build data for update (questions are not updated by edit endpoint)
      // Resolve thumbnail URL (upload if local file)
      let resolvedThumbUrl = formData.thumbnail_url || '';
      try {
        if (formData.thumbnail_file && typeof formData.thumbnail_url === 'string' && formData.thumbnail_url.startsWith('blob:')) {
          const uploaded = await dispatch(uploadAssessmentFile(formData.thumbnail_file)).unwrap();
          if (uploaded) {
            resolvedThumbUrl = uploaded;
          }
        }
      } catch (thumbErr) {
        console.error('Thumbnail upload failed', thumbErr?.response?.data || thumbErr.message);
      }

      const data = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions || '',
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        duration: formData.duration,
        team: formData.team,
        subteam: formData.subteam,
        Level: formData.Level || '',
        noOfQuestions: formData.noOfQuestions || 0,
        attempts: formData.attempts,
        unlimited_attempts: Boolean(formData.unlimited_attempts),
        percentage_to_pass: formData.percentage_to_pass,

        display_answers: formData.display_answers ,
        // Newly added fields
        credits: Number.isFinite(formData.credits) ? formData.credits : 0,
        stars: Number.isFinite(formData.stars) ? formData.stars : 0,
        badges: Number.isFinite(formData.badges) ? formData.badges : 0,
        category: formData.category || '',
        feedbackEnabled: Boolean(formData.feedbackEnabled),

        // Shuffle controls
        shuffle_questions: Boolean(formData.shuffle_questions),
        shuffle_options: Boolean(formData.shuffle_options),
        // Thumbnail URL (server path)
        thumbnail: resolvedThumbUrl || '',
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

          };
        })
      };

      // Prevent status changes for published assessments
      if (currentAssessment && currentAssessment.status === 'Published') {
        // Remove status from the update payload to prevent changes
        // The status field should not be included in the update data for published assessments
      } else {
        // For non-published assessments, include status in the update
        data.status = statusOverride ?? formData.status;
      }

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
       
      };
      const idx = Math.max(0, Math.min((afterIndex ?? prev.length - 1) + 1, prev.length));
      return [
        ...prev.slice(0, idx),
        q,
        ...prev.slice(idx)
      ];
    });
  };
  const handleAddFile = async (qIndex, e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    try {
      const url = await dispatch(uploadAssessmentFile(file)).unwrap();
      if (url) {
        // Set the uploaded file URL on the specific question
        setQuestions(prev => {
          const arr = Array.isArray(prev) ? [...prev] : [];
          if (arr[qIndex]) {
            arr[qIndex] = { ...arr[qIndex], file_url: url };
          }
          return arr;
        });
        // Keep a flat list of uploaded file URLs for selection dropdown
        setUploadedFiles(prev => {
          const next = Array.isArray(prev) ? [...prev, url] : [url];
          // de-dupe
          return Array.from(new Set(next));
        });
      }
    } catch (err) {
      console.error('File upload failed:', err?.response?.data || err.message);
    }
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    // Limit to maximum 5 options
    if (updated[qIndex].options.length < 5) {
      updated[qIndex] = {
        ...updated[qIndex],
        options: [...updated[qIndex].options, '']
      };
      setQuestions(updated);
    }
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex] = {
      ...updated[qIndex],
      options: [...updated[qIndex].options]
    };
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    // Keep minimum 2 options
    if (updated[qIndex].options.length > 2) {
      updated[qIndex] = {
        ...updated[qIndex],
        options: updated[qIndex].options.filter((_, i) => i !== optIndex)
      };
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
       
      };
      return [
        ...arr.slice(0, index + 1),
        dup,
        ...arr.slice(index + 1)
      ];
    });
  };

  const handleDeleteAssessment = async (id) => {
    try {
      await dispatch(deleteGlobalAssessment(id)).unwrap();
      dispatch(fetchGlobalAssessments({ page, limit }));
    } catch (err) {
      console.error('Failed to delete assessment:', err?.response?.data || err.message);
    }
  };

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
      {/* <div className="assess-toolbar">
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
      </div> */}

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
      
      <div className="controls">
        <div className="roles-search-bar">
          <Search size={16} color="#6b7280" className="search-icon" />
            <input
              type="text"
              name="search"
              placeholder="Search Assessments"
              className="search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setFilters(prev => ({
                  ...prev,
                  search: e.target.value,
                  status: prev.status
                }));
              }}
            />
        </div>

        <div className="controls-right">
          {/* <button className="control-btn" onClick={() => setShowFilters((prev) => !prev)}> */}
          <button
            ref={filterButtonRef}
            className="control-btn"
            onClick={() => {
              setShowFilters(prev => {
                const next = !prev;
                if (next) {
                  setShowBulkAction(false);
                  updateFilterPanelPosition();
                }
                return next;
              });
            }}
          >
            <Filter size={16} />
            Filter
          </button>
          {/* <button className="control-btn" onClick={() => setShowBulkAction((prev) => !prev)}> */}
          <button
            ref={bulkButtonRef}
            className="control-btn"
            onClick={() => {
              setShowBulkAction(prev => {
                const next = !prev;
                if (next) {
                  setShowFilters(false);
                  updateBulkPanelPosition();
                }
                return next;
              });
            }}
          >
            Bulk Action <ChevronDown size={16} />
          </button>
          <button className="assess-btn-primary" onClick={handleAddAssessment}>
            <Plus size={16} />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>
       {showFilters && (
              // <div className="globalassessment-filter-panel">
              <div
                ref={filterPanelRef}
                className="globalassessment-filter-panel"
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
              // <div className="globalassessment-bulk-action-panel">
              <div
                ref={bulkPanelRef}
                className="globalassessment-bulk-action-panel"
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
              <button className="assess-btn-primary" style={{marginLeft:"36%"}} onClick={handleAddAssessment} >
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
                  // .filter(a => a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  //              a.description?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .filter(assessment => {
                    // Apply search filter
                    const matchesSearch = !filters.search || 
                      assessment.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                      assessment.description?.toLowerCase().includes(filters.search.toLowerCase());
                    
                    // Apply status filter
                    const matchesStatus = !filters.status || 
                      assessment.status?.toLowerCase() === filters.status.toLowerCase();
                    
                    return matchesSearch && matchesStatus;
                  })
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
                        {(() => {
                          const qCount = Array.isArray(assessment?.questions)
                            ? assessment.questions.length
                            : Array.isArray(assessment?.sections)
                              ? assessment.sections.reduce((total, section) => total + (Array.isArray(section?.questions) ? section.questions.length : 0), 0)
                              : 0;
                          return (
                            <>
                              <span className="assess-question-count">{qCount}</span>
                              <span className="assess-question-label">{qCount === 1 ? 'Question' : 'Questions'}</span>
                            </>
                          );
                        })()}
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
          handleAddFile={handleAddFile}
          duplicateQuestion={duplicateQuestion}
          groups={groups}
          setQuestions={setQuestions}
        />
      )}
    </div>
  );
}

export default GlobalAssessments;