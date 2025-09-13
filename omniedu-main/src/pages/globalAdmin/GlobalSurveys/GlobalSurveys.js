import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSurveys,
  deleteSurvey,
  createSurvey,
  updateSurvey,
} from "../../../store/slices/surveySlice";
import "./GlobalSurveys.css";

const GlobalSurveys = () => {
  const dispatch = useDispatch();
  const { surveys, loading, error } = useSelector((state) => state.surveys);
    const [showForm, setShowForm] = useState(false);
    const [editingSurvey, setEditingSurvey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
      title: "",
      description: "",
      survey_type: "text",
      start_date: "",
      end_date: "",
      is_active: true,
      questions: [{ question_text: "", question_type: "text", options: [] }],
    });
  
  // Fetch surveys on mount
  useEffect(() => {
    dispatch(fetchSurveys());
  }, [dispatch]);
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
  // Delete handler
  const handleDeleteSurvey = (id) => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      dispatch(deleteSurvey(id));
    }
  };

  // Filtering
  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSurveys = filteredSurveys.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);

  return (
    <div className="survey-container">
      {/* Header */}
      <div className="survey-header">
        <h1>Global Surveys</h1>
        <button className="survey-btn-primary" onClick={() => setShowForm(true)}>+ Create Survey</button>
      </div>

      {/* Filters */}
      <div className="survey-filters">
        <input
          type="text"
          placeholder="Search surveys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="survey-search"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="survey-select"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="survey-loading">Loading surveys...</div>
      ) : error ? (
        <div className="survey-error">{error}</div>
      ) : (
        <div className="survey-table-container">
          {currentSurveys.length === 0 ? (
            <div className="survey-no-data">No surveys found</div>
          ) : (
            <table className="survey-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Questions</th>
                  <th>Responses</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSurveys.map((survey) => (
                  <tr key={survey._id}>
                    <td>{survey.title}</td>
                    <td>{survey.survey_type || "N/A"}</td>
                    <td>
                      <span
                        className={`survey-status ${
                          survey.is_active === true
                            ? "survey-status-active"
                            : survey.is_active === false
                            ? "survey-status-draft"
                            : "survey-status-closed"
                        }`}
                      >
                        {survey.is_active === true ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{survey.questions?.length || 0}</td>
                    <td>{survey.responses?.length || 0}</td>
                    <td>
                      {survey.createdAt
                        ? new Date(survey.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="survey-actions">
                      <button className="survey-btn-view">View</button>
                      <button
                        className="survey-btn-delete"
                        onClick={() => handleDeleteSurvey(survey.uuid)}
                      >
                        Delete
                      </button>
                      <button
                    className="survey-btn-edit"
                    onClick={() => {
                      setEditingSurvey(survey);
                      setFormData({
                        title: survey.title,
                        description: survey.description || "",
                        survey_type: survey.survey_type,
                        start_date: survey.start_date
                          ? survey.start_date.split("T")[0]
                          : "",
                        end_date: survey.end_date ? survey.end_date.split("T")[0] : "",
                        is_active: survey.is_active,
                        questions: survey.questions || [],
                      });
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
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

              <div>
                <label>Status</label>
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="survey-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? "survey-active-page" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalSurveys;
