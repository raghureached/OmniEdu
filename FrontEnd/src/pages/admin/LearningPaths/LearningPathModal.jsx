import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../../globalAdmin/GlobalModuleManagement/GlobalModuleModal.css';
import './LearningPathModal.css';
import { ChevronLeft, ChevronRight, Plus, Trash2, GripVertical, Package, X, Eye } from 'lucide-react';
import { GoX } from 'react-icons/go';
import { adminfetchContent } from '../../../store/slices/adminModuleSlice';
import { fetchSurveys } from '../../../store/slices/adminSurveySlice';
import { fetchGlobalAssessments } from '../../../store/slices/adminAssessmentSlice';
import { addLearningPath, editLearningPath } from '../../../store/slices/learningPathSlice';
import LearningPathPreview from '../../../components/common/Preview/LearningPathPreview';

const defaultForm = {
  title: '',
  description: '',
  prerequisite: '',
  tagsText: '',
  team: '',
  subteam: '',
  category: '',
  duration: '',
  trainingType: '',
  lessons: [],
  credits: 0,
  badges: 0,
  stars: 0,
  thumbnail: null,
  enforceOrder: true,
  bypassRewards: false,
  enableFeedback: false,
  status: 'Draft',
  version: '1.0',
};

const LearningPathModal = ({ isOpen, onClose, onSave, initialData }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(adminfetchContent());
    dispatch(fetchGlobalAssessments());
    dispatch(fetchSurveys());
  }, [])
  const [form, setForm] = useState(defaultForm);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const { items: contentItems = [] } = useSelector((state) => state.content || {});
  const modulesRaw = Array.isArray(contentItems) ? contentItems.filter((i) => (i.type || '').toLowerCase() === 'module') : [];
  const assessmentsRaw = Array.isArray(contentItems) ? contentItems.filter((i) => (i.type || '').toLowerCase() === 'assessment') : [];
  const surveysRaw = Array.isArray(contentItems) ? contentItems.filter((i) => (i.type || '').toLowerCase() === 'survey') : [];
  const [preview,setPreview] = useState(false);
  // Fallback dummy data if store is empty
  // const modules = modulesRaw.length ? modulesRaw : [
  //   { uuid: 'm-101', type: 'module', title: 'Intro to Programming', },
  //   { uuid: 'm-102', type: 'module', title: 'JavaScript Basics' },
  //   { uuid: 'm-103', type: 'module', title: 'React Fundamentals' },
  // ];
  const { items: modules } = useSelector((state) => state.adminModule);
  const { assessments } = useSelector((state) => state.adminAssessments)
  const { surveys } = useSelector((state) => state.surveys || {});
  const [selectedModules, setSelectedModules] = useState([]); // ids
  const [selectedAssessments, setSelectedAssessments] = useState([]); // ids
  const [selectedSurveys, setSelectedSurveys] = useState([]); // ids
  const [search, setSearch] = useState({ module: '', assessment: '', survey: '' });

  // Ordered builder items for Step 2, each item: {type: 'module'|'assessment'|'survey', id, title}
  const [pathItems, setPathItems] = useState([]);
  const [adding, setAdding] = useState(false); // deprecated inline panel flag (kept for safety)
  const [addType, setAddType] = useState('module'); // deprecated
  const [addSearch, setAddSearch] = useState(''); // deprecated
  const [previewData, setPreviewData] = useState(null);
  // Picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState('module');
  const [pickerSearch, setPickerSearch] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  // Modal to choose number of questions for an assessment when adding
  const [assessmentQtyModal, setAssessmentQtyModal] = useState({ open: false, item: null, qty: 1 });
  // Tag management state
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  // Always use uuid as the identifier
  const itemsByType = {
    module: (modules || []).map(m => ({ id: m._id, title: m.title })),
    assessment: (assessments || []).map(a => ({
      id: a._id,
      title: a.title,
      // total questions and duration from the provided shape
      totalQuestions: Array.isArray(a?.questions) ? a.questions.length : (a?.totalQuestions || 0),
      duration: Number(a?.duration) || undefined,
      attempts: a?.attempts,
      unlimited_attempts: !!a?.unlimited_attempts,
      percentage_to_pass: a?.percentage_to_pass,
      display_answers: a?.display_answers,
    })),
    survey: (surveys || []).map(s => ({ id: s._id, title: s.title })),
  };

  // Auto-compute total duration from selected items (modules/assessments/surveys)
  useEffect(() => {
    if (!Array.isArray(pathItems) || (!modules && !assessments && !surveys)) return;
    const sum = pathItems.reduce((acc, it) => {
      try {
        if (it.type === 'assessment') {
          const a = (assessments || []).find(x => x._id === it.id);
          if (!a) return acc;
          const total = Array.isArray(a.questions) ? a.questions.length : 0;
          const perQ = total ? (Number(a.duration) || 0) / total : 0;
          const qty = Number(it.questions) || total;
          return acc + (perQ * qty);
        }
        if (it.type === 'module') {
          const m = (modules || []).find(x => x._id === it.id);
          return acc + (Number(m?.duration) || 0);
        }
        if (it.type === 'survey') {
          const s = (surveys || []).find(x => x._id === it.id);
          return acc + (Number(s?.duration) || 0);
        }
        return acc;
      } catch {
        return acc;
      }
    }, 0);
    // Only update when value actually changes to avoid unnecessary renders
    setForm(prev => (Number(prev.duration) !== Math.round(sum) ? { ...prev, duration: Math.round(sum) } : prev));
  }, [pathItems, modules, assessments, surveys]);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        prerequisite: initialData.prerequisite ?? '',
        tagsText: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tagsText ?? ''),
        team: initialData.team ?? '',
        subteam: initialData.subteam ?? '',
        category: initialData.category ?? '',
        duration: initialData.duration ?? '',
        trainingType: initialData.trainingType ?? '',
        credits: initialData.credits ?? 0,
        badges: initialData.badges ?? 0,
        stars: initialData.stars ?? 0,
        thumbnail: initialData.thumbnail ?? null,
        enforceOrder: initialData.enforceOrder ?? true,
        bypassRewards: initialData.bypassRewards ?? false,
        enableFeedback: initialData.enableFeedback ?? false,
        status: initialData.status ?? 'Draft',
        version: initialData.version ?? '1.0',
      }));
      // preload selections if present
      if (Array.isArray(initialData.modules)) setSelectedModules(initialData.modules);
      if (Array.isArray(initialData.assessments)) setSelectedAssessments(initialData.assessments);
      if (Array.isArray(initialData.surveys)) setSelectedSurveys(initialData.surveys);
      // preload ordered items: prefer unified lessons, then legacy pathItems, else derive from arrays
      if (Array.isArray(initialData.lessons) && initialData.lessons.length) {
        const normalized = initialData.lessons
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((l) => {
            const type = (l.type || '').toLowerCase();
            let title = l.title;
            if (!title && type && l.id) {
              const src = itemsByType[type] || [];
              const found = src.find((x) => x.id === l.id);
              if (found) title = found.title;
            }
            return { type, id: l.id, title: title || 'Untitled' };
          });
        setPathItems(normalized);
      } else if (Array.isArray(initialData.pathItems) && initialData.pathItems.length) {
        setPathItems(initialData.pathItems);
      } else {
        const combined = [];
        (initialData.modules || []).forEach(id => {
          const found = itemsByType.module.find(x => x.id === id);
          if (found) combined.push({ type: 'module', id, title: found.title });
        });
        (initialData.assessments || []).forEach(id => {
          const found = itemsByType.assessment.find(x => x.id === id);
          if (found) combined.push({ type: 'assessment', id, title: found.title });
        });
        (initialData.surveys || []).forEach(id => {
          const found = itemsByType.survey.find(x => x.id === id);
          if (found) combined.push({ type: 'survey', id, title: found.title });
        });
        setPathItems(combined);
      }
      // Load tags
      if (Array.isArray(initialData.tags)) {
        setTags(initialData.tags);
      } else if (initialData.tagsText) {
        setTags(initialData.tagsText.split(',').map(t => t.trim()).filter(Boolean));
      }
    } else {
      setForm(defaultForm);
      setCurrentStep(1);
      setSelectedModules([]);
      setSelectedAssessments([]);
      setSelectedSurveys([]);
      setPathItems([]);
      setTags([]);
      setTagInput('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files && files[0] ? files[0] : null }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canProceed = () => {
    // switch (currentStep) {
    //   case 1:
    //     return form.title.trim().length > 0 && form.description.trim().length > 0;
    //   case 2:
    //     return true; // cover image optional
    //   case 3:
    //     return true;
    //   default:
    //     return true;
    // }
    return true;
  };

  /* Tag handlers */
  const handleTagInputChange = (e) => setTagInput(e.target.value);
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setTagInput('');
    }
  };
  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
  };
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    // derive arrays by type from ordered pathItems to keep consistency
    const mods = pathItems.filter(i => i.type === 'module').map(i => i.id);
    const asmt = pathItems.filter(i => i.type === 'assessment').map(i => i.id);
    const surv = pathItems.filter(i => i.type === 'survey').map(i => i.id);
    // unified ordered lessons array
    const lessons = pathItems.map((it, index) => ({ id: it.id, type: it.type, title: it.title, order: index, ...(it.type === 'assessment' ? { questions: Number(it.questions) || undefined } : {}) }));
    const payload = {
      ...form,
      tags,
      lessons,
    };
    
    dispatch(addLearningPath(payload));
    // onSave(payload);
  };
  const handleEdit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    // derive arrays by type from ordered pathItems to keep consistency
    const mods = pathItems.filter(i => i.type === 'module').map(i => i.id);
    const asmt = pathItems.filter(i => i.type === 'assessment').map(i => i.id);
    const surv = pathItems.filter(i => i.type === 'survey').map(i => i.id);
    // unified ordered lessons array
    const lessons = pathItems.map((it, index) => ({ id: it.id, type: it.type, title: it.title, order: index, ...(it.type === 'assessment' ? { questions: Number(it.questions) || undefined } : {}) }));
    const payload = {
      ...initialData,
      ...form,
      tags,
      lessons,
    };
    console.log(payload);
    dispatch(editLearningPath({uuid: initialData.uuid, ...payload}));
    // onSave(payload);
  };

  const removeCover = () => setForm((p) => ({ ...p, thumbnail: null }));

  return (
    <div className="addOrg-modal-overlay lp-fixed" role="dialog" aria-modal="true" aria-labelledby="lpModalTitle">
      <div className="module-overlay__content">
        {/* HEADER */}
        <div className="module-overlay__header">
          <div>
            <h2 id="lpModalTitle" className="module-overlay__title">{initialData ? 'Edit Learning Path' : 'Create Learning Path'}</h2>
            <p className="module-overlay__step-indicator">Step {currentStep} of {totalSteps} : {currentStep === 1 ? 'Basic Information' : currentStep === 2 ? 'Select Content' : 'Meta & Configuration'}</p>
          </div>
          <button type="button" className="addOrg-close-btn" aria-label="Close" onClick={onClose}>
            <GoX size={20} />
          </button>
        </div>

        <div className="module-overlay__progress">
          <div className="module-overlay__progress-bar" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit}>
          <div className="module-overlay__body" style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 180px)' }}>
            {currentStep === 1 && (
              <div className="module-overlay__step">
                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Title <span className="module-overlay__required">*</span></label>
                  <input className="addOrg-form-input" type="text" name="title" value={form.title} onChange={handleChange} placeholder="Enter learning path name" autoComplete="off" required style={{ width: '100%' }} />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Description <span className="module-overlay__required">*</span></label>
                  <textarea className="addOrg-form-input" name="description" value={form.description} onChange={handleChange} placeholder="Enter detailed description" rows={4} style={{ width: '100%' }} />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Prerequisites<span className="module-overlay__required">*</span></label>
                  <input className="addOrg-form-input" type="text" name="prerequisite" value={form.prerequisite} onChange={handleChange} placeholder="Enter prerequisites" autoComplete="off" style={{ width: '100%' }} />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Tags<span className="module-overlay__required">*</span></label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    className="addOrg-form-input"
                    placeholder="Type a tag and press Enter or comma"
                    autoComplete="off"
                    style={{ width: '100%' }}
                  />
                  <div className="module-overlay__tags-container">
                    {tags.map((tag, index) => (
                      <span key={index} className="module-overlay__tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="module-overlay__tag-remove"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Thumbnail<span className="module-overlay__required">*</span></label>
                  <input id="lpCoverImage" type="file" name="thumbnail" onChange={handleChange} accept="image/*" style={{ display: 'none' }} />
                  {form.thumbnail ? (
                    <div className="module-overlay__uploaded-file-container">
                      <span className="module-overlay__uploaded-file-name" title={typeof form.thumbnail === 'string' ? form.thumbnail.split('/').pop() : form.thumbnail.name}>
                        {typeof form.thumbnail === 'string' ? form.thumbnail.split('/').pop() : form.thumbnail.name}
                      </span>
                      <div className="module-overlay__file-actions">
                        <button type="button" className="module-overlay__btn-delete" onClick={removeCover}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="lpCoverImage" className="module-overlay__upload-label">Upload Image</label>
                  )}
                  {/* <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Recommended size: 1200x600px</div> */}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="module-overlay__step">
                {/* Builder: Main Path card */}
                {/* <div className="module-overlay__form-group">
                  <div className="lp-main-card">
                    <div className="lp-main-card__title">Main Learning Path</div>
                    <div className="lp-main-card__subtitle">Add modules, assessments, and surveys in the intended order.</div>
                  </div>
                </div> */}

                {/* Added items list */}
                <div className="module-overlay__form-group">
                  <div className="lp-added-list">
                    {pathItems.length === 0 && (
                      <div className="lp-empty">
                        <Package size={40} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.5 }} />
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>No items added yet</div>
                        <div style={{ fontSize: '0.85rem' }}>Click the "+ Add item" button below to start building your learning path</div>
                      </div>
                    )}
                    {pathItems.map((item, idx) => (
                      <div
                        key={`${item.type}-${item.id}-${idx}`}
                        className={`lp-item lp-item--${item.type} ${dragOverIndex === idx ? 'lp-item--over' : ''} ${dragIndex === idx ? 'lp-item--dragging' : ''}`}
                        draggable
                        onDragStart={() => setDragIndex(idx)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragIndex === null || dragIndex === idx) { setDragIndex(null); setDragOverIndex(null); return; }
                          setPathItems((prev) => {
                            const updated = [...prev];
                            const [moved] = updated.splice(dragIndex, 1);
                            updated.splice(idx, 0, moved);
                            return updated;
                          });
                          setDragIndex(null);
                          setDragOverIndex(null);
                        }}
                        onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                      >
                        <span className="lp-item__drag" aria-hidden>
                          <GripVertical size={16} />
                        </span>
                        <div className="lp-item__badge">{item.type}</div>
                        <div className="lp-item__title">{item.title}</div>
                        <button type="button" className="lp-item__remove" onClick={() => setPathItems(p => p.filter((_, i) => i !== idx))}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {/* Plus button */}
                    <button type="button" className="lp-add-btn" onClick={() => { setPickerOpen(true); setPickerType('module'); setPickerSearch(''); }}>
                      <Plus size={18} /> Add item
                    </button>
                  </div>
                </div>

                {/* Nested Picker Modal */}
                {pickerOpen && (
                  <div className="module-overlay lp-picker" role="dialog" aria-modal="true">
                    <div className="module-overlay__content">
                      <div className="module-overlay__header">
                        <div>
                          <h3 className="module-overlay__title">Select Item</h3>
                          <p className="module-overlay__step-indicator">Choose type, search and click an item to add</p>
                        </div>
                        <button type="button" className="module-overlay__close" aria-label="Close" onClick={() => setPickerOpen(false)}>✕</button>
                      </div>
                      <div className="module-overlay__body">
                        {/* Type tabs */}
                        <div className="lp-tabs">
                          {['module', 'assessment', 'survey'].map(t => (
                            <button
                              key={t}
                              type="button"
                              className={`lp-tab ${pickerType === t ? 'active' : ''}`}
                              onClick={() => { setPickerType(t); setPickerSearch(''); }}
                            >
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>

                        {/* Search */}
                        <div className="module-overlay__form-group">
                          <input
                            className="addOrg-form-input"
                            type="text"
                            placeholder={`Search ${pickerType}s`}
                            value={pickerSearch}
                            onChange={(e) => setPickerSearch(e.target.value)}
                          />
                        </div>

                        {/* List */}
                        <div className="lp-picker-list">
                          {itemsByType[pickerType]
                            .filter(x => !pickerSearch || (x.title || '').toLowerCase().includes(pickerSearch.toLowerCase()))
                            .map(x => {
                              const isSelected = pathItems.some(it => it.type === pickerType && it.id === x.id);
                              return (
                                <button
                                  key={x.id}
                                  type="button"
                                  className={`lp-picker-row ${isSelected ? 'lp-picker-row--disabled' : ''}`}
                                  disabled={isSelected}
                                  aria-disabled={isSelected}
                                  onClick={() => {
                                    if (isSelected) return;
                                    if (pickerType === 'assessment') {
                                      const src = itemsByType.assessment.find(a => a.id === x.id);
                                      const total = src?.totalQuestions || 1;
                                      setAssessmentQtyModal({
                                        open: true,
                                        item: {
                                          id: x.id,
                                          title: x.title,
                                          total,
                                          duration: src?.duration,
                                          attempts: src?.attempts,
                                          unlimited_attempts: src?.unlimited_attempts,
                                          percentage_to_pass: src?.percentage_to_pass,
                                          display_answers: src?.display_answers,
                                        },
                                        qty: Math.min(total, Math.max(1, Number(assessmentQtyModal.qty) || total))
                                      });
                                    } else {
                                      const newItem = { type: pickerType, id: x.id, title: x.title };
                                      setPathItems(prev => [...prev, newItem]);
                                      setPickerOpen(false);
                                    }
                                  }}
                                  title={isSelected ? 'Already added' : 'Add to path'}
                                >
                                  <span className={`lp-chip lp-chip--${pickerType}`}>{pickerType}</span>
                                  <span className="lp-picker-title">{x.title}</span>
                                  {/* <span className='lp-picker-meta'>{x.badges} badge</span> */}
                                  {pickerType === 'assessment' && typeof x.totalQuestions !== 'undefined' && (
                                    <span className="lp-picker-meta" style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>{x.totalQuestions} Qs</span>
                                  )}
                                  {isSelected && <span className="lp-picker-status">(Selected)</span>}
                                </button>
                              );
                            })}
                          {itemsByType[pickerType].length === 0 && (
                            <div className="lp-empty">No items available</div>
                          )}
                        </div>
                      </div>
                      <div className="module-overlay__footer" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-secondary" onClick={() => setPickerOpen(false)}>Close</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Summary */}
                <div className="module-overlay__form-group">
                  {(() => {
                    const moduleCount = pathItems.filter((it) => it.type === 'module').length;
                    const assessmentCount = pathItems.filter((it) => it.type === 'assessment').length;
                    const totalDuration = Number(form.duration || 0);
                    return (
                      <div className="lp-summary">
                        <div className="lp-summary__title">Live Summary</div>
                        <div className="lp-summary__divider" />
                        <div className="lp-summary__section">
                          <div className="lp-summary__section-title">Content</div>
                          <div className="lp-summary__section-body">{moduleCount} Module{moduleCount === 1 ? '' : 's'}, {assessmentCount} Assessments</div>
                        </div>
                        <div className="lp-summary__section">
                          <div className="lp-summary__section-title">Total Duration</div>
                          <div className="lp-summary__section-body">{totalDuration} minutes</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="module-overlay__step">
                {/* Row 1: Duration, Credits, Stars, Badges */}
                <div className="lp-grid-4">
                  <div className="module-overlay__form-group">
                    <label className="module-overlay__form-label">Duration (in minutes)</label>
                    <input className="addOrg-form-input" type="number" min={0} name="duration" value={form.duration} onChange={handleChange} placeholder={form.duration || 'Auto computed'} disabled />
                  </div>
                  <div className="module-overlay__form-group">
                    <label className="module-overlay__form-label">Credits</label>
                    <input className="addOrg-form-input" type="number" min={0} name="credits" value={form.credits} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="module-overlay__form-group">
                    <label className="module-overlay__form-label">Stars</label>
                    <input className="addOrg-form-input" type="number" min={0} name="stars" value={form.stars} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="module-overlay__form-group">
                    <label className="module-overlay__form-label">Badges</label>
                    <input className="addOrg-form-input" type="number" min={0} name="badges" value={form.badges} onChange={handleChange} placeholder="0" />
                  </div>
                </div>

                {/* Row 2: Category, Training Type, Target Team/Sub Team */}
                <div className="module-overlay__form-group" style={{ marginTop: 24 }}>
                  <div className="lp-grid-3">
                    <div>
                      <label className="module-overlay__form-label">Category <span className="module-overlay__required">*</span></label>
                      <select className="addOrg-form-input" name="category" value={form.category} onChange={handleChange} style={{ width: '100%' }}>
                        <option value="">Select Category</option>
                        <option value="technical">Technical Skills</option>
                        <option value="soft">Soft Skills</option>
                        <option value="compliance">Compliance</option>
                        <option value="leadership">Leadership</option>
                      </select>
                    </div>
                    <div>
                      <label className="module-overlay__form-label">Training Type <span className="module-overlay__required">*</span></label>
                      <select className="addOrg-form-input" name="trainingType" value={form.trainingType} onChange={handleChange} style={{ width: '100%' }}>
                        <option value="">Select Training Type</option>
                        <option value="Mandatory Training">Mandatory Training</option>
                        <option value="Continuous Learning">Continuous Learning</option>
                        <option value="Micro Learning/Learning Byte">Micro Learning/Learning Byte</option>
                        <option value="Initial/Onboarding Training">Initial/Onboarding Training</option>
                      </select>
                    </div>
                    <div>
                      <label className="module-overlay__form-label">Target Team/Sub Team <span className="module-overlay__required">*</span></label>
                      <div className="lp-grid-2">
                        <select className="addOrg-form-input" name="team" value={form.team} onChange={handleChange} style={{ width: '100%' }}>
                          <option value="">Team</option>
                          <option value="engineering">Engineering</option>
                          <option value="sales">Sales</option>
                          <option value="marketing">Marketing</option>
                          <option value="hr">Human Resources</option>
                        </select>
                        <select className="addOrg-form-input" name="subteam" value={form.subteam} onChange={handleChange} style={{ width: '100%' }}>
                          <option value="">Sub-team</option>
                          <option value="frontend">Frontend</option>
                          <option value="backend">Backend</option>
                          <option value="devops">DevOps</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Config checkboxes */}
                <div className="module-overlay__form-group" style={{ marginTop: 24 }}>
                  <label className="module-overlay__form-label" style={{ marginBottom: 12 }}>Configuration</label>
                  <div className="module-overlay__checkbox">
                    <input type="checkbox" id="enforceOrder" name="enforceOrder" checked={!!form.enforceOrder} onChange={handleChange} />
                    <label htmlFor="enforceOrder">Enforce path order</label>
                  </div>
                  {form.enforceOrder && <div className="lp-info-box">
                    Learners must complete elements sequentially in the order defined in Step 2.
                  </div>}
                  <div className="module-overlay__checkbox">
                    <input type="checkbox" id="bypassRewards" name="bypassRewards" checked={!!form.bypassRewards} onChange={handleChange} />
                    <label htmlFor="bypassRewards">Bypass individual rewards</label>
                  </div>
                  <div className="module-overlay__checkbox">
                    <input type="checkbox" id="enableFeedback" name="enableFeedback" checked={!!form.enableFeedback} onChange={handleChange} />
                    <label htmlFor="enableFeedback">Enable feedback/reactions</label>
                  </div>
                </div>
              </div>
            )}
          </div>
          {assessmentQtyModal.open && (() => {
            const total = Math.max(1, assessmentQtyModal.item?.total || 1);
            const rawPerQ = Number(assessmentQtyModal.item?.duration) && total ? Number(assessmentQtyModal.item.duration) / total : 5;
            const perQuestionMin = Math.max(0.1, rawPerQ);
            const qty = Math.min(total, Math.max(1, Number(assessmentQtyModal.qty) || 1));
            const est = Math.round(perQuestionMin * qty * 10) / 10;
            const perQText = (Math.round(perQuestionMin * 10) / 10).toFixed(1).replace(/\.0$/, '');
            const attemptsText = assessmentQtyModal.item?.unlimited_attempts ? 'Unlimited' : (assessmentQtyModal.item?.attempts ?? '—');
            const passPctText = typeof assessmentQtyModal.item?.percentage_to_pass === 'number' ? `${assessmentQtyModal.item.percentage_to_pass}%` : '—';
            const answersPolicy = assessmentQtyModal.item?.display_answers || '—';
            return (
              <div className="module-overlay lp-picker" role="dialog" aria-modal="true">
                <div className="module-overlay__content" style={{ maxWidth: 560 }}>
                  <div className="module-overlay__header">
                    <div>
                      <h3 className="module-overlay__title">Assessment Configuration</h3>
                      <p className="module-overlay__step-indicator">{assessmentQtyModal.item?.title}</p>
                    </div>
                    <button type="button" className="module-overlay__close" aria-label="Close" onClick={() => setAssessmentQtyModal({ open: false, item: null, qty: 1 })}>✕</button>
                  </div>
                  <div className="module-overlay__body" style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                    <div style={{ fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>Number of Questions to Include</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        className="addOrg-form-input"
                        style={{ maxWidth: 120 }}
                        type="number"
                        min={1}
                        max={total}
                        value={qty}
                        onChange={(e) => {
                          const valNum = Math.min(total, Math.max(1, parseInt(e.target.value || '1', 10)));
                          setAssessmentQtyModal(prev => ({ ...prev, qty: valNum }));
                        }}
                      />
                      <div style={{ color: '#6b7280' }}>Max: {total} questions ({perQText} min/Q)</div>
                    </div>
                    <div style={{ color: '#16a34a', fontWeight: 700, marginTop: 10 }}>
                      Est. duration: {est} minute{est === 1 ? '' : 's'} for {qty} question{qty === 1 ? '' : 's'}.
                    </div>
                    <div style={{ height: 1, background: '#e5e7eb', margin: '14px 0' }} />
                    <div style={{ background: '#fff7ed', border: '1px solid #f59e0b', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 6 }}>🔒 Locked Properties</div>
                      <div style={{ color: '#92400e' }}>The following properties are configured at the assessment level and cannot be changed here:</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18, color: '#92400e' }}>
                        <li>Number of attempts allowed </li>
                        <li>Pass percentage required </li>
                        <li>When to display correct answers </li>
                      </ul>
                    </div>
                  </div>
                  <div className="module-overlay__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button type="button" className="btn-secondary" onClick={() => setAssessmentQtyModal({ open: false, item: null, qty: 1 })}>Cancel</button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        if (!assessmentQtyModal.item) return;
                        const { id, title } = assessmentQtyModal.item;
                        const newItem = { type: 'assessment', id, title, questions: qty };
                        setPathItems(prev => [...prev, newItem]);
                        setAssessmentQtyModal({ open: false, item: null, qty: 1 });
                        setPickerOpen(false);
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
          {preview && <LearningPathPreview isOpen={preview} onClose={() => setPreview(false)} data={previewData} />}
          {/* FOOTER */}
          <div className="module-overlay__footer" style={{ padding: '10px' }}>
            <div className="module-overlay__step-navigation">
              <button type="button" className="btn-secondary" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} disabled={currentStep === 1}>
                <ChevronLeft size={20} />Previous
              </button>

              {currentStep < totalSteps ? (
                <button type="button" className="btn-primary" onClick={() => canProceed() && setCurrentStep((s) => Math.min(totalSteps, s + 1))} disabled={!canProceed()}>
                  Next <ChevronRight size={20} />
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type='button' className="btn-secondary" onClick={() => {
                    const lessons = pathItems.map((it, index) => ({
                      id: it.id,
                      type: it.type,
                      title: it.title,
                      order: index,
                      ...(it.type === 'assessment' ? { questions: Number(it.questions) || undefined } : {})
                    }));
                    const payload = { ...form, tags, lessons };
                    setPreviewData(payload);
                    setPreview(true);
                  }}><Eye size={20} />Preview</button>
                  <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn-primary" onClick={(e) => initialData ? handleEdit(e) : handleSubmit(e)}>{initialData ? 'Save Changes' : 'Create'}</button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>

  );
};

export default LearningPathModal;
