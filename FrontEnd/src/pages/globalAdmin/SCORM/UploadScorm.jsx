import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { GoBook, GoX } from "react-icons/go";
import CustomSelect from "../../../components/dropdown/DropDown";
import { categories } from "../../../utils/constants";
import { notifyError, notifySuccess } from "../../../utils/notification";
import api from "../../../services/api";

const ScormModuleModal = ({ showModal, setShowModal, teams, onSuccess, mode = 'create', module = null }) => {
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);

  const [learningOutcomes, setLearningOutcomes] = useState([""]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [scormFile, setScormFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    prerequisites: "",
    duration: "",
    credits: "2",
    stars: "0",
    badges: "0",
    category: "",
    team: "",
    subteam: "",
    status: "Draft"
  });

  useEffect(() => {
    if (!showModal) return;

    if (mode === 'edit' && module) {
      setCurrentStep(1);
      setScormFile(null);
      setTags(Array.isArray(module?.tags) ? module.tags : []);
      setLearningOutcomes(Array.isArray(module?.learning_outcomes) ? (module.learning_outcomes.length ? module.learning_outcomes : [""]) : [""]);

      const prerequisitesValue = Array.isArray(module?.prerequisites)
        ? module.prerequisites.join(', ')
        : (module?.prerequisites ? String(module.prerequisites) : '');

      setForm({
        title: module?.title || "",
        description: module?.description || "",
        prerequisites: prerequisitesValue,
        duration: module?.duration || "",
        credits: String(module?.credits ?? "2"),
        stars: String(module?.stars ?? "0"),
        badges: String(module?.badges ?? "0"),
        category: module?.category || "",
        team: module?.team?._id || module?.team || "",
        subteam: module?.subteam?._id || module?.subteam || "",
        status: module?.status || "Draft"
      });
      return;
    }

    setCurrentStep(1);
    setLearningOutcomes([""]);
    setTags([]);
    setTagInput("");
    setScormFile(null);
    setForm({
      title: "",
      description: "",
      prerequisites: "",
      duration: "",
      credits: "2",
      stars: "0",
      badges: "0",
      category: "",
      team: "",
      subteam: "",
      status: "Draft"
    });
  }, [showModal, mode, module]);

  if (!showModal) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveFile = () => {
    setScormFile(null);
  };

  const addLearningOutcome = () =>
    setLearningOutcomes((prev) => [...prev, ""]);

  const updateLearningOutcome = (index, value) => {
    const updated = [...learningOutcomes];
    updated[index] = value;
    setLearningOutcomes(updated);
  };

  const removeLearningOutcome = (index) => {
    setLearningOutcomes((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };


  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          form.title &&
          form.description &&
          learningOutcomes.length > 0 &&
          tags.length > 0 &&
          form.prerequisites
        );
      case 2:
        return mode === 'edit' ? true : scormFile;
      case 3:
        return form.duration && form.category && form.team;
      default:
        return false;
    }
  };


  const handleSubmit = async () => {
    try {
      setUploading(true);

      if (mode === 'edit') {
        if (!module?._id) {
          notifyError('Missing module id');
          return;
        }

        const prerequisitesArr = String(form.prerequisites || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        await api.put(`/api/scorm/${module._id}`, {
          title: form.title,
          description: form.description,
          tags,
          team: form.team || null,
          subteam: form.subteam || null,
          category: form.category || null,
          credits: Number(form.credits) || 2,
          prerequisites: prerequisitesArr,
          learningOutcomes,
          status: form.status || 'Draft'
        },
      {headers: {"Content-Type": "application/json"}});

        notifySuccess('SCORM module updated successfully');
      } else {
        const fd = new FormData();
        fd.append("file", scormFile);

        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("prerequisites", form.prerequisites);
        fd.append("learningOutcomes", JSON.stringify(learningOutcomes));
        fd.append("tags", JSON.stringify(tags));
        fd.append("duration", form.duration);
        fd.append("credits", form.credits);
        fd.append("stars", form.stars);
        fd.append("badges", form.badges);
        fd.append("category", form.category);
        fd.append("team", form.team);
        fd.append("subteam", form.subteam);
        fd.append("status", form.status || "Draft");

        await api.post("/api/scorm/upload", fd,{headers: {"Content-Type": "multipart/form-data"}});
        notifySuccess("SCORM module created successfully");
      }

      setShowModal(false);
      onSuccess?.();
    } catch (err) {
      notifyError(mode === 'edit' ? 'Failed to update SCORM module' : "Failed to create SCORM module");
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="addOrg-modal-overlay" role="dialog" aria-modal="true">
      <div className="addOrg-modal-content">
        {/* HEADER */}
        <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <GoBook size={24} color="#5570f1" />
            </div>
            <div>
              <h2>{mode === 'edit' ? 'Edit SCORM Module' : 'Add SCORM Module'}</h2>
              <p className="addOrg-header-subtitle">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
          <button
            className="addOrg-close-btn"
            onClick={() => setShowModal(false)}
          >
            <GoX size={20} />
          </button>
        </div>

        {/* PROGRESS */}
        <div className="module-overlay__progress">
          <div
            className="module-overlay__progress-bar"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* BODY */}
        <div
          className="module-overlay__body"
          style={{ overflowY: "auto", height: "calc(100vh - 180px)" }}
        >
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="module-overlay__step">
              <div className="module-overlay__form-group">
                <label className="module-overlay__form-label">
                  Title <span className="module-overlay__required">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="addOrg-form-input"
                  style={{ width: "100%" }}
                  placeholder="Title"
                />
              </div>

              <div className="module-overlay__form-group">
                <label className="module-overlay__form-label">
                  Description <span className="module-overlay__required">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className="addOrg-form-input"
                  style={{ width: "100%" }}
                  placeholder="Description"
                />
              </div>

              <div className="module-overlay__form-group">
                <label className="module-overlay__form-label">
                  Learning Outcomes <span className="module-overlay__required">*</span>
                </label>
                {learningOutcomes.map((o, i) => (
                  <div key={i} className="module-overlay__learning-outcome-item">
                    <input
                      value={o}
                      onChange={(e) =>
                        updateLearningOutcome(i, e.target.value)
                      }
                      className="addOrg-form-input"
                      style={{ width: "100%" }}
                      placeholder="Learning Outcome"
                    />
                    {learningOutcomes.length > 1 && (
                      <button
                        type="button"
                        className="addOrg-close-btn"
                        onClick={() => removeLearningOutcome(i)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button className="add-btn" onClick={addLearningOutcome}>
                  <Plus size={16} /> Add Learning Outcome
                </button>
              </div>

              <div className="module-overlay__form-group">
                <label className="module-overlay__form-label">
                  Tags <span className="module-overlay__required">*</span>
                </label>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  className="addOrg-form-input"
                  style={{ width: "100%" }}
                />
                <div className="module-overlay__tags-container">
                  {tags.map((t) => (
                    <span key={t} className="module-overlay__tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="module-overlay__form-group">
                <label className="module-overlay__form-label">
                  Prerequisites <span className="module-overlay__required">*</span>
                </label>
                <input
                  name="prerequisites"
                  value={form.prerequisites}
                  onChange={handleChange}
                  className="addOrg-form-input"
                  style={{ width: "100%" }}
                  placeholder="Prerequisites"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="module-overlay__step">
              <div className="module-overlay__form-group">
                <div>
                  <label className="module-overlay__form-label">Upload File (zip)<span className='module-overlay__required'>*</span></label>

                  {mode === 'edit' ? (
                    <div className="addOrg-form-input" style={{ width: '100%', padding: '10px 12px' }}>
                      SCORM package cannot be changed in edit mode.
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        name="primaryFile"
                        onChange={(e) => setScormFile(e.target.files[0])}
                        style={{ display: 'none' }}
                        accept=".zip"
                        id="uploadFiles"
                      />
                      {scormFile ? (
                        <div className="module-overlay__uploaded-file-container">
                          <span className="module-overlay__uploaded-file-name" title={scormFile?.name}>
                            {scormFile?.name}
                          </span>
                          <div className="module-overlay__file-actions">
                            <button
                              type="button"
                              className="module-overlay__btn-delete"
                              onClick={handleRemoveFile}
                              aria-label="Delete uploaded file"
                            >
                              <RiDeleteBin2Fill size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="uploadFiles" className="module-overlay__upload-label" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter') document.getElementById('uploadFiles').click(); }}>
                          <Plus size={16} /> Upload File
                        </label>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="module-overlay__step">
              <div className="module-overlay__form-row">
                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">
                    Duration <span className="module-overlay__required">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="addOrg-form-input"
                    placeholder="Duration"
                    style={{ width: "200px" }}
                  />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Credits</label>
                  <CustomSelect
                    value={form.credits}
                    options={[..."0123456789"].map((n) => ({
                      value: n,
                      label: n
                    }))}
                    onChange={(v) =>
                      setForm((p) => ({ ...p, credits: v }))
                    }
                    searchable={false}
                    placeholder="Credits"

                  />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Stars</label>
                  <CustomSelect
                    value={form.stars}
                    options={[..."0123456789"].map((n) => ({
                      value: n,
                      label: n
                    }))}
                    onChange={(v) =>
                      setForm((p) => ({ ...p, stars: v }))
                    }
                    searchable={false}
                    placeholder="Stars"
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Badges</label>
                  <CustomSelect
                    value={form.badges}
                    options={[..."0123456789"].map((n) => ({
                      value: n,
                      label: n
                    }))}
                    onChange={(v) =>
                      setForm((p) => ({ ...p, badges: v }))
                    }
                    searchable={false}
                    placeholder="Badges"
                  />
                </div>
              </div>

              <div className="module-overlay__form-row">
                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">Status</label>
                  <CustomSelect
                    value={form.status}
                    options={[
                      { value: 'Draft', label: 'Draft' },
                      { value: 'Published', label: 'Published' }
                    ]}
                    onChange={(v) => setForm((p) => ({ ...p, status: v }))}
                    searchable={false}
                    placeholder="Status"
                  />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">
                    Category <span className="module-overlay__required">*</span>
                  </label>
                  <CustomSelect
                    value={form.category}
                    options={[
                      { value: "", label: "Select Category" },
                      ...categories.map((c) => ({
                        value: c,
                        label: c
                      }))
                    ]}
                    onChange={(v) =>
                      setForm((p) => ({ ...p, category: v }))
                    }
                    placeholder="Category"
                  />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">
                    Team <span className="module-overlay__required">*</span>
                  </label>
                  <CustomSelect
                    value={form.team}
                    options={[
                      { value: "", label: "Select Team" },
                      ...teams.map((t) => ({
                        value: t._id,
                        label: t.name
                      }))
                    ]}
                    onChange={(v) =>
                      setForm((p) => ({ ...p, team: v, subteam: "" }))
                    }
                    placeholder="Team"
                  />
                </div>

                <div className="module-overlay__form-group">
                  <label className="module-overlay__form-label">
                    Subteam
                  </label>
                  <CustomSelect
                    value={form.subteam}
                    options={[
                      { value: "", label: "All Subteams" },
                      ...(teams
                        .find((t) => t._id === form.team)
                        ?.subTeams?.map((s) => ({
                          value: s._id,
                          label: s.name
                        })) || [])
                    ]}
                    onChange={(v) =>
                      setForm((p) => ({ ...p, subteam: v }))
                    }
                    disabled={!form.team}
                    placeholder="Subteam"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="module-overlay__footer">
          <div className="module-overlay__step-navigation">
            <button
              className="btn-secondary"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                className="btn-primary"
                disabled={!canProceed()}
                onClick={() => setCurrentStep((s) => s + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="btn-primary"
                disabled={!canProceed() || uploading}
                onClick={handleSubmit}
              >
                {uploading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create SCORM Module')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScormModuleModal;
