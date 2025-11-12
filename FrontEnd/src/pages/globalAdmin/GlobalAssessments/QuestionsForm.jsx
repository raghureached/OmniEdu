import React, { useEffect, useRef, useState } from 'react';
import { FileText, Plus, X, Upload, Copy, Eye, ChevronRight, ChevronLeft, Info, Trash2 } from 'lucide-react';
import api from '../../../services/api.js';
import './QuestionsForm.css';
import '../GlobalSurveys/QuestionsForm-survey.css';
import RichText from './RichTextSurvey.jsx';
import FilePreviewModal from '../../../components/common/FilePreviewModal/FilePreviewModal.jsx';
import CustomLoader2 from '../../../components/common/Loading/CustomLoader2';
import AssessmentPreview from '../../../components/common/Preview/AssessmentPreview.jsx';
import CsvUpload from '../GlobalAssessments/CsvUpload.jsx';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from "react-toastify";
import { CheckCircle, AlertTriangle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
const QuestionsForm = ({
    currentAssessment,
    formData,
    setFormData,
    questions,
    showForm,
    setShowForm,
    uploadedFiles,
    handleSaveAssessment,
    handleEditAssessment,
    handleUpdateAssessment,
    handleDeleteAssessment,
    updateQuestionField,
    addQuestion,
    addQuestionAfter,
    removeQuestion,
    handleAddFile,
    addOption,
    updateOption,
    removeOption,
    duplicateQuestion,
    groups = [],
    setQuestions
}) => {
    // console.log(formData)
    const { fileupload } = useSelector((state) => state.globalAssessments);
    const [step, setStep] = useState(1);
    const [aiProcessing, setAiProcessing] = useState(false);
    const [creating, setCreating] = useState(false)
    const [aiHelpOpen, setAiHelpOpen] = useState(false);
    const [passError, setPassError] = useState('');
    const [noOfQuestions, setNoOfQuestions] = useState(
            formData?.noOfQuestions === 0 || formData?.noOfQuestions === '0'
                ? ''
                : formData?.noOfQuestions ?? ''
        );
        const [Level, setLevel] = useState(formData?.Level ?? '');
        const [tagInput, setTagInput] = useState('');
        useEffect(() => {
            const value = formData?.noOfQuestions;
            setNoOfQuestions(value === 0 || value === '0' || value === null || value === undefined ? '' : value);
        }, [formData?.noOfQuestions]);
    
        useEffect(() => {
            setLevel(formData?.Level ?? '');
        }, [formData?.Level]);
    
  
    // Local UI state to toggle optional instructions per question index
    const [instructionsOpen, setInstructionsOpen] = useState({});
    const [questionFilePreview, setQuestionFilePreview] = useState({ open: false, url: null, name: '', type: '', index: null });

    const [filePreview, setFilePreview] = useState({ open: false, url: null, name: '', type: '', isBlob: false });

    // Local UI state for question preview modal; holds the qIndex or null
    const [questionPreviewIndex, setQuestionPreviewIndex] = useState(null);
    // Whole-assessment preview modal
    const [assessmentPreviewOpen, setAssessmentPreviewOpen] = useState(false);
    const [previewResponses, setPreviewResponses] = useState({});


    // Cache shuffled option orders by a stable key so options don't reshuffle on each selection
    const previewShuffleRef = useRef({});
    // Sections removed: assessments are now flat (questions only)

    // Section helpers and actions removed

    // Categories for Category select. Replace with API/Redux source if available.
    const categories = useRef(['General', 'Quiz', 'Exam', 'Practice']).current;

    // Derive sub-teams for the selected team
    const selectedTeam = groups.find(t => String(t._id) === String(formData.team));
    const subTeams = selectedTeam?.subTeams || [];
    const [Viacsv, setViacsv] = useState(false)
    // Duration will be stored as a plain number of minutes (integer)

    //ai related 
        const [errorsDisplay, setErrorsDisplay] = useState({ title: '', description: '' });
        const isAIDisabled = !formData.title?.trim() ||
            !formData.description?.trim();
    
            const enhanceTexthelper = async (title, description) => {
                try {
                    setAiProcessing(true);
                    const response = await api.post('/api/globalAdmin/enhanceAssessment', { title, description });
                    setFormData({ ...formData, title: response.data.data.title, description: response.data.data.description, tags: response.data.data.tags });
                    toast.success('Tags generated from AI');
                    return true; // indicate success so caller can proceed to question generation
                } catch (error) {
                    console.error('Error enhancing text:', error);
                    toast.error('Failed to generate tags');
                    return false; // indicate failure so caller can stop
                } finally {
                    setAiProcessing(false);
                }
            };
    // Ensure preview uses absolute URL when backend returns relative path like /uploads/xyz
    const resolveUrl = (u) => {
        if (!u) return u;
        // Keep local object URLs and data URLs untouched
        if (typeof u === 'string' && (u.startsWith('blob:') || u.startsWith('data:'))) {
            return u;
        }
        const base = api?.defaults?.baseURL;
        // Determine the backend origin from api baseURL or window origin
        let backendOrigin = '';
        if (base && /^https?:\/\//i.test(base)) {
            try {
                const b = new URL(base);
                backendOrigin = `${b.protocol}//${b.host}`;
            } catch {
                backendOrigin = base.replace(/\/+$/, '');
            }
        } else {
            backendOrigin = window.location.origin;
        }

        // If URL is absolute
        if (/^https?:\/\//i.test(u)) {
            // Keep third-party URLs (e.g., Cloudinary) intact
            try {
                const abs = new URL(u);
                const backend = new URL(backendOrigin);
                // If this absolute URL appears to be from our backend (by pathname like /uploads)
                if (abs.pathname.startsWith('/uploads')) {
                    // Rebuild using backend origin to avoid mixed-content or wrong host
                    return `${backend.protocol}//${backend.host}${abs.pathname}${abs.search || ''}`;
                }
                return u;
            } catch {
                return u;
            }
        }

        // Otherwise treat as relative path and prefix backend origin
        const path = u.startsWith('/') ? u : `/${u}`;
        return `${backendOrigin}${path}`;
    };

    // Helper function to convert number to letter (0 -> A, 1 -> B, etc.)
    const getLetterFromIndex = (index) => {
        return String.fromCharCode(65 + index); // 65 is ASCII code for 'A'
    };
    //added for thumbnail preview

    const getFileType = (file, url) => {
        if (file && typeof file !== 'string' && file.type) return file.type;
        const href = typeof file === 'string' ? file : url || '';
        const lower = href?.toLowerCase?.() || '';
        if (lower.endsWith('.pdf')) return 'application/pdf';
        if (/(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(lower)) return 'image/*';
        if (/(mp4|webm|ogg)$/i.test(lower)) return 'video/*';
        if (/(mp3|wav|aac|m4a|ogg)$/i.test(lower)) return 'audio/*';
        return 'application/octet-stream';
    };

    const handlePreviewFile = (file, previewUrl) => {
        if (!file) return;
        const isString = typeof file === 'string';
        let url = '';
        let isBlob = false;

        if (isString) {
            url = resolveUrl(file);
        } else if (previewUrl) {
            url = previewUrl;
        } else {
            url = URL.createObjectURL(file);
            isBlob = true;
        }

        const name = isString
            ? (file.split('/').pop() || 'Preview')
            : (file.name || 'Preview');

        const type = getFileType(file, url);

        setFilePreview({ open: true, url, name, type, isBlob });
    };

    const closeFilePreview = () => {
        setFilePreview((prev) => {
            if (prev.isBlob && prev.url) {
                try { URL.revokeObjectURL(prev.url); } catch (_) { }
            }
            return { open: false, url: null, name: '', type: '', isBlob: false };
        });
    };

    const handlePreviewQuestionFile = (q, index) => {
        if (!q?.file_url) return;
        const resolvedUrl = resolveUrl(q.file_url);
        const fileName = q.file_url.split('/').pop() || 'Preview';
        const type = getFileType(q.file_url, resolvedUrl);

        setQuestionFilePreview(prev => {
            const isSame = prev.open && prev.index === index;
            if (isSame) {
                return { open: false, url: null, name: '', type: '', index: null };
            }
            return { open: true, url: resolvedUrl, name: fileName, type, index };
        });
    };

    const closeQuestionFilePreview = () => {
        setQuestionFilePreview({ open: false, url: null, name: '', type: '', index: null });
    };

    const validatePass = () => {
        const v = formData.percentage_to_pass;
        const isValid = v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 100);
        setPassError(isValid ? '' : 'Pass percentage must be an integer between 0 and 100');
        return isValid;
    };
    // Step validation functions
    const validateStep1 = () => {
        return formData.title.trim() !== '' &&
            formData.description.trim() !== '' &&
            Array.isArray(formData.tags) && formData.tags.length > 0 &&
            formData.thumbnail &&
            formData.instructions && formData.instructions.trim() !== '';
    };

    const validateStep2 = () => {
        if (!Array.isArray(questions) || questions.length === 0) {
            return false;
        }
        // Check each question is properly filled
        for (const question of questions) {
            // Question must have type, text, and at least 2 options
            if (!question.type || !question.question_text?.trim() ||
                !Array.isArray(question.options) || question.options.filter(o => o?.trim()).length < 2) {
                return false;
            }
            // For Multiple Choice and Multi Select questions, must have correct answer
            if (question.type === 'Multiple Choice' || question.type === 'Multi Select') {
                if (question.correct_option === undefined || question.correct_option === null || question.correct_option === '') {
                    return false;
                }
            }
        }
        return true;
    };

    const validateStep3 = () => {
        return formData.team !== '' &&
            formData.subteam !== '' &&
            formData.duration > 0 &&
            formData.attempts > 0 &&
            formData.percentage_to_pass !== '' &&
            formData.display_answers !== '' &&
            formData.category !== '' &&
            !passError;
    };

    const canProceedToNext = () => {
        switch (step) {
            case 1: return validateStep1();
            case 2: return validateStep2();
            case 3: return validateStep3();
            default: return false;
        }
    };

    const handleNext = () => {
        if (canProceedToNext() && step < 3) {
            setStep(step + 1);
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const createAIQuestions = async (title, description, noOfQuestions, Level) => {
           try {
               setCreating(true);
               if (!noOfQuestions) {
                   toast.error(
                       <div style={{ display: "flex", alignItems: "center" }}>
                           <div style={{ marginLeft: 10 }}>
                               <strong>Enter the Number of Questions</strong>
                           </div>
                       </div>
                   );
                   setCreating(false)
                   return;
               }
               if (!Level) {
                   toast.error(
                       <div style={{ display: "flex", alignItems: "center" }}>
                           <div style={{ marginLeft: 10 }}>
                               <strong>Enter the  Level of Questions</strong>
                           </div>
                       </div>
                   );
                   setCreating(false);
                   return;
               }
   
               const resp = await api.post('/api/globalAdmin/createQuestions', { title, description, noOfQuestions, Level });
               const aiQs = resp?.data?.data?.questions;
   
               // Validate
               if (!Array.isArray(aiQs) || aiQs.length === 0) {
                 
                   toast.error(
                       <div style={{ display: "flex", alignItems: "center" }}>
                          
                           <div style={{ marginLeft: 10 }}>
                               <strong>AI did not return a valid questions array. Please try again.</strong>
                            
                           </div>
                       </div>
                   );
                   setCreating(false);
                   return;
               }
   
               // Normalize fields to what the UI expects
               const normalized = aiQs.map((q) => ({
                   type: q?.type || 'Multiple Choice',
                   question_text: q?.question_text || '',
                   options: Array.isArray(q?.options) && q.options.length ? q.options : ['', ''],
                   correct_option: Array.isArray(q?.correct_option)
                       ? q.correct_option.filter((n) => Number.isInteger(n))
                       : (Number.isInteger(q?.correct_option) ? [q.correct_option] : []),
                   file_url: typeof q?.file_url === 'string' ? q.file_url : '',
   
                   total_points: Number.isFinite(q?.total_points) ? q.total_points : 1,
   
               }));
   
               // Update both parent state (source of truth) and formData
               setQuestions(normalized);
               setFormData((prev) => ({ ...prev, questions: normalized }));
                toast.success(
                                   <div style={{ display: "flex", alignItems: "center" }}>
                                     
                                       <div style={{ marginLeft: 10 }}>
                                           <strong>Survey questions generated successfully</strong>
                                           <div style={{ fontSize: 13, opacity: 0.8 }}>
                                               You can review and edit them in Step 2
                                           </div>
                                       </div>
                                   </div>)
           } catch (error) {
               console.log(error);
               toast.error(
                   <div style={{ display: "flex", alignItems: "center" }}>
                      
                       <div style={{ marginLeft: 10 }}>
                           <strong>Failed to generate questions. Please try again.</strong>
                       </div>
                   </div>
               );
   
           } finally {
               setCreating(false);
           }
       };
    const handleCloseForm = () => {
        setShowForm(false);
        // Reset questions in parent so the next open starts clean
        setQuestions([{
            type: '',
            question_text: '',
            options: ['', ''],
            correct_option: '',
            instructions: ''
        }]);

        // Reset formData fields
        setFormData({
            title: '',
            description: '',
            tags: [],
            questions: [],
            team: '',
            duration: 0,
            passPercentage: '',
            isPublished: false,
            isRecurring: false,
            assignDate: '',
            dueDate: '',
            notifyUsers: false,
            orgIds: []
        });
    };
    const handleCsvQuestionsUpload = (csvQuestions) => {
        // Debug: Log the incoming CSV questions to see if type is present
        console.log('CSV Questions received:', csvQuestions);
        setViacsv(true)
        // Normalize CSV questions to match the expected format
        const normalizedQuestions = csvQuestions.map(q => {
            // Filter out empty options and create a clean options array
            const filteredOptions = Array.isArray(q.options)
                ? q.options.filter(opt => opt && opt.trim() !== '')
                : [];

            // Ensure at least 2 options for choice questions
            while (filteredOptions.length < 2) {
                filteredOptions.push('');
            }

            // Adjust correct_option indices to match the filtered options array
            let adjustedCorrectOption = q.correct_option;
            if (q.correct_option !== undefined && q.correct_option !== null && q.correct_option !== '') {
                if (Array.isArray(q.correct_option)) {
                    // For Multi Select - adjust each index in the array
                    adjustedCorrectOption = q.correct_option
                        .map(originalIndex => {
                            // Find the actual position in the filtered array
                            const optionValue = q.options[originalIndex];
                            const newIndex = filteredOptions.findIndex(opt => opt === optionValue);
                            return newIndex !== -1 ? newIndex : -1;
                        })
                        .filter(index => index !== -1);
                } else if (typeof q.correct_option === 'number') {
                    // For Multiple Choice - adjust single index
                    const optionValue = q.options[q.correct_option];
                    const newIndex = filteredOptions.findIndex(opt => opt === optionValue);
                    adjustedCorrectOption = newIndex !== -1 ? newIndex : '';
                }
            }

            return {
                type: q.type || 'Multiple Choice',
                question_text: q.question_text || '',
                options: filteredOptions,
                correct_option: adjustedCorrectOption,
                total_points: 1,
            };
        });

        // Debug: Log the normalized questions
        console.log('Normalized questions:', normalizedQuestions);

        // Update both parent state (source of truth) and formData
        setQuestions(normalizedQuestions);
        setFormData((prev) => {
            console.log('Updating formData with questions:', normalizedQuestions);
            const newFormData = { ...prev, questions: normalizedQuestions };
            console.log('New formData:', newFormData);
            return newFormData;
        });

        // Force a re-render by updating a state that triggers re-render
        setTimeout(() => {
            console.log('Current questions state after upload:', questions);
        }, 100);
    };
    React.useEffect(() => {
        if (assessmentPreviewOpen) {
            setPreviewResponses({});
        }
    }, [assessmentPreviewOpen]);

    // Close modals on ESC key
    React.useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                if (assessmentPreviewOpen) {
                    setAssessmentPreviewOpen(false);
                } else if (questionPreviewIndex !== null) {
                    setQuestionPreviewIndex(null);
                }
            }
        };
        const anyOpen = assessmentPreviewOpen || questionPreviewIndex !== null;
        if (anyOpen) {
            document.addEventListener('keydown', handleKey);
            return () => document.removeEventListener('keydown', handleKey);
        }
    }, [assessmentPreviewOpen, questionPreviewIndex]);



    return (
        <>
            <div className="addOrg-modal-overlay">
                <div className="addOrg-modal-content">
                    {/* Modal Header */}
                    <div className="assess-modal-header">
                        <div className="assess-modal-header-content">
                            <div className="assess-modal-icon">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2>{currentAssessment ? "Edit Assessment" : "Create New Assessment"}</h2>
                                <p className="assess-modal-subtitle">
                                    {currentAssessment ? (
                                        step === 1 ? "Step 1 of 3: Basic Information" :
                                            step === 2 ? "Step 2 of 3: Files and Resources" :
                                                "Step 3 of 3: Configurations & Metadata"
                                    ) : (
                                        step === 1 ? "Step 1 of 3: Basic Information" :
                                            step === 2 ? "Step 2 of 3: Questions and Resources" :
                                                "Step 3 of 3: Configurations & Metadata"
                                    )}
                                </p>
                            </div>
                        </div>
                        <button className="assess-close-btn" onClick={() => handleCloseForm()}>
                            <X size={20} />
                        </button>
                        {/* Bottom-of-header progress bar (matches location in screenshot) */}
                        <div className="assess-header-progress bottom">
                            <div
                                className="bar"
                                style={{ width: `${Math.min(100, Math.max(0, (step / 3) * 100))}%` }}
                            />
                        </div>
                    </div>

                    {/* Form + Preview Panel */}
                    <div className="assess-modal-form-container">
                        {/* Left Side - Form */}
                        <div className="assess-modal-form">
                            {/* Basic Information */}
                            {step === 1 &&
                                <div className="module-overlay__step">
                                    {/* <h3 className="assess-section-title">Basic Information</h3> */}

                                    <div className="module-overlay__form-group" style={{ marginBottom: '20px' }}>
                                        <label className="module-overlay__form-label">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Assessment Title <span className="module-overlay__required">*</span>
                                                {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            className="assess-form-input"
                                            placeholder="Enter assessment title"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            autoComplete="off"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="module-overlay__form-group" >
                                        <label className="module-overlay__form-label">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Assessment Description<span className="module-overlay__required">*</span>
                                                {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}
                                            </span>
                                        </label>
                                        <textarea
                                            name="description"
                                            className="survey-assess-form-textarea"
                                            placeholder="Provide a detailed description of this assessment"
                                            rows={3}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="module-overlay__form-group">
                                        <label className="module-overlay__form-label">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Tags<span className='module-overlay__required'>*</span>
                                                {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}
                                            </span>
                                        </label>
                                        <div className="assess-tag-picker">
                                            <div className="assess-tag-controls">
                                                <input
                                                    type="text"
                                                    className="addOrg-form-input"
                                                    placeholder="Type a tag and press Enter or comma"
                                                    style={{ width: '100%' }}
                                                    value={tagInput}
                                                    autoComplete="off"
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ',') {
                                                            e.preventDefault();
                                                            const t = tagInput.trim();
                                                            if (!t) return;
                                                            const current = Array.isArray(formData.tags) ? formData.tags : [];
                                                            if (!current.includes(t)) {
                                                                setFormData({ ...formData, tags: [...current, t] });
                                                            }
                                                            setTagInput('');
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {(formData.tags && formData.tags.length > 0) && (
                                                <div className="module-overlay__tags-container">
                                                    {formData.tags.map((t, idx) => (
                                                        <span key={`${t}-${idx}`} className="module-overlay__tag">
                                                            {t}
                                                            <button
                                                                type="button"
                                                                className="module-overlay__tag-remove"
                                                                aria-label={`Remove tag ${t}`}
                                                                onClick={() => {
                                                                    const next = (formData.tags || []).filter(x => x !== t);
                                                                    setFormData({ ...formData, tags: next });
                                                                }}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                                        <div style={{ width: "50%" }} >
                                            <label className='assess-form-label' style={{ margin: "10px" }}>Number of Questions</label>
                                            <input type="number" name="noOfQuestions" placeholder="Enter the Number of Questions" value={noOfQuestions} className='assess-form-input'

                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setNoOfQuestions(value);
                                                    setFormData({ ...formData, noOfQuestions: value });
                                                }} />
                                        </div>
                                        <div style={{ width: "50%" }}>
                                            <label className='assess-form-label' style={{ margin: "10px" }}>Level</label>
                                            <select
                                                type="text"
                                                name="Level"
                                                value={Level}
                                                className='assess-form-input'
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setLevel(value);
                                                    setFormData({ ...formData, Level: value });
                                                }}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>

                                        </div>
                                    </div>
                                    <div style={{  margin: '0 auto 8px', display: 'flex', justifyContent: 'flex-start' }}>
                                        <button
                                            type="button"
                                            className="survey-assess-btn-link"
                                            onClick={() => setAiHelpOpen(prev => !prev)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4f46e5', background: 'transparent' }}
                                            aria-expanded={aiHelpOpen}
                                            aria-controls="ai-help-panel"
                                        >
                                            <Info size={16} /> How create with ai works
                                        </button>
                                    </div>
                                    {aiHelpOpen && (
                                        <div
                                            id="ai-help-panel"
                                            style={{
                                                width: '70%',
                                                margin: '0 auto 12px',
                                                background: '#eef2ff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8,
                                                padding: '10px 12px',
                                                color: '#1f2937',
                                                fontSize: 14
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Create with AI – How it works</div>
                                            <ul style={{ marginLeft: 16, listStyle: 'disc' }}>
                                                <li>Fill <strong>Title</strong> and <strong>Description</strong>. These are required to enable the button.</li>
                                                <li>Set <strong>Number of Questions</strong> and <strong>Level</strong> if you want AI to generate questions. Without them, only tags are generated.</li>
                                                <li>Click <strong>“Create with AI ✨”</strong>. First tags are enhanced, then questions are generated if inputs are provided.</li>
                                                <li>Review and edit generated questions in <strong>Step 2</strong>.</li>
                                            </ul>
                                        </div>
                                    )}
                                    <button
                                        className={`btn-primary ${isAIDisabled ? 'btn-disabled' : ''}`}
                                        style={{
                                            width: "70%",
                                            margin: "auto",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: isAIDisabled ? "not-allowed" : "pointer",
                                            opacity: isAIDisabled ? 0.6 : 1,


                                        }}
                                        onClick={async () => {
                                            if (isAIDisabled) return;
                                            // prevent accidental click

                                            // ✅ continue only if both fields filled
                                            try {
                                                const enhanced = await enhanceTexthelper(formData.title, formData.description);
                                                if (!enhanced) {
                                                    toast.error('Enhancement failed');
                                                    return;
                                                } 
                                                // stop if failed ❗

                                                const q = parseInt(formData.noOfQuestions);
                                                const l = formData.Level;

                                                if (Number.isFinite(q) && q > 0) {
                                                    await createAIQuestions(formData.title, formData.description, q, l);
                                                } else {
                                                    toast.success('Tags generated from AI');
                                                }
                                            } catch (e) {
                                                console.error('AI generation failed', e);
                                                toast.error('Something went wrong during AI generation');
                                            }
                                        }}

                                        disabled={isAIDisabled || aiProcessing}
                                    >
                                        {aiProcessing ? "Please Wait.." : "Create with AI ✨"}
                                    </button>



                                   
                                    <div className='module-overlay__form-group'>
                                    <label className="module-overlay__form-label">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Instructions<span className="module-overlay__required">*</span>
                                            </span>
                                        </label>
                                        <div className="assess-instructions-box">
                                            <RichText value={formData.instructions || ''} name="instructions" onChange={(value) => setFormData({ ...formData, instructions: value })} />
                                        </div>
                                    </div>
                                    <div className='module-overlay__form-group'>
                                        <label className="module-overlay__form-label">Thumbnail</label>
                                        <input
                                            id="assess-thumb-input"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files && e.target.files[0];
                                                if (!file) return;
                                                const preview = URL.createObjectURL(file);
                                                setFormData({ ...formData, thumbnail: file, thumbnail_preview: preview });
                                            }}
                                        />
                                        {formData.thumbnail ? (
                                            <div className="module-overlay__uploaded-file-container">
                                                <span
                                                    className="module-overlay__uploaded-file-name"
                                                    title={typeof formData.thumbnail === 'string'
                                                        ? formData.thumbnail.split('/').pop()
                                                        : formData.thumbnail?.name}
                                                >
                                                    {typeof formData.thumbnail === 'string'
                                                        ? (formData.thumbnail.split('/').pop() || 'thumbnail')
                                                        : (formData.thumbnail?.name || 'thumbnail')}
                                                </span>
                                                <div className="module-overlay__file-actions">
                                                    <button
                                                        type="button"
                                                        className="module-overlay__btn-preview"
                                                        onClick={() => handlePreviewFile(formData.thumbnail, formData.thumbnail_preview)}
                                                        aria-label="Preview thumbnail"
                                                    >
                                                        <Eye size={16} /> Preview
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="module-overlay__btn-delete"
                                                        onClick={() => {
                                                            try {
                                                                if ((formData.thumbnail_preview || '').startsWith('blob:')) {
                                                                    URL.revokeObjectURL(formData.thumbnail_preview);
                                                                }
                                                            } catch { }
                                                            setFormData({ ...formData, thumbnail: '', thumbnail_preview: '' });
                                                        }}
                                                        aria-label="Delete thumbnail"
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="assess-thumb-input"
                                                className="module-overlay__upload-label"
                                                tabIndex={0}
                                                onKeyPress={e => {
                                                    if (e.key === 'Enter') {
                                                        const input = document.getElementById('assess-thumb-input');
                                                        input && input.click();
                                                    }
                                                }}
                                            >
                                                <Plus size={16} /> Upload File
                                            </label>
                                        )}
                                    </div>
                                        

                                </div>}

                            {step === 2 && <div className="assess-form-section">

                                <CsvUpload onQuestionsUpload={handleCsvQuestionsUpload} />

                                {creating ? <div>Please Wait...</div>
                                    :
                                    <div className="assess-questions-container">
                                        {questions.map((q, qIndex) => (
                                            <React.Fragment key={qIndex}>
                                                <div className="assess-question-card">
                                                    <div className="assess-question-header">
                                                        <span className="assess-question-num">Question {qIndex + 1} </span>
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button
                                                                type="button"
                                                                className="btn-primary"
                                                                title="Duplicate Question"
                                                                onClick={() => duplicateQuestion(qIndex)} style={{ display: 'flex', gap: 8, border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                            >
                                                                <Copy size={16} />  Duplicate
                                                            </button>
                                                            {questions.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    className="assess-remove-question"
                                                                    onClick={() => removeQuestion(qIndex)}
                                                                    title="Remove Question"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>


                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                                        <div style={{ flex: 2 }}>
                                                            {/* Optional Instructions (above Question Type) */}
                                                            {/* <div className="assess-form-group">
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <label className="assess-form-label" style={{ marginBottom: 0 }}>Instructions (optional)</label>
                                                                    <button
                                                                        type="button"
                                                                        className="survey-assess-btn-secondary"
                                                                        style={{ padding: '6px 10px', fontSize: 15, fontWeight: 'bold' }}
                                                                        onClick={() => setInstructionsOpen(prev => ({ ...prev, [qIndex]: !prev[qIndex] }))}
                                                                    >
                                                                        {instructionsOpen[qIndex] || !!q.instructions ? 'Hide' : 'Add'} Instructions
                                                                    </button>
                                                                </div>
                                                                {(instructionsOpen[qIndex] || !!q.instructions) && (
                                                                    <div style={{ marginTop: 8 }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                                                                            <button
                                                                                type="button"
                                                                                className="assess-remove-question"
                                                                                aria-label="Close instructions"
                                                                                title="Close instructions"
                                                                                onClick={() => {
                                                                                   
                                                                                    updateQuestionField(qIndex, 'instructions', '');
                                                                                    setInstructionsOpen(prev => ({ ...prev, [qIndex]: false }));
                                                                                }}
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        </div>
                                                                        <div className="assess-instructions-box">
                                                                            <RichText
                                                                                value={q.instructions || ''}
                                                                                onChange={(html) => updateQuestionField(qIndex, 'instructions', html)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div> */}

                                                            {/* Question Type */}
                                                            <div className="assess-form-group">
                                                                <label className="assess-form-label" style={{ marginTop: "10px" }}>Question Type<span className="assess-required">*</span></label>
                                                                <select
                                                                    key={`type-${qIndex}-${q.type}`} // Force re-render when type changes
                                                                    className="assess-form-input"
                                                                    value={q.type || ''}
                                                                    onChange={e => updateQuestionField(qIndex, 'type', e.target.value)}
                                                                    required
                                                                >
                                                                    <option value="">Select Type</option>
                                                                    <option value="Multiple Choice">Multiple Choice</option>
                                                                    <option value="Multi Select">Multi Select</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>


                                                    {fileupload ?
                                                        <div className="assess-form-group" style={{ marginTop: '20px' }}>
                                                            <div style={{ width: '100%', backgroundColor: '#f5f5f5', height: '100px' }}>
                                                                <p>Please Wait..</p>

                                                            </div>
                                                        </div>
                                                        : <div className="assess-form-group" style={{ marginTop: '20px' }}>
                                                            <label className="assess-form-label">Attach File (Optional)</label>
                                                            <div
                                                                className="assess-file-upload-container"
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                                                            >
                                                                <select
                                                                    className="assess-form-select"
                                                                    value={q.file_url || ''}
                                                                    onChange={e => updateQuestionField(qIndex, 'file_url', e.target.value)}
                                                                >
                                                                    <option value="">No file selected</option>
                                                                    {/* Show existing file option if it's not part of uploadedFiles list */}
                                                                    {q.file_url && !uploadedFiles.includes(q.file_url) && (
                                                                        <option value={q.file_url}>
                                                                            {q.file_url.split('/').pop() || 'Current File'}
                                                                        </option>
                                                                    )}
                                                                    {uploadedFiles.map((fUrl, i) => (
                                                                        <option key={i} value={fUrl}>
                                                                            {`Uploaded File ${i + 1}`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <div
                                                                    className="assess-file-upload"
                                                                    style={{ position: 'relative' }}
                                                                >
                                                                    <input
                                                                        type="file"
                                                                        id={`file-${qIndex}`}
                                                                        className="assess-file-input"
                                                                        name="files"
                                                                        onChange={(e) => handleAddFile(qIndex, e)}
                                                                    />
                                                                    <label
                                                                        htmlFor={`file-${qIndex}`}
                                                                        className="assess-file-label"
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                        }}
                                                                    >
                                                                        <Upload size={16} />
                                                                        Upload File
                                                                    </label>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="assess-preview-toggle"
                                                                    title="Preview File"
                                                                    onClick={() => handlePreviewQuestionFile(q, qIndex)}
                                                                    disabled={!q.file_url}
                                                                    style={{ whiteSpace: 'nowrap' }}
                                                                >
                                                                    <Eye size={16} />
                                                                    {questionFilePreview.open && questionFilePreview.index === qIndex ? ' Hide Preview' : ' Preview'}

                                                                </button>
                                                            </div>

                                                            {/* File name display */}
                                                            {q.file_url && (
                                                                <div
                                                                    style={{
                                                                        marginTop: '6px',
                                                                        fontSize: '0.9rem',
                                                                        color: '#64748b',
                                                                    }}
                                                                >
                                                                    File: {q.file_url.split('/').pop()}
                                                                </div>
                                                            )}
                                                        </div>}


                                                    <FilePreviewModal
                                                        open={questionFilePreview.open && questionFilePreview.index === qIndex}
                                                        filePreview={questionFilePreview}
                                                        onClose={closeQuestionFilePreview}
                                                    />



                                                    {/* Question Text */}
                                                    <div className="assess-form-group" style={{ marginTop: '20px' }}>
                                                        <label className="assess-form-label">
                                                            Question Text<span className="assess-required">*</span>
                                                        </label>
                                                        <textarea
                                                            className="assess-form-textarea"
                                                            placeholder="Enter your question here..."
                                                            rows={2}
                                                            value={q.question_text}
                                                            onChange={e => updateQuestionField(qIndex, 'question_text', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    {/* Answer Options and Correct Answer Index */}
                                                    <div className="assess-form-group" style={{ marginTop: '20px' }}>
                                                        <label className="assess-form-label">Answer Options</label>
                                                        {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && <div className="assess-options-container">
                                                            {Viacsv ? (
                                                                // For CSV uploaded questions - show all options (empty options already filtered out)
                                                                q.options.map((opt, optIndex) => (
                                                                    <div key={optIndex} className="assess-option-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}>
                                                                        <div className="assess-option-index">{getLetterFromIndex(optIndex)}</div>
                                                                        <input
                                                                            type="text"
                                                                            className="assess-form-input"
                                                                            placeholder={`Option ${getLetterFromIndex(optIndex)}`}
                                                                            value={opt}
                                                                            onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                                                                            required
                                                                        />
                                                                        {q.options.length > 2 && (
                                                                            <button
                                                                                type="button"
                                                                                className="assess-remove-option"
                                                                                onClick={() => removeOption(qIndex, optIndex)}
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                // For manually created questions - show all options
                                                                q.options.map((opt, optIndex) => (
                                                                    <div key={optIndex} className="assess-option-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}>
                                                                        <div className="assess-option-index">{getLetterFromIndex(optIndex)}</div>
                                                                        <input
                                                                            type="text"
                                                                            className="assess-form-input"
                                                                            placeholder={`Option ${getLetterFromIndex(optIndex)}`}
                                                                            value={opt}
                                                                            onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                                                                            required
                                                                        />
                                                                        {q.options.length > 2 && (
                                                                            <button
                                                                                type="button"
                                                                                className="assess-remove-option"
                                                                                onClick={() => removeOption(qIndex, optIndex)}

                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            )}
                                                            {(() => {
                                                                // Count total options (including empty ones)
                                                                const totalOptions = q.options.length;

                                                                // Only show button if less than 5 total options
                                                                if (totalOptions >= 5) {
                                                                    return null;
                                                                }

                                                                // Check if first 2 options are filled
                                                                const firstTwoOptionsFilled = q.options.length >= 2 &&
                                                                    q.options[0] && q.options[0].trim() !== '' &&
                                                                    q.options[1] && q.options[1].trim() !== '';

                                                                // Check if all options are filled (no empty options)
                                                                const allOptionsFilled = q.options.every(opt => opt && opt.trim() !== '');

                                                                // Determine if button should be enabled
                                                                const isEnabled = firstTwoOptionsFilled && allOptionsFilled;

                                                                // Create appropriate title message
                                                                let titleMessage = '';
                                                                if (!firstTwoOptionsFilled) {
                                                                    titleMessage = 'Please fill the first two options to enable Add Option';
                                                                } else if (!allOptionsFilled) {
                                                                    titleMessage = 'Please fill all existing options to enable Add Option';
                                                                }

                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        className="assess-add-option"
                                                                        onClick={() => addOption(qIndex)}
                                                                        disabled={!isEnabled}
                                                                        title={titleMessage}
                                                                    >
                                                                        <Plus size={14} />
                                                                        Add Option
                                                                    </button>
                                                                );
                                                            })()}
                                                            {/* Correct Answer Index(es) + Save aligned right */}
                                                            <div className="assess-correct-row">
                                                                <div className="assess-form-group assess-correct-group">
                                                                    <label className="assess-form-label">{q.type === 'Multi Select' ? 'Correct Answer ' : 'Correct Answer '}</label>
                                                                    <input
                                                                        type="text"
                                                                        className={`assess-form-input ${(() => {
                                                                            const value = (() => {
                                                                                if (Array.isArray(q.correct_option)) {
                                                                                    return q.correct_option.map(idx => getLetterFromIndex(idx)).join(',');
                                                                                }
                                                                                if (typeof q.correct_option === 'number') {
                                                                                    return getLetterFromIndex(q.correct_option);
                                                                                }
                                                                                if (typeof q.correct_option === 'string' && q.correct_option !== '') {
                                                                                    return q.correct_option.toUpperCase();
                                                                                }
                                                                                return '';
                                                                            })();

                                                                            if (!value) return '';

                                                                            const validOptions = Array.isArray(q.options) ? q.options.filter(opt => opt && opt.trim() !== '').length : 0;
                                                                            if (validOptions === 0) return '';

                                                                            // For Multiple Choice, don't allow commas or multiple letters
                                                                            if (q.type === 'Multiple Choice') {
                                                                                const singleLetter = value.replace(/[^A-Z]/g, '');
                                                                                if (singleLetter.length > 1) {
                                                                                    return 'assess-correct-error'; // Multiple letters in single choice
                                                                                }
                                                                                if (singleLetter && singleLetter.charCodeAt(0) - 65 >= validOptions) {
                                                                                    return 'assess-correct-error'; // Letter out of range
                                                                                }
                                                                                // Check if the selected option is actually filled (not empty)
                                                                                const selectedIndex = singleLetter.charCodeAt(0) - 65;
                                                                                if (singleLetter && (!q.options[selectedIndex] || q.options[selectedIndex].trim() === '')) {
                                                                                    return 'assess-correct-error'; // Selected option is empty
                                                                                }
                                                                                return singleLetter ? 'assess-correct-valid' : '';
                                                                            }

                                                                            // For Multi Select, check each part
                                                                            const parts = value.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
                                                                            const invalidParts = parts.filter(part => {
                                                                                if (/^[A-Z]$/.test(part)) {
                                                                                    const index = part.charCodeAt(0) - 65;
                                                                                    if (index >= validOptions) {
                                                                                        return true; // Index out of range
                                                                                    }
                                                                                    // Check if the selected option is actually filled (not empty)
                                                                                    if (!q.options[index] || q.options[index].trim() === '') {
                                                                                        return true; // Selected option is empty
                                                                                    }
                                                                                    return false;
                                                                                }
                                                                                return true;
                                                                            });

                                                                            return invalidParts.length > 0 ? 'assess-correct-error' : 'assess-correct-valid';
                                                                        })()}`}
                                                                        placeholder={q.type === 'Multi Select' ? 'e.g., A,C for multiple' : 'e.g., A'}
                                                                        value={
                                                                            (() => {
                                                                                if (Array.isArray(q.correct_option)) {
                                                                                    return q.correct_option.map(idx => {
                                                                                        if (typeof idx === 'number') {
                                                                                            return getLetterFromIndex(idx);
                                                                                        }
                                                                                        return getLetterFromIndex(0); // fallback
                                                                                    }).join(',');
                                                                                }
                                                                                if (typeof q.correct_option === 'number') {
                                                                                    return getLetterFromIndex(q.correct_option);
                                                                                }
                                                                                if (typeof q.correct_option === 'string' && q.correct_option !== '') {
                                                                                    // If it's already a letter string, return as-is
                                                                                    return q.correct_option.toUpperCase();
                                                                                }
                                                                                return '';
                                                                            })()
                                                                        }
                                                                        onChange={e => {
                                                                            const value = e.target.value.toUpperCase();
                                                                            // Allow letters A-Z, commas, and spaces
                                                                            if (/^[A-Z,\s]*$/.test(value) || value === '') {
                                                                                // For Multiple Choice, only allow single letter (no commas)
                                                                                if (q.type === 'Multiple Choice') {
                                                                                    const cleanValue = value.replace(/[^A-Z]/g, ''); // Remove everything except letters
                                                                                    if (cleanValue.length <= 1) {
                                                                                        updateQuestionField(qIndex, 'correct_option', cleanValue);
                                                                                    }
                                                                                } else {
                                                                                    // For Multi Select, allow commas
                                                                                    updateQuestionField(qIndex, 'correct_option', value);
                                                                                }
                                                                            }
                                                                        }}
                                                                        onBlur={e => {
                                                                            // Parse and normalize on blur - convert letters to numbers for backend
                                                                            const raw = String(e.target.value || '');
                                                                            const parts = raw.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
                                                                            if (parts.length === 0) {
                                                                                updateQuestionField(qIndex, 'correct_option', '');
                                                                                return;
                                                                            }

                                                                            // Check if indices are within valid range
                                                                            const validOptions = Array.isArray(q.options) ? q.options.filter(opt => opt && opt.trim() !== '').length : 0;
                                                                            const maxValidIndex = validOptions - 1; // 0-based index

                                                                            let hasInvalidIndex = false;
                                                                            let hasEmptyOptionIndex = false;

                                                                            if (parts.length > 1) {
                                                                                // Multi-select: check each index
                                                                                const arr = parts
                                                                                    .map(s => {
                                                                                        if (/^[A-Z]$/.test(s)) {
                                                                                            const index = s.charCodeAt(0) - 65;
                                                                                            if (index > maxValidIndex) {
                                                                                                hasInvalidIndex = true;
                                                                                                return -1; // Invalid index
                                                                                            }
                                                                                            // Check if the option at this index is actually filled
                                                                                            if (!q.options[index] || q.options[index].trim() === '') {
                                                                                                hasEmptyOptionIndex = true;
                                                                                                return -1; // Empty option
                                                                                            }
                                                                                            return index;
                                                                                        }
                                                                                        return -1;
                                                                                    })
                                                                                    .filter(n => n >= 0 && n <= maxValidIndex);
                                                                                const uniqueSorted = Array.from(new Set(arr)).sort((a, b) => a - b);

                                                                                if (hasInvalidIndex || hasEmptyOptionIndex) {
                                                                                    updateQuestionField(qIndex, 'correct_option', uniqueSorted.length > 0 ? uniqueSorted : '');
                                                                                } else {
                                                                                    updateQuestionField(qIndex, 'correct_option', uniqueSorted);
                                                                                }
                                                                            } else {
                                                                                // Single choice: check single index
                                                                                if (/^[A-Z]$/.test(parts[0])) {
                                                                                    const letterIndex = parts[0].charCodeAt(0) - 65;
                                                                                    if (letterIndex > maxValidIndex) {
                                                                                        hasInvalidIndex = true;
                                                                                    }
                                                                                    // Check if the option at this index is actually filled
                                                                                    if (!q.options[letterIndex] || q.options[letterIndex].trim() === '') {
                                                                                        hasEmptyOptionIndex = true;
                                                                                    }
                                                                                    if (!hasInvalidIndex && !hasEmptyOptionIndex) {
                                                                                        updateQuestionField(qIndex, 'correct_option', letterIndex);
                                                                                    } else {
                                                                                        updateQuestionField(qIndex, 'correct_option', '');
                                                                                    }
                                                                                } else {
                                                                                    updateQuestionField(qIndex, 'correct_option', '');
                                                                                }
                                                                            }

                                                                            // Show popup if any index is out of range or points to empty option
                                                                            if (hasInvalidIndex) {
                                                                                const optionLetters = Array.from({ length: validOptions }, (_, i) => getLetterFromIndex(i)).join(', ');
                                                                                // alert(`Invalid correct answer index. Please select from options: ${optionLetters}`);
                                                                            } else if (hasEmptyOptionIndex) {
                                                                                const optionLetters = Array.from({ length: validOptions }, (_, i) => getLetterFromIndex(i)).join(', ');
                                                                                // alert(`Selected option is empty. Please select from available options: ${optionLetters}`);
                                                                            }
                                                                        }}
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>



                                                        </div>}

                                                        {/* Footer actions similar to Surveys: Add Question + Add Section gated by readiness */}
                                                        <div className="assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                                            {(() => {
                                                                const textOk = !!(q.question_text || '').trim();
                                                                // Check that ALL options are filled (no empty options)
                                                                const allOptionsFilled = Array.isArray(q.options) && q.options.length >= 2 &&
                                                                    q.options.every(opt => opt && opt.trim() !== '');
                                                                const qReady = textOk && allOptionsFilled;
                                                                const hint = qReady ? undefined : allOptionsFilled ?
                                                                    'Enter question text to enable' :
                                                                    'Enter question text and fill all options to enable';
                                                                return (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-secondary"
                                                                            onClick={() => addQuestionAfter(qIndex)}
                                                                            disabled={!qReady}
                                                                            title={hint}
                                                                        >
                                                                            <Plus size={14} /> Add Question
                                                                        </button>
                                                                        {/* Sections removed: no Add Section button */}
                                                                        {/* <button
                                                                            type="button"
                                                                            className="assess-btn-primary assess-save-inline"
                                                                            title={qReady ? 'Save and Preview this question' : hint}
                                                                            onClick={() => setQuestionPreviewIndex(qIndex)}
                                                                            disabled={!qReady}
                                                                        >
                                                                            <Eye size={16} /> Preview Question
                                                                        </button> */}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Sections removed: no section blocks after questions */}
                                            </React.Fragment>
                                        ))}
                                    </div>}
                            </div>}
                            {/* next info */}
                            {step === 3 && <div className='assess-form-section'>
                                <div className="assess-form-grid">

                                    <div className="assess-form-group">
                                        <label className="assess-form-label">
                                            Duration<span className="assess-required">*</span>
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input
                                                type="number"
                                                min={0}
                                                step={1}
                                                className="assess-form-input"
                                                placeholder="Enter minutes"
                                                value={formData.duration}
                                                onChange={e => {
                                                    setFormData({ ...formData, duration: e.target.value });
                                                }}
                                                required
                                            />
                                        </div>
                                        <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            Enter total minutes
                                        </small>
                                    </div>

                                    <div className="assess-form-group">
                                        <label className="assess-form-label">Attempts<span className="assess-required">*</span></label>
                                        <select
                                            className="assess-form-select"
                                            value={formData.unlimited_attempts ? '100' : (formData.attempts || '')}
                                            onChange={e => {
                                                const value = e.target.value;
                                                if (value === '100') {
                                                    // Unlimited attempts
                                                    setFormData({
                                                        ...formData,
                                                        unlimited_attempts: true,
                                                        attempts: 100,
                                                        // If display answers is enabled and unlimited is chosen, default to AfterPassing
                                                        display_answers: formData.display_answers
                                                            ? 'AfterPassing'
                                                            : formData.display_answers,
                                                    });
                                                } else {
                                                    // Limited attempts
                                                    const numValue = parseInt(value, 10);
                                                    setFormData({
                                                        ...formData,
                                                        unlimited_attempts: false,
                                                        attempts: Number.isNaN(numValue) ? 1 : Math.max(1, numValue),
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="">Select Attempts</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                            <option value="100">Unlimited</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="assess-form-grid">

                                    <div className="assess-form-group">
                                        <label className="assess-form-label">
                                            Team<span className="assess-required">*</span>
                                        </label>
                                        <select
                                            className="assess-form-select"
                                            value={formData.team || ''}
                                            onChange={e => {
                                                const teamId = e.target.value;
                                                // Reset sub-team when team changes
                                                setFormData({ ...formData, team: teamId, subteam: '' });
                                            }}
                                        >
                                            <option value="">Select Team</option>
                                            {groups.map(team => (
                                                <option key={team._id} value={team._id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="assess-form-group">
                                        <label className="assess-form-label">
                                            Sub-Team<span className="assess-required">*</span>
                                        </label>
                                        <select
                                            className="assess-form-select"
                                            value={formData.subteam || ''}
                                            onChange={e => setFormData({ ...formData, subteam: e.target.value })}
                                            disabled={!formData.team}
                                        >
                                            <option value="">{formData.team ? 'Select Sub-Team' : 'Select Team first'}</option>
                                            {subTeams.map(st => (
                                                <option key={st._id} value={st._id}>
                                                    {st.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="assess-form-grid">
                                    <div className="assess-form-group">
                                        <label className="assess-form-label">Pass Percentage (0-100)<span className="assess-required">*</span></label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="assess-form-input"
                                            value={formData.percentage_to_pass || ''}
                                            onChange={e => {
                                                const value = e.target.value;
                                                // Allow empty string or numeric input
                                                if (value === '' || /^\d+$/.test(value)) {
                                                    const numericValue = value === '' ? '' : parseInt(value, 10);
                                                    // Prevent values above 100
                                                    if (numericValue === '' || (numericValue >= 0 && numericValue <= 100)) {
                                                        setFormData({
                                                            ...formData,
                                                            percentage_to_pass: numericValue,
                                                        });
                                                    }
                                                }
                                                if (passError) setPassError('');
                                            }}
                                            onKeyDown={e => {
                                                // Allow backspace, delete, tab, escape, enter, and numbers
                                                if (!['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !/^\d$/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            placeholder="Enter the percentage"
                                            max="100"
                                        />
                                        <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            Enter an integer between 0 and 100
                                        </small>
                                        {passError && (
                                            <div style={{ color: '#dc2626', marginTop: 6, fontSize: '0.875rem' }}>{passError}</div>
                                        )}
                                    </div>
                                    <div className="assess-form-group">
                                        <label className="assess-form-label">
                                            Display Answers <span className="assess-required">*</span>
                                        </label>
                                        <select
                                            className="assess-form-select"
                                            value={formData.display_answers || ''}
                                            onChange={e => setFormData({ ...formData, display_answers: e.target.value })}
                                            disabled={!formData.display_answers}
                                        >
                                            <option value="">Select when to display</option>
                                            <option value="AfterAssessment">After submission</option>
                                            <option value="AfterPassing">After passing</option>
                                            <option value="Never">Never</option>
                                        </select>
                                    </div>
                                </div>
                                {/* adding new fileds */}
                                <div className="assess-form-grid">
                                    <div className='assess-form-group'>
                                        <label className="assess-form-label">
                                            Credits<span className="assess-required">*</span>
                                        </label>
                                        <select name="credits" id="" value={Number.isFinite(formData.credits) ? formData.credits : 0} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value, 10) || 0 })} className='assess-form-input' >
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                        </select>
                                    </div>
                                    <div className='assess-form-group'>
                                        <label className="assess-form-label">
                                            Stars<span className="assess-required">*</span>
                                        </label>

                                        <select name="stars" id="" value={Number.isFinite(formData.stars) ? formData.stars : 0} onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value, 10) || 0 })} className='assess-form-input' >
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                        </select>
                                    </div>

                                </div>
                                <div className='assess-form-grid'>
                                    <div className='assess-form-group'>
                                        <label className="assess-form-label">
                                            Badges<span className="assess-required">*</span>
                                        </label>
                                        {/* <span className="slider-value">{newContent.badges || 0}</span> */}
                                        <select name="badges" id="" value={Number.isFinite(formData.badges) ? formData.badges : 0} onChange={(e) => setFormData({ ...formData, badges: parseInt(e.target.value, 10) || 0 })} className='assess-form-input' >
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                        </select>
                                    </div>
                                    <div className='assess-form-group'>
                                        <label className="assess-form-label">
                                            Category <span className="assess-required">*</span>
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category || ''}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="assess-form-input"
                                            required

                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* <div className="assess-form-group">
                                    <label className="assess-form-label module-overlay__checkbox">
                                        <input
                                            type="checkbox"
                                            name="feedbackEnabled"
                                            checked={!!formData.feedbackEnabled}
                                            onChange={(e) => setFormData({ ...formData, feedbackEnabled: e.target.checked })}
                                        />
                                        Allow learners to submit feedback and reactions
                                    </label>
                                </div> */}


                                <div className="assess-form-group">

                                    <label className="assess-form-label">

                                    </label>
                                    <label className="assess-form-label module-overlay__checkbox">
                                        <input
                                            type="checkbox"
                                            name="shuffle_questions"
                                            checked={!!formData.shuffle_questions}
                                            onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                                        />
                                        Shuffle questions (randomize question order per student/attempt)
                                    </label>
                                </div>
                                <div className="assess-form-group">
                                    <label className="assess-form-label module-overlay__checkbox">
                                        <input
                                            type="checkbox"
                                            name="shuffle_options"
                                            checked={!!formData.shuffle_options}
                                            onChange={(e) => setFormData({ ...formData, shuffle_options: e.target.checked })}
                                        />
                                        Shuffle options (randomize choices order per student/attempt)
                                    </label>
                                </div>

                            </div>}


                        </div>
                    </div>
                    {/* Form Actions */}
                    <div className="assess-form-actions">
                        {step === 3 ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                {step > 1 && <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
                                    <ChevronLeft size={16} />Previous
                                </button>}
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setAssessmentPreviewOpen(true)}
                                        disabled={!canProceedToNext()}
                                        title="Preview the entire assessment as the user sees it"
                                    >
                                        <Eye size={16} />
                                        <span>Preview Assessment</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => {
                                            if (!validatePass()) {
                                                if (step !== 1) setStep(1);
                                                return;
                                            }
                                            // Save/Update explicitly as Draft
                                            if (currentAssessment) {
                                                handleUpdateAssessment('Draft');
                                            } else {
                                                handleSaveAssessment(undefined, 'Draft');
                                            }
                                        }}
                                        disabled={!canProceedToNext()}
                                        title="Save this assessment as Draft"
                                    >
                                        <FileText size={16} />
                                        <span>Save as Draft</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => {
                                            if (!validatePass()) {
                                                if (step !== 1) setStep(1);
                                                return;
                                            }
                                            // Create/Update explicitly as Saved
                                            if (currentAssessment) {
                                                handleUpdateAssessment('Saved');
                                            } else {
                                                handleSaveAssessment(undefined, 'Saved');
                                            }
                                        }}
                                        disabled={!canProceedToNext()}
                                    >
                                        <FileText size={16} />
                                        <span>{currentAssessment ? "Update Assessment" : "Create Assessment"}</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    {/* {step > 1 && <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
                                                <ChevronLeft size={16} />Previous
                                            </button>} */}
                                    {step > 1 && <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handlePrev}
                                        disabled={step === 1}
                                    >
                                        <ChevronLeft size={16} />Previous
                                    </button>}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', gap: "10px   " }}>
                                        <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                            Cancel
                                        </button>
                                        {/* {step < 3 && <button type="button" className="btn-primary" onClick={() => setStep(step + 1)}>
                                                    Next <ChevronRight size={16} />
                                                </button>} */}
                                        {step < 3 && <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={handleNext}
                                            disabled={!canProceedToNext()}
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Question Preview Modal (end-user view) */}
            {questionPreviewIndex !== null && questions[questionPreviewIndex] && (
                <div className="assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setQuestionPreviewIndex(null); }}>
                    <div className="assess-qpreview-modal">
                        <div className="assess-qpreview-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Eye size={16} />
                                <span className="assess-qpreview-title">Question Preview</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuestionPreviewIndex(null)}
                                aria-label="Close preview"
                                className="assess-qpreview-close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {(() => {
                            const q = questions[questionPreviewIndex];
                            return (
                                <div className="assess-qpreview-body">
                                    {/* Instructions */}
                                    {q.instructions && (
                                        <div className="assess-qpreview-section">
                                            <div className="label">Instructions</div>
                                            <div className="assess-qpreview-instructions">{q.instructions}</div>
                                        </div>
                                    )}



                                    <div className="assess-qpreview-section" >

                                        <div className="label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>Question</span>
                                            <span className="assess-qpreview-badge" style={{ marginLeft: 'auto' }}>{q.type || '—'}</span>
                                        </div>
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#0f172a' }}>{q.question_text || '—'}</div>
                                    </div>
                                    {/* Attached media */}
                                    {q.file_url && (
                                        <div className="assess-qpreview-section assess-qpreview-media">
                                            {q.file_url.match(/\.(jpeg|jpg|png|gif)$/i) && (
                                                <img src={resolveUrl(q.file_url)} alt="Question media" />
                                            )}
                                            {q.file_url.match(/\.(mp4|webm|ogg)$/i) && (
                                                <video src={resolveUrl(q.file_url)} controls />
                                            )}
                                            {q.file_url.match(/\.(mp3|wav|ogg)$/i) && (
                                                <audio src={resolveUrl(q.file_url)} controls />
                                            )}
                                            {q.file_url.match(/\.pdf$/i) && (
                                                <iframe src={resolveUrl(q.file_url)} title="PDF" />
                                            )}
                                        </div>
                                    )}
                                    {/* Options (end-user view: not showing correct answers) */}
                                    {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && Array.isArray(q.options) && q.options.length > 0 && (
                                        <div className="assess-qpreview-section">
                                            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                Options

                                            </div>
                                            <div className="assess-qpreview-options">
                                                {(() => {
                                                    // Filter out empty options and show shuffled non-empty options only
                                                    const nonEmptyOptions = q.options.filter(opt => opt && opt.trim() !== '');
                                                    const displayOptions = [...nonEmptyOptions].sort(() => 0.5 - Math.random());
                                                    // const displayOptions = [...q.options].sort(() => 0.5 - Math.random());
                                                    return displayOptions.map((opt, idx) => (
                                                        <label key={idx} className="assess-qpreview-option">
                                                            <input type={q.type === 'Multi Select' ? 'checkbox' : 'radio'} disabled name={`preview-q-${questionPreviewIndex}`} />
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontWeight: 'bold', color: '#374151', minWidth: '20px' }}>
                                                                    {getLetterFromIndex(idx)}.
                                                                </span>
                                                                <span>{opt || `Option ${getLetterFromIndex(idx)}`}</span>
                                                            </span>
                                                        </label>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
            {/* Assessment Preview Modal (single page, no sections) */}

            {assessmentPreviewOpen && (<AssessmentPreview data={{ ...formData, questions }} onClose={() => setAssessmentPreviewOpen(false)} />)}

            {/* Single Question Preview Modal (Survey UI) */}
            {questionPreviewIndex !== null && questions[questionPreviewIndex] && (
                <div className="survey-assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setQuestionPreviewIndex(null); setPreviewResponses({}); } }}>
                    <div className="assess-qpreview-modal">
                        <div className="survey-assess-qpreview-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Eye size={16} />
                                <span className="survey-assess-qpreview-title">Question Preview</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setQuestionPreviewIndex(null); setPreviewResponses({}); }}
                                aria-label="Close preview"
                                className="survey-assess-qpreview-close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {(() => {
                            const q = questions[questionPreviewIndex];
                            const qKey = `__single_${questionPreviewIndex}`;
                            const isMulti = q.type === 'Multi Select';
                            const selected = previewResponses[qKey];
                            const handleChange = (originalIndex, checked) => {
                                setPreviewResponses(prev => {
                                    if (isMulti) {
                                        const arr = Array.isArray(prev[qKey]) ? [...prev[qKey]] : [];
                                        const i = arr.indexOf(originalIndex);
                                        if (checked && i === -1) arr.push(originalIndex);
                                        if (!checked && i !== -1) arr.splice(i, 1);
                                        return { ...prev, [qKey]: arr };
                                    }
                                    return { ...prev, [qKey]: originalIndex };
                                });
                            };
                            const displayOptions = Array.isArray(q.options)
                                ? q.options.map((opt, originalIndex) => ({ opt, originalIndex }))
                                : [];
                            return (
                                <div className="survey-assess-qpreview-body">
                                    <div className="survey-gforms-container">
                                        <div className="survey-gforms-card">
                                            <div className="survey-gforms-card-body">
                                                {/* Instructions (HTML) */}
                                                {q.instructions && (
                                                    <div
                                                        className="survey-assess-qpreview-instructions"
                                                        style={{ color: '#334155', marginBottom: 6 }}
                                                        dangerouslySetInnerHTML={{ __html: q.instructions }}
                                                    />
                                                )}
                                                {/* Question text */}
                                                <div className="survey-gforms-question-title">{q.question_text || '—'}</div>
                                                {/* Media (if any) */}
                                                {q.file_url && (
                                                    <div className="survey-assess-form-group" style={{ marginTop: 8 }}>
                                                        {q.file_url.match(/\.(jpeg|jpg|png|gif)$/i) && (
                                                            <img src={resolveUrl(q.file_url)} alt="Question media" style={{ maxWidth: '100%', borderRadius: 6 }} />
                                                        )}
                                                        {q.file_url.match(/\.(mp4|webm|ogg)$/i) && (
                                                            <video src={resolveUrl(q.file_url)} controls style={{ width: '100%', borderRadius: 6 }} />
                                                        )}
                                                        {q.file_url.match(/\.(mp3|wav|ogg)$/i) && (
                                                            <audio src={resolveUrl(q.file_url)} controls style={{ width: '100%' }} />
                                                        )}
                                                        {q.file_url.match(/\.pdf$/i) && (
                                                            <iframe src={resolveUrl(q.file_url)} title="PDF" style={{ width: '100%', height: 360, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                                                        )}
                                                    </div>
                                                )}
                                                {/* Options (selectable, shuffled) */}
                                                {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && displayOptions.length > 0 && (
                                                    <div className="survey-assess-qpreview-options" style={{ marginTop: 8 }}>
                                                        {displayOptions
                                                            .filter(({ opt }) => opt && opt.trim() !== '') // Filter out empty options
                                                            .map(({ opt, originalIndex }, displayIndex) => {

                                                                const checked = isMulti
                                                                    ? Array.isArray(selected) && selected.includes(originalIndex)
                                                                    : selected === originalIndex;
                                                                return (
                                                                    <label key={`single-prev-q-${questionPreviewIndex}-opt-${originalIndex}`} className="survey-assess-qpreview-option">
                                                                        <input
                                                                            type={isMulti ? 'checkbox' : 'radio'}
                                                                            name={`single-prev-q-${questionPreviewIndex}`}
                                                                            checked={!!checked}
                                                                            onChange={(e) => handleChange(originalIndex, e.target.checked)}
                                                                        />
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span style={{ fontWeight: 'bold', color: '#374151', minWidth: '20px' }}>
                                                                                {getLetterFromIndex(displayIndex)}.
                                                                            </span>
                                                                            <span className="opt-text">{opt || `Option ${displayIndex + 1}`}</span>
                                                                        </span>
                                                                    </label>
                                                                );
                                                            })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {assessmentPreviewOpen && (
                <AssessmentPreview
                    isOpen={assessmentPreviewOpen}
                    onClose={() => { setAssessmentPreviewOpen(false); setPreviewResponses({}); }}
                    data={{
                        title: formData.title || 'Untitled Assessment',
                        description: formData.description || '',
                        instructions: formData.instructions || '',
                        questions: questions || [],
                        tags: formData.tags || [],
                        team: groups.find(t => String(t._id) === String(formData.team)) || { name: formData.team || '—' },
                        subteam: (() => {
                            // Find the team that contains this subteam ID
                            const teamWithSubteam = groups.find(t => t.subTeams?.some(st => String(st._id) === String(formData.subteam)));
                            // Then find the specific subteam within that team
                            return teamWithSubteam?.subTeams?.find(st => String(st._id) === String(formData.subteam)) || { name: formData.subteam || '—' };
                        })(),
                        duration: parseInt(formData.duration) || 10,
                        thumbnail_url: formData.thumbnail || '',
                        credits: formData.credits || 0,
                        badges: formData.badges || 0,
                        stars: formData.stars || 0,
                        prerequisites: formData.prerequisites || [],
                        learningOutcomes: formData.learningOutcomes || [],
                        primaryFile: formData.primaryFile || null,
                        externalResource: formData.externalResource || null,
                        additionalFile: formData.additionalFile || null,
                        submissionEnabled: formData.submissionEnabled || false,
                        feedbackEnabled: formData.feedbackEnabled || false,
                        feedback: formData.feedback || null,
                        attempts: formData.attempts || 1,
                        passPercentage: formData.passPercentage || 50,
                        isPublished: formData.isPublished || false,

                    }}
                />
            )}
            <FilePreviewModal open={filePreview.open} filePreview={filePreview} onClose={closeFilePreview} />
             <ToastContainer
                                       position="top-right"
                                       autoClose={10000}
                                       hideProgressBar={false}
                                       newestOnTop
                                       closeOnClick
                                       pauseOnHover
                                       draggable
                                       toastClassName="custom-toast"
                                       bodyClassName="custom-toast-body"
                                   />
                       
        </>
    );
};

export default QuestionsForm;
