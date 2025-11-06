import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Plus, X, Upload, Copy, Eye, EyeIcon, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../services/api.js';
import './QuestionsForm-survey.css';
import '../GlobalAssessments/QuestionsForm.css';
import RichText from './RichTextSurvey.jsx';
import SurveyMainPreview from '../../../components/common/Preview/SurveyMainPreview.jsx';
import FilePreviewModal from '../../../components/common/FilePreviewModal/FilePreviewModal.jsx';
import { toast, ToastContainer } from "react-toastify";
import { CheckCircle, AlertTriangle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import CustomLoader2 from '../../../components/common/Loading/CustomLoader2';
const QuestionsForm = ({
    currentAssessment,
    formData,
    setFormData,
    formElements,
    setFormElements,
    showForm,
    setShowForm,
    uploadedFiles,
    handleSaveAssessment,
    handleEditAssessment,
    handleUpdateAssessment,
    handleDeleteAssessment,
    updateFormElementField,
    addFormElement,
    removeFormElement,
    addOption,
    updateOption,
    removeOption,
    duplicateFormElement,
    groups = [],

}) => {
    // Local UI state for question preview modal; holds the qIndex or null
    const [questionPreviewIndex, setQuestionPreviewIndex] = useState(null);
    const [instructionsOpen, setInstructionsOpen] = useState({});
    // Whole-assessment preview modal
    const [assessmentPreviewOpen, setAssessmentPreviewOpen] = useState(false);



    // Section-based preview index (for section pagination in preview)
    const [sectionPreviewIndex, setSectionPreviewIndex] = useState(0);
    // Local responses for preview interaction (radio/checkbox selections)
    const [previewResponses, setPreviewResponses] = useState({});
    const [filePreview, setFilePreview] = useState({ open: false, url: null, name: '', type: '', isBlob: false });
    // Wizard step (1: Basic, 2: Elements, 3: Settings/Review)
    const [step, setStep] = useState(1);
    // Input state for tag entry
    const [tagInput, setTagInput] = useState('');
    // Local validation message for pass percentage
    const [passError, setPassError] = useState('');
    const [noOfQuestions, setNoOfQuestions] = useState(0);
    const [noOfSections, setNoOfSections] = useState(0);
    // AI processing state for enhance text feature
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiHelpOpen, setAiHelpOpen] = useState(false);
    // Derive sub-teams for the selected team
    const selectedTeam = groups.find(t => String(t._id) === String(formData.team));
    const subTeams = selectedTeam?.subTeams || [];

    //ai related 
    const [errorsDisplay, setErrorsDisplay] = useState({ title: '', description: '' });
    const isAIDisabled = !formData.title?.trim() ||
        !formData.description?.trim();


    const parseHm = (d) => {
        const [h = '0', m = '0'] = (d || '').split(':');
        const hh = Math.max(0, parseInt(h, 10) || 0);
        const mm = Math.max(0, Math.min(59, parseInt(m, 10) || 0));
        return { hh, mm };
    };
    const formatHm = (hh, mm) => `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;


    // Reset preview state when opening
    useEffect(() => {
        if (assessmentPreviewOpen) {
            setSectionPreviewIndex(0);
            setPreviewResponses({});
        }
    }, [assessmentPreviewOpen]);

    // Ensure default duration is 10 mins if not set
    useEffect(() => {
        if (!formData?.duration) {
            setFormData(prev => ({ ...prev, duration: formatHm(0, 10) }));
        }
        // run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Reset single-question preview selections when opening
    useEffect(() => {
        if (questionPreviewIndex !== null) {
            setPreviewResponses({});
        }
    }, [questionPreviewIndex]);
    // Ensure Step 2 starts with Section first, then one Question (run once per entry)
    const initializedStep2 = useRef(false);
    useEffect(() => {
        if (step !== 2 || !Array.isArray(formElements)) return;
        if (initializedStep2.current) return;

        const hasSection = formElements.some(el => el.type === 'section');
        const hasQuestion = formElements.some(el => el.type === 'question');

        // If empty, start with a Section only (no default Question)
        if (formElements.length === 0) {
            addFormElement('section');
            initializedStep2.current = true;
            return;
        }

        // Add missing building blocks at most once
        let added = false;
        if (!hasSection) {
            // If there is no section, remove any existing questions so only a section shows by default
            const qIdxs = (formElements || []).map((el, i) => el?.type === 'question' ? i : -1).filter(i => i >= 0).reverse();
            qIdxs.forEach(i => removeFormElement(i));
            addFormElement('section');
            added = true;
        }
        // Do not auto-add a default question; user will add questions explicitly

        initializedStep2.current = true;
        // Note: if you later implement reordering, you can place section/question at desired positions.
    }, [step]);
    // Helper function to convert number to letter (0 -> A, 1 -> B, etc.)
    const getLetterFromIndex = (index) => {
        return String.fromCharCode(65 + index); // 65 is ASCII code for 'A'
    };


    const enhanceTexthelper = async (title, description) => {
        try {
            setAiProcessing(true);


            const response = await api.post('/api/globalAdmin/enhanceSurvey', { title, description });
            setFormData({
                ...formData,
                title: response.data.data.title,
                description: response.data.data.description,
                tags: response.data.data.tags
            });
            toast.success('Tags generated from AI');
            return true; // ✅ success
        } catch (error) {
            console.error('Error enhancing text:', error);
            toast.error('Failed to generate tags');
            return false; // ❗ failure
        } finally {
            setAiProcessing(false);
        }
    };
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
        if (!file && !previewUrl) return;
        let url = '';
        let isBlob = false;
        let name = 'Preview';

        if (typeof file === 'string') {
            url = file;
            name = file.split('/').pop() || name;
        } else if (file) {
            url = previewUrl || URL.createObjectURL(file);
            isBlob = !previewUrl;
            name = file.name || name;
        } else if (previewUrl) {
            url = previewUrl;
            name = previewUrl.split('/').pop() || name;
        }

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
    // Step validation functions
    const validateStep1 = () => {
        return formData.title?.trim() !== '' &&
            formData.description?.trim() !== '' &&
            Array.isArray(formData.tags) && formData.tags.length > 0;
    };

    const validateStep2 = () => {
        if (!Array.isArray(formElements) || formElements.length === 0) {
            return false;
        }
        // Check each element is properly filled
        for (const element of formElements) {
            if (element.type === 'question') {
                // Question must have type, text, and at least 2 options
                if (!element.question_type || !element.question_text?.trim() ||
                    !Array.isArray(element.options) || element.options.filter(o => o?.trim()).length < 2) {
                    return false;
                }
            } else if (element.type === 'section') {
                // Section must have description
                const raw = String(element.description || '');
                const plain = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                if (!plain) {
                    return false;
                }
            }
        }
        return true;
    };

    const validateStep3 = () => {
        return formData.team !== '' &&
            formData.subteam !== '' &&
            formData.duration && formData.duration.trim() !== '';
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

    // Close modals on ESC key
    useEffect(() => {
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

    const createAIQuestions = async (title, description, noOfSections, noOfQuestions) => {
        try {
            setAiProcessing(true);
            if (!noOfSections) {

                toast.error(
                    <div style={{ display: "flex", alignItems: "center" }}>

                        <div style={{ marginLeft: 10 }}>
                            <strong>Enter the Number of sections</strong>

                        </div>
                    </div>
                );

                setAiProcessing(false);
                return;
            }
            if (!noOfQuestions) {

                toast.error(
                    <div style={{ display: "flex", alignItems: "center" }}>

                        <div style={{ marginLeft: 10 }}>
                            <strong>Enter the  Number of Questions</strong>

                        </div>
                    </div>
                );

                setAiProcessing(false);
                return;
            }



            const response = await api.post('/api/globalAdmin/createSurveyQuestions', {
                title,
                description,
                noOfSections: parseInt(noOfSections),
                noOfQuestions: parseInt(noOfQuestions),

            });

            if (response.data.isSuccess && response.data.data?.sections) {
                const newFormElements = [];

                // Build UI-friendly formElements: section then its questions
                response.data.data.sections.forEach((section, sectionIndex) => {
                    newFormElements.push({
                        type: 'section',
                        title: section.title || `Section ${sectionIndex + 1}`,
                        description: section.description || ''
                    });

                    (section.questions || []).forEach((q) => {
                        newFormElements.push({
                            type: 'question',
                            question_type: (q?.type && String(q.type).toLowerCase().includes('multi select')) ? 'Multi Select' : 'Multiple Choice',
                            question_text: q?.question_text || '',
                            options: Array.isArray(q?.options)
                                ? q.options.map(opt => typeof opt === 'string' ? opt : (opt?.text ?? String(opt)))
                                : ['', '']
                        });
                    });
                });

                // Replace parent's formElements and go to Step 2
                if (typeof setFormElements === 'function') {
                    setFormElements(newFormElements);
                }
                // setStep(2);
                // toast.success("Survey questions generated successfully!");
                toast.success(
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <CheckCircle color="#10b981" size={22} />
                        <div style={{ marginLeft: 10 }}>
                            <strong>Survey questions generated successfully</strong>
                            <div style={{ fontSize: 13, opacity: 0.8 }}>
                                You can review and edit them in Step 2
                            </div>
                        </div>
                    </div>
                );

            } else {
                throw new Error("Failed to generate questions");
            }
        } catch (error) {
            console.error("Error generating questions:", error);
            toast.error(error.response?.data?.message || "Failed to generate questions");
        } finally {
            setAiProcessing(false);
        }
    };
    return (
        <>
            <div className="addOrg-modal-overlay">
                <div className="addOrg-modal-content">
                    {/* Modal Header */}
                    <div className="survey-assess-modal-header">
                        <div className="survey-assess-modal-header-content">
                            <div className="survey-assess-modal-icon">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2>{currentAssessment ? "Edit Survey" : "Create New Survey"}</h2>
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
                        <button className="survey-assess-close-btn" onClick={() => setShowForm(false)}>
                            <X size={20} />
                        </button>
                        {/* Bottom-of-header progress bar to match Assessments placement */}
                        <div className="assess-header-progress bottom">
                            <div
                                className="bar"
                                style={{ width: `${Math.min(100, Math.max(0, (step / 3) * 100))}%` }}
                            />
                        </div>
                    </div>

                    {/* Form + Preview Panel */}
                    <div className="survey-assess-modal-form-container">
                        {/* Left Side - Form */}
                        <div className="survey-assess-modal-form">
                            {/* Basic Information */}
                            {step === 1 &&
                                <div className="module-overlay__step">
                                    {/* <h3 className="survey-assess-section-title">Basic Information</h3> */}


                                    <div className="module-overlay__form-group">
                                        <label className="module-overlay__form-label">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Survey Title <span className="module-overlay__required">*</span>
                                                {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="addOrg-form-input"
                                            placeholder="Enter assessment title"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <div className="module-overlay__form-group" >
                                        <label className="module-overlay__form-label">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Survey Description <span className="module-overlay__required">*</span>
                                                {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}</span>
                                        </label>
                                        <textarea
                                            className="survey-assess-form-textarea"
                                            placeholder="Provide a detailed description of this survey"
                                            rows={3}
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="module-overlay__form-group">
                                        <label className="module-overlay__form-label">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Survey Tags <span className="module-overlay__required">*</span>
                                                {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}</span>
                                        </label>
                                        <div className="survey-assess-tag-picker" >
                                            <div className="survey-assess-tag-controls">
                                                <input
                                                    type="text"
                                                    className="addOrg-form-input"
                                                    placeholder="Type a tag and press Enter or comma"
                                                    value={tagInput}
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
                                                    style={{ marginBottom: "0px", width: "100%" }}
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

                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ width: '50%' }}>
                                            <label className='assess-form-label' style={{ margin: '10px' }}>Number of Sections</label>
                                            <input
                                                type="number"
                                                placeholder="Enter number of sections"
                                                value={formData.noOfSections}
                                                className='assess-form-input'
                                                // onChange={(e) => {setNoOfSections(e.target.value),setFormData({ ...formData, noOfSections: e.target.value })}}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setNoOfSections(value);
                                                    setFormData({ ...formData, noOfSections: value });
                                                }}


                                            />
                                        </div>
                                        <div style={{ width: '50%' }}>
                                            <label className='assess-form-label' style={{ margin: '10px' }}>Number of Questions</label>
                                            <input
                                                type="number"
                                                placeholder="Enter number of questions"
                                                value={formData.noOfQuestions}
                                                className='assess-form-input'
                                                // onChange={(e) => {setNoOfQuestions(e.target.value),setFormData({ ...formData, noOfQuestions: e.target.value })}}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setNoOfQuestions(value);
                                                    setFormData({ ...formData, noOfQuestions: value });
                                                }}

                                            />
                                        </div>
                                    </div>
                                    <div style={{ margin: '0 auto 8px', display: 'flex', justifyContent: 'flex-start' }}>
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
                                                <li>Set <strong>Number of Sections</strong> and <strong>Number of Questions</strong> to generate survey sections and questions.</li>
                                                <li>Click <strong>“Create with AI ✨”</strong>. First tags are enhanced, then survey content is generated.</li>
                                                <li>Review and edit generated content in <strong>Step 2</strong>.</li>
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
                                            if (isAIDisabled) return; // prevent accidental click
                                            const newErrors = {};
                                            if (!formData.title?.trim()) newErrors.title = "Title is required";
                                            if (!formData.description?.trim()) newErrors.description = "Description is required";

                                            if (Object.keys(newErrors).length > 0) {
                                                setErrorsDisplay(newErrors);
                                                return; // stop execution
                                            }

                                            // ✅ continue only if both fields filled
                                            try {
                                                const enhanced = await enhanceTexthelper(formData.title, formData.description);
                                                if (!enhanced) return; // stop if failed ❗

                                                const q = parseInt(noOfQuestions);
                                                const s = parseInt(noOfSections);

                                                if (Number.isFinite(q) && q > 0 && Number.isFinite(s) && s > 0) {
                                                    await createAIQuestions(formData.title, formData.description, q, s);
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




                                    {/* Thumbnail upload */}
                                    <div className="module-overlay__form-group" >
                                        <label className="module-overlay__form-label">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Thumbnail <span className="module-overlay__required">*</span></span>
                                        </label>

                                        {formData.thumbnail_url ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 12,
                                                    background: '#eef2ff',
                                                    borderRadius: 10,
                                                    padding: '8px 12px',
                                                    border: '1px solid #e2e8f0',
                                                }}
                                            >
                                                <div style={{ color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {(formData.thumbnail_file && formData.thumbnail_file.name) || (String(formData.thumbnail_url).split('/').pop() || 'thumbnail')}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <button
                                                        type="button"
                                                        className="survey-assess-btn-link"
                                                        onClick={() => handlePreviewFile(formData.thumbnail_file || formData.thumbnail_url, formData.thumbnail_url)}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4f46e5', background: 'transparent' }}
                                                    >
                                                        <Eye size={16} /> Preview
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="survey-assess-btn-link"
                                                        onClick={() => {
                                                            try {
                                                                if ((formData.thumbnail_url || '').startsWith('blob:')) URL.revokeObjectURL(formData.thumbnail_url);
                                                            } catch { }
                                                            setFormData({ ...formData, thumbnail_url: '', thumbnail_file: null });
                                                        }}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4f46e5', background: 'transparent' }}
                                                    >
                                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7ZM13.4142 13.9997L15.182 12.232L13.7678 10.8178L12 12.5855L10.2322 10.8178L8.81802 12.232L10.5858 13.9997L8.81802 15.7675L10.2322 17.1817L12 15.4139L13.7678 17.1817L15.182 15.7675L13.4142 13.9997ZM9 4V6H15V4H9Z"></path></svg>Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <input
                                                    type="file"
                                                    id="survey-thumb-input"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const file = e.target.files && e.target.files[0];
                                                        if (!file) return;
                                                        const blobUrl = URL.createObjectURL(file);
                                                        setFormData({ ...formData, thumbnail_url: blobUrl, thumbnail_file: file });
                                                    }}
                                                />
                                                <label
                                                    htmlFor="survey-thumb-input"
                                                    className="survey-assess-upload-btn"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                                >
                                                    <Upload size={16} /> Upload Thumbnail
                                                </label>
                                            </div>
                                        )}


                                    </div>

                                </div>}

                            {/* Form Elements Section */}
                            {step === 2 && <div className="survey-assess-form-section">
                                {/* <div className="survey-assess-form-elements-header">
                                    {(() => {
                                        const sectionCount = (formElements || []).filter(el => el.type === 'section').length;
                                        const questionCount = (formElements || []).filter(el => el.type === 'question').length;
                                        return (
                                            <h3 className="survey-assess-section-title">
                                               
                                            </h3>
                                        );
                                    })()}
                                </div> */}

                                <div className="survey-assess-form-elements-container survey-assess-questions-container">
                                    {formElements.map((element, elementIndex) => (
                                        <div key={elementIndex} className={`survey-assess-form-element-card ${element.type}`}>
                                            {/* Info Box Element */}
                                            {element.type === 'info' && (
                                                <div className="survey-assess-info-element">
                                                    <div className="survey-assess-element-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span className="survey-assess-element-number">Info Box {elementIndex + 1}</span>
                                                        {formElements.length > 2 && (
                                                            <button
                                                                type="button"
                                                                className="survey-assess-remove-element"
                                                                onClick={() => removeFormElement(elementIndex)}
                                                                title="Remove Info Box"
                                                                style={{ marginLeft: 8 }}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                            <button
                                                                type="button"
                                                                className="survey-assess-duplicate-element"
                                                                title="Duplicate Info Box"
                                                                onClick={() => duplicateFormElement(elementIndex)}
                                                            >
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="survey-assess-info-content">
                                                        <div className="survey-assess-form-group">
                                                            <label className="survey-assess-form-label">Description</label>
                                                            <RichText
                                                                value={element.description || ''}
                                                                onChange={(html) => updateFormElementField(elementIndex, 'description', html)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {element.type === 'question' && (
                                                <div className="survey-assess-question-card">
                                                    <div className="survey-assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                        {(() => {
                                                            // Determine section index (1-based) and question number within that section
                                                            const prior = formElements.slice(0, elementIndex);
                                                            const sectionsBefore = prior.filter(el => el.type === 'section').length;
                                                            const lastSectionIdx = (() => {
                                                                for (let i = elementIndex - 1; i >= 0; i--) {
                                                                    if (formElements[i]?.type === 'section') return i;
                                                                }
                                                                return -1;
                                                            })();
                                                            const qWithinSection = formElements
                                                                .slice(lastSectionIdx + 1, elementIndex + 1)
                                                                .filter(el => el.type === 'question').length;
                                                            const sectionNumber = sectionsBefore === 0 ? 1 : sectionsBefore;
                                                            return (
                                                                <span className="survey-assess-question-number">{`Question ${qWithinSection} of Section ${sectionNumber}`}</span>
                                                            );
                                                        })()}
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                            <button
                                                                type="button"
                                                                className="btn-primary"
                                                                title="Duplicate Question"
                                                                onClick={() => duplicateFormElement(elementIndex)} style={{ display: 'flex', gap: 8, border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                            >
                                                                <Copy size={16} /> Duplicate
                                                            </button>
                                                            {formElements.length > 2 && (
                                                                <button
                                                                    type="button"
                                                                    className="survey-assess-remove-question"
                                                                    onClick={() => removeFormElement(elementIndex)}
                                                                    title="Remove Question"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="survey-assess-question-content">
                                                        {/* Question Type */}
                                                        <div className="survey-assess-form-group">
                                                            <label className="survey-assess-form-label" style={{ marginTop: "10px" }}>Question Type<span className="assess-required">*</span></label>
                                                            <select
                                                                className="survey-assess-form-select"
                                                                value={element.question_type || ''}
                                                                onChange={e => updateFormElementField(elementIndex, 'question_type', e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select Type</option>
                                                                <option value="Multiple Choice">Multiple Choice</option>
                                                                <option value="Multi Select">Multi Select</option>
                                                            </select>
                                                        </div>



                                                        {/* Question Text */}
                                                        <div className="survey-assess-form-group" style={{ marginTop: '20px' }} >
                                                            <label className="survey-assess-form-label">
                                                                Question Text<span className="assess-required">*</span>
                                                            </label>
                                                            <textarea
                                                                className="survey-assess-form-textarea"
                                                                placeholder="Enter your question here..."
                                                                rows={2}
                                                                value={element.question_text || ''}
                                                                onChange={e => updateFormElementField(elementIndex, 'question_text', e.target.value)}
                                                                required
                                                            />
                                                        </div>

                                                        {/* Answer Options */}
                                                        <div className="survey-assess-form-group" style={{ marginTop: '20px' }}>
                                                            <label className="survey-assess-form-label">Answer Options</label>
                                                            {(element.question_type === 'Multiple Choice' || element.question_type === 'Multi Select') && (
                                                                <div className="survey-assess-options-container">
                                                                    {(element.options || []).map((opt, optIndex) => (
                                                                        <div key={optIndex} className="survey-assess-option-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}>
                                                                            <div className="survey-assess-option-index">{getLetterFromIndex(optIndex)}</div>
                                                                            <input
                                                                                type="text"
                                                                                className="survey-assess-form-input"
                                                                                placeholder={`Option ${getLetterFromIndex(optIndex)}`}
                                                                                value={opt}
                                                                                onChange={e => updateOption(elementIndex, optIndex, e.target.value)}
                                                                                required
                                                                            />
                                                                            {element.options.length > 2 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="survey-assess-remove-option"
                                                                                    onClick={() => removeOption(elementIndex, optIndex)}
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {(() => {
                                                                        // Check if all current options are filled (no empty options)
                                                                        const allOptionsFilled = Array.isArray(element.options) &&
                                                                            element.options.every(opt => opt && opt.trim() !== '');

                                                                        // Check if first 2 options are filled (for initial requirement)
                                                                        const firstTwoOptionsFilled = element.options.length >= 2 &&
                                                                            element.options[0] && element.options[0].trim() !== '' &&
                                                                            element.options[1] && element.options[1].trim() !== '';

                                                                        // Only show Add Option if less than 5 options
                                                                        if (element.options.length >= 5) {
                                                                            return null;
                                                                        }

                                                                        // Show button but disabled if validation fails, enabled if validation passes
                                                                        const canAddOption = allOptionsFilled &&
                                                                            (element.options.length <= 2 || firstTwoOptionsFilled);

                                                                        return (
                                                                            <button
                                                                                type="button"
                                                                                className="survey-assess-add-option"
                                                                                onClick={() => addOption(elementIndex)}
                                                                                disabled={!canAddOption}
                                                                                title={!canAddOption ? 'Fill all current options to enable' : undefined}
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Option
                                                                            </button>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Footer actions should be always visible, independent of question_type */}
                                                        <div className="survey-assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                                            {(() => {
                                                                const textOk = !!(element.question_text || '').trim();
                                                                // Check that ALL options are filled (no empty options)
                                                                const allOptionsFilled = Array.isArray(element.options) && element.options.length >= 2 &&
                                                                    element.options.every(opt => opt && opt.trim() !== '');
                                                                const qReady = textOk && allOptionsFilled;
                                                                const hint = qReady ? undefined : allOptionsFilled ?
                                                                    'Enter question text to enable' :
                                                                    'Enter question text and fill all options to enable';
                                                                return (
                                                                    <>
                                                                        <button type="button" className="btn-secondary" onClick={() => addFormElement('question', {}, elementIndex + 1)} disabled={!qReady} title={hint}>
                                                                            <Plus size={14} /> Add Question
                                                                        </button>
                                                                        <button type="button" className="btn-secondary" onClick={() => addFormElement('section', {}, elementIndex + 1)} disabled={!qReady} title={hint}>
                                                                            <Plus size={14} /> Add Section
                                                                        </button>
                                                                        {/* <button
                                                                            type="button"
                                                                            className="survey-assess-btn-primary survey-assess-save-inline"
                                                                            title={qReady ? 'Save and Preview this question' : hint}
                                                                            onClick={() => setQuestionPreviewIndex(elementIndex)}
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
                                            )}

                                            {/* Section Element */}
                                            {element.type === 'section' && (
                                                <div className="survey-assess-question-card">
                                                    <div className="survey-assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                        {(() => {
                                                            const thisSectionOrdinal = formElements.slice(0, elementIndex + 1).filter(el => el.type === 'section').length;
                                                            const totalSections = Math.max(1, (formElements || []).filter(el => el.type === 'section').length);
                                                            return (
                                                                <span className="survey-assess-question-number">{`Section ${thisSectionOrdinal} of ${totalSections}`}</span>
                                                            );
                                                        })()}
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                            {formElements.length > 2 && (
                                                                <button
                                                                    type="button"
                                                                    className="survey-assess-remove-question"
                                                                    onClick={() => removeFormElement(elementIndex)}
                                                                    title="Remove Section"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="survey-assess-section-content">
                                                        <div className="survey-assess-form-group">
                                                            {/* <label className="survey-assess-form-label">Section Description</label> */}
                                                            <RichText
                                                                value={element.description || ''}
                                                                onChange={(html) => updateFormElementField(elementIndex, 'description', html)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="survey-assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                        {(() => {
                                                            const raw = String(element.description || '');
                                                            const plain = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                                                            const ready = plain.length > 0;
                                                            const hint = ready ? undefined : 'Enter section description to enable';
                                                            return (
                                                                <button type="button" className="btn-secondary" onClick={() => addFormElement('question', {}, elementIndex + 1)} disabled={!ready} title={hint}>
                                                                    <Plus size={14} /> Add Question
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>}
                            {/* next info */}
                            {step === 3 && <div className='survey-assess-form-section'>
                                <div className="survey-assess-form-grid">

                                    <div className="survey-assess-form-group">
                                        <label className="survey-assess-form-label">
                                            Team<span className="survey-assess-required">*</span>
                                        </label>
                                        <select
                                            className="survey-assess-form-select"
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

                                    <div className="survey-assess-form-group">
                                        <label className="survey-assess-form-label">
                                            Sub-Team<span className="assess-required">*</span>
                                        </label>
                                        <select
                                            className="survey-assess-form-select"
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
                                <div className="survey-assess-form-grid">
                                    {/* <div className="survey-assess-form-group">
                                        <label className="survey-assess-form-label">
                                            Duration<span className="assess-required">*</span>
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <select
                                                className="survey-assess-form-select"
                                                value={(parseHm(formData.duration).hh * 60) + parseHm(formData.duration).mm}
                                                onChange={e => {
                                                    const mins = parseInt(e.target.value, 10) || 10;
                                                    const hh = Math.floor(mins / 60);
                                                    const mm = mins % 60;
                                                    setFormData({ ...formData, duration: formatHm(hh, mm) });
                                                }}
                                                required
                                            >
                                                <option value={5}>5 mins</option>
                                                <option value={10}>10 mins</option>
                                                <option value={15}>15 mins</option>
                                                <option value={20}>20 mins</option>
                                            </select>
                                        </div>

                                    </div> */}
                                </div>
                            </div>}
                        </div>

                    </div>

                    {/* Form Actions */}
                    <div className="survey-assess-form-actions">
                        {step === 3 ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <button type="button" className="btn-secondary" onClick={handlePrev}>
                                    <ChevronLeft size={16} />Previous
                                </button>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setAssessmentPreviewOpen(true)}
                                        disabled={!canProceedToNext()}
                                        title="Preview the entire assessment as the user sees it"
                                    >
                                        <Eye size={16} />
                                        <span>Preview Survey</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => {
                                            // Force status to Draft, then trigger save/update
                                            setFormData(prev => ({ ...prev, status: 'Draft' }));
                                            setTimeout(() => {
                                                if (currentAssessment) {
                                                    console.log('Updating assessment as draft:', currentAssessment);
                                                    handleUpdateAssessment('Draft');
                                                } else {
                                                    console.log('Creating new assessment as draft');
                                                    handleSaveAssessment(undefined, 'Draft');
                                                }
                                            }, 0);
                                        }}
                                        disabled={!canProceedToNext()}

                                    >
                                        <FileText size={16} />
                                        <span>Save as Draft</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, status: 'Saved' }));
                                            if (currentAssessment) {
                                                console.log('Updating assessment:', currentAssessment);
                                                handleUpdateAssessment('Saved');
                                            } else {
                                                console.log('Creating new assessment');
                                                handleSaveAssessment(undefined, 'Saved');
                                            }
                                        }}
                                        disabled={!canProceedToNext()}
                                    >
                                        <FileText size={16} />
                                        <span>{currentAssessment ? "Update Survey" : "Create Survey"}</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <button type="button" className="btn-secondary" onClick={handlePrev} disabled={step === 1}>
                                    <ChevronLeft size={16} />Previous
                                </button>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                    {step < 3 && <button type="button" className="btn-primary" onClick={handleNext} disabled={!canProceedToNext()}>
                                        Next <ChevronRight size={16} />
                                    </button>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {assessmentPreviewOpen && (
                <SurveyMainPreview
                    isOpen={assessmentPreviewOpen}
                    onClose={() => { setAssessmentPreviewOpen(false); setPreviewResponses({}); }}
                    data={{
                        title: formData.title || 'Untitled Survey',
                        tags: formData.tags,
                        description: formData.description || '',
                        formElements: formElements || [],
                        groups: groups || [],
                        // feedback: feedback || {},
                        team: groups.find(t => String(t._id) === String(formData.team)) || { name: formData.team || '—' },
                        subteam: groups.find(t => String(t._id) === String(formData.team))?.subTeams?.find(st => String(st._id) === String(formData.subteam)) || { name: formData.subteam || '—' },
                        duration: parseInt((formData.duration || '10').split(' ')[0]) || 10,
                        thumbnail_url: formData.thumbnail_url || '',
                        subteamName: groups.find(t => String(t._id) === String(formData.team))?.subTeams?.find(st => String(st._id) === String(formData.subteam))?.name || '—'
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
}
export default QuestionsForm;
;
