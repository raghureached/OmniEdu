import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSurveys,
  createSurvey,
  deleteSurvey,
  updateSurvey,
} from "../../../store/slices/surveySlice";
import "./GlobalSurveynew.css";

const GlobalSurvey = () => {
  const dispatch = useDispatch();
  const { surveys } = useSelector((state) => state.surveys);

  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    survey_type: "text",
    start_date: "",
    end_date: "",
    is_active: true,
    questions: [{ question_text: "", question_type: "text", options: [] }],
  });

  useEffect(() => {
    dispatch(fetchSurveys());
  }, [dispatch]);

  // handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // handle question change
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // add question
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { question_text: "", question_type: "text", options: [] },
      ],
    });
  };

  // remove question
  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Normalize payload for backend
    const payload = {
      title: formData.title,
      description: formData.description,
      survey_type: formData.survey_type,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
      questions: formData.questions.map((q) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        options:
          q.question_type === "multiple_choice"
            ? q.options.filter((opt) => opt.trim() !== "")
            : [],
      })),
    };

    if (editingSurvey) {
      dispatch(
        updateSurvey({
          id: editingSurvey._id || editingSurvey.uuid,
          data: payload,
        })
      );
    } else {
      dispatch(createSurvey(payload));
    }

    // Reset after submit
    setShowForm(false);
    setEditingSurvey(null);
    setFormData({
      title: "",
      description: "",
      survey_type: "text",
      start_date: "",
      end_date: "",
      is_active: true,
      questions: [{ question_text: "", question_type: "text", options: [] }],
    });
  };

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h2>Global Surveys</h2>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Add Survey
        </button>
      </div>

      {/* Table */}
      <table className="custom-table">
        <thead>
          <tr>
            <th></th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Survey Title</th>
            <th>Survey Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {surveys && surveys.length > 0 ? (
            surveys.map((s) => (
              <tr key={s.uuid || s._id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>
                  {s.start_date
                    ? new Date(s.start_date).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {s.end_date
                    ? new Date(s.end_date).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      s.is_active ? "active" : "inactive"
                    }`}
                  >
                    {s.is_active ? " Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="survey-info">
                    <div className="survey-title">{s.title}</div>
                    <div className="survey-desc">{s.description || ""}</div>
                  </div>
                </td>
                <td>{s.survey_type}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => dispatch(deleteSurvey(s.uuid || s._id))}
                  >
                    Delete
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingSurvey(s);
                      setFormData({
                        title: s.title,
                        description: s.description || "",
                        survey_type: s.survey_type,
                        start_date: s.start_date
                          ? s.start_date.split("T")[0]
                          : "",
                        end_date: s.end_date ? s.end_date.split("T")[0] : "",
                        is_active: s.is_active,
                        questions: s.questions || [],
                      });
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No surveys found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingSurvey ? "Edit Survey" : "Add Survey"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingSurvey(null);
                }}
              >
                ✖
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />

              <label>Survey Type*</label>
              <select
                name="survey_type"
                value={formData.survey_type}
                onChange={handleChange}
              >
                <option value="text">Text</option>
                <option value="rating">Rating</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>

              <div className="date-fields">
                <div>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Active
              </label>

              <h4>Questions</h4>
              {formData.questions.map((q, index) => (
                <div key={index} className="question-box">
                  <input
                    type="text"
                    placeholder="Enter question"
                    value={q.question_text}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "question_text",
                        e.target.value
                      )
                    }
                    required
                  />
                  <select
                    value={q.question_type}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "question_type",
                        e.target.value
                      )
                    }
                  >
                    <option value="text">Text</option>
                    
                    <option value="multiple_choice">Multiple Choice</option>
                  </select>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeQuestion(index)}
                  >
                    ✖
                  </button>

                  {/* Options for Multiple Choice */}
                  {q.question_type === "multiple_choice" && (
                    <div className="options-box">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="option-row">
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const updatedOptions = [...q.options];
                              updatedOptions[optIndex] = e.target.value;
                              handleQuestionChange(
                                index,
                                "options",
                                updatedOptions
                              );
                            }}
                          />
                          <button
                            type="button"
                            className="remove-option-btn"
                            onClick={() => {
                              const updatedOptions = q.options.filter(
                                (_, i) => i !== optIndex
                              );
                              handleQuestionChange(
                                index,
                                "options",
                                updatedOptions
                              );
                            }}
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-option-btn"
                        onClick={() =>
                          handleQuestionChange(index, "options", [
                            ...q.options,
                            "",
                          ])
                        }
                      >
                        + Add Option
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-question-btn"
                onClick={addQuestion}
              >
                + Add Question
              </button>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSurvey(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="create-btn">
                  {editingSurvey ? "Update Survey" : "Create Survey"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSurvey;
