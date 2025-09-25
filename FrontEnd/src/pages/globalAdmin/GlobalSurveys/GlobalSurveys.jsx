import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSurveys,
  deleteSurvey,
  createSurvey,
  updateSurvey,
} from "../../../store/slices/surveySlice";
import { RiDeleteBinFill } from "react-icons/ri";
import { FiEdit3 } from "react-icons/fi";
import { RiSurveyLine } from "react-icons/ri";
import "./GlobalSurveys.css";
import SurveyPreview from "./SurveyPreview";
import SurveyForm from "./SurveyForm";
import SearchImage from "../../../images/Search Not Found 1.png";
import { Search } from "lucide-react";
import LoadingScreen from "../../../components/common/Loading/Loading";
import { useLocation } from "react-router-dom";


const GlobalSurveys = () => {
  const dispatch = useDispatch();
  const { surveys, loading, error } = useSelector((state) => state.surveys);
  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [previewSurvey, setPreviewSurvey] = useState(null);
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    survey_type: "Multiple Choice",
    start_date: "",
    end_date: "",
    is_active: true,
    // questions: [{ question_text: "", question_type: "multiple_choice", options: [] }],
    questions: [
  { question_text: "", question_type: "multiple_choice", options: [] },
  { question_text: "", info_text: "", question_type: "info", options: [] },
],

  });

  useEffect(() => {
  if (location.state?.openForm && location.state.formData) {
    setFormData(location.state.formData);
    setEditingSurvey(null); // optional: treat it as new/edit depending on your logic
    setShowForm(true);
    // Clear the state so refreshing doesn't reopen the form
    window.history.replaceState({}, document.title);
  }
}, [location.state]);

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
  // const addQuestion = () => {
  //   setFormData({
  //     ...formData,
  //     questions: [
  //       ...formData.questions,
  //       { question_text: "", question_type: "multiple_choice", options: [] },
  //     ],
  //   });
  // };
  const addQuestion = () => {
  const newQuestions = [
    ...formData.questions,
    { question_text: "", question_type: "multiple_choice", options: [] },
  ];

  // Automatically add an info box after every 5 questions
 
   

  setFormData({ ...formData, questions: newQuestions });
};


  // remove question
  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // Change a specific option text
  const handleOptionChange = (qIndex, optIndex, newValue) => {
    setFormData((prev) => {
      const updatedQuestions = prev.questions.map((q, i) => {
        if (i === qIndex) {
          const updatedOptions = [...q.options];
          updatedOptions[optIndex] = newValue;
          return { ...q, options: updatedOptions };
        }
        return q;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Add a new option to a question
  const addOption = (qIndex) => {
    setFormData((prev) => {
      const updatedQuestions = prev.questions.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ""] } : q
      );
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Remove an option from a question
  const removeOption = (qIndex, optIndex) => {
    setFormData((prev) => {
      const updatedQuestions = prev.questions.map((q, i) => {
        if (i === qIndex) {
          const updatedOptions = q.options.filter((_, j) => j !== optIndex);
          return { ...q, options: updatedOptions };
        }
        return q;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      survey_type: formData.survey_type,
      start_date: formData.start_date
        ? new Date(formData.start_date).toISOString()
        : null,
      end_date: formData.end_date
        ? new Date(formData.end_date).toISOString()
        : null,

      is_active: formData.is_active,
      created_by: "admin-user-uuid", // replace with actual logged-in user uuid
      questions: formData.questions.map((q) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        info_text: q.info_text || "",
        options:
          q.question_type === "multiple_choice" 
            ? q.options.filter((opt) => typeof opt === "string" && opt.trim() !== "")
            : [],
      })),
    };

    try {
      if (editingSurvey) {
        // ✅ update existing
        await dispatch(
          updateSurvey({
            uuid: editingSurvey.uuid,  // always uuid
            data: payload,
          })
        );
      } else {
        // ✅ create new
        await dispatch(createSurvey(payload));
      }

      // ✅ fetch fresh list after update/create
      dispatch(fetchSurveys());

      // ✅ reset everything
      setShowForm(false);
      setEditingSurvey(null);
      setFormData({
        title: "",
        description: "",
        survey_type: "Multiple Choice",
        start_date: "",
        end_date: "",
        is_active: true,
        questions: [{ question_text: "", question_type: "multiple_choice", options: [] }, { type: "info", info_text: "" },],
      });
    } catch (err) {
      console.error("Failed to submit survey", err);
    }
  };

  
  // Delete handler
  const handleDeleteSurvey = (id) => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      dispatch(deleteSurvey(id));
    }
  };


const filteredSurveys = surveys.filter((survey) => {
  // Search by title (safe check)
  const matchesSearch = survey.title
    ? survey.title.toLowerCase().includes(searchTerm.toLowerCase())
    : false;

  // Filter by status (use is_active boolean instead of status string)
  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && survey.is_active === true) ||
    (statusFilter === "inactive" && survey.is_active === false);

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
  if(loading){
    return <LoadingScreen text={"Loading Surveys..."}/>
  }
  return (
    <div className="survey-container">
      <div>
        {/* Filters */}
        <div className="survey-top-controls">
          <div className="survey-filters">
          <div className="search-box-content">
          <Search size={16} color="#6b7280" className="search-icon" />
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="survey-search"
          />
          </div>
          {/* <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="survey-select"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>  */}
          <select
       value={statusFilter}
       onChange={(e) => setStatusFilter(e.target.value)}
       className="survey-select">
       <option value="all">All</option>
       <option value="active">Active</option>
       <option value="inactive">Inactive</option>
        </select>

          </div>
          <div>
          <button
          className="survey-btn-primary"
          onClick={() => {
            setEditingSurvey(null); // make sure not in edit mode
            setFormData({
              title: "",
              description: "",
              survey_type: "Multiple Choice",
              start_date: "",
              end_date: "",
              is_active: true,
              questions: [],
            });
            setShowForm(true);
          }}
        >
          + Create Survey
        </button>
          </div>

        </div>
        
      </div>
     


      
  
      
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
                        className={`survey-status ${survey.is_active === true
                            ? "survey-status-active"
                            : survey.is_active === false
                              ? "survey-status-draft"
                              : "survey-status-closed"
                          }`}
                      >
                        {survey.is_active === true ? "✓ Active" : "✕ Inactive"}
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
                      {/* <button className="survey-btn-view">View</button> */}
                      <button
                        className="survey-btn-view"
                        onClick={() => setPreviewSurvey(survey)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}><RiSurveyLine size={16}/>View</span>
                      </button>

                      <button
                        className="survey-btn-delete"
                        onClick={() => handleDeleteSurvey(survey.uuid)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}><RiDeleteBinFill size={16}/>Delete</span>
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
                              ? new Date(survey.start_date).toISOString().split("T")[0] // ✅ only yyyy-mm-dd
                              : "",
                            end_date: survey.end_date
                              ? new Date(survey.end_date).toISOString().split("T")[0]
                              : "",
                            is_active: survey.is_active,
                            // questions: survey.questions
                            //   ? survey.questions.map((q) => ({
                            //     ...q,
                            //     options: q.options ? [...q.options] : [],
                            //   }))
                            //   : [],
                            questions: survey.questions
  ? survey.questions.map((q) => ({
      question_type: q.question_type,
      question_text: q.question_text || "",
      info_text: q.info_text || "",
      options: q.options ? [...q.options] : [],
      position: q.position || 0,
    }))
  : [],

                          });
                          setShowForm(true);
                        }}

                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FiEdit3 size={16}/>Edit</span>
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      
      {previewSurvey && (
        <SurveyPreview
          survey={previewSurvey}
          onClose={() => setPreviewSurvey(null)}
        />
      )}
      {showForm && (
        <SurveyForm
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleQuestionChange={handleQuestionChange}
          handleOptionChange={handleOptionChange}
          addOption={addOption}
          removeOption={removeOption}
          addQuestion={addQuestion}
          removeQuestion={removeQuestion}
          handleSubmit={handleSubmit}
          editingSurvey={editingSurvey}
          onClose={() => {
            setShowForm(false);
            setEditingSurvey(null);
          }}
        />
      )}

      {/* Pagination */}
      {totalPages >= 1 && (
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
