import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, deleteContent } from '../../../store/slices/contentSlice';
import './GlobalSurveys.css';

const GlobalSurveys = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.content);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchContent({ type: "survey", isGlobal: true }));
  }, [dispatch]);

  const handleDeleteSurvey = (surveyId) => {
    if (window.confirm("Are you sure you want to delete this global survey?")) {
      dispatch(deleteContent(surveyId));
    }
  };

  // Dummy data for demonstration
  const dummySurveys = [
    {
      id: 1,
      title: "Remote Work Productivity Survey",
      type: "Workplace Study",
      status: "Active",
      questionCount: 12,
      responseCount: 76,
      createdAt: "2025-06-12",
    },
    {
      id: 2,
      title: "Cybersecurity Awareness Quiz",
      type: "Training Assessment",
      status: "Draft",
      questionCount: 15,
      responseCount: 0,
      createdAt: "2025-07-05",
    },
    {
      id: 3,
      title: "Office Facilities Feedback",
      type: "Infrastructure",
      status: "Closed",
      questionCount: 9,
      responseCount: 51,
      createdAt: "2025-03-28",
    },
    {
      id: 4,
      title: "Employee Recognition Program Review",
      type: "HR Feedback",
      status: "Active",
      questionCount: 10,
      responseCount: 34,
      createdAt: "2025-05-18",
    },
    {
      id: 5,
      title: "Diversity & Inclusion Survey",
      type: "Culture & Values",
      status: "Closed",
      questionCount: 20,
      responseCount: 142,
      createdAt: "2025-02-09",
    },
    {
      id: 6,
      title: "AI Tools Adoption Feedback",
      type: "Technology",
      status: "Active",
      questionCount: 14,
      responseCount: 63,
      createdAt: "2025-06-25",
    },
    {
      id: 7,
      title: "Annual Budget Planning Feedback",
      type: "Finance",
      status: "Draft",
      questionCount: 8,
      responseCount: 0,
      createdAt: "2025-07-15",
    },
    {
      id: 8,
      title: "Corporate Social Responsibility Survey",
      type: "CSR Initiative",
      status: "Active",
      questionCount: 11,
      responseCount: 29,
      createdAt: "2025-06-02",
    },
    {
      id: 9,
      title: "Innovation & Ideas Collection",
      type: "Brainstorming",
      status: "Closed",
      questionCount: 13,
      responseCount: 87,
      createdAt: "2025-04-01",
    },
    {
      id: 10,
      title: "Hybrid Work Model Feedback",
      type: "Work Policy",
      status: "Active",
      questionCount: 16,
      responseCount: 98,
      createdAt: "2025-05-27",
    },
    {
      id: 11,
      title: "Quarterly Sales Training Evaluation",
      type: "Training Evaluation",
      status: "Closed",
      questionCount: 12,
      responseCount: 67,
      createdAt: "2025-03-15",
    },
    {
      id: 12,
      title: "Customer Experience Feedback",
      type: "Customer Survey",
      status: "Active",
      questionCount: 18,
      responseCount: 120,
      createdAt: "2025-06-30",
    },
    {
      id: 13,
      title: "Health & Safety Awareness Survey",
      type: "Workplace Safety",
      status: "Draft",
      questionCount: 10,
      responseCount: 0,
      createdAt: "2025-07-20",
    },
    {
      id: 14,
      title: "Employee Well-being Check",
      type: "HR Feedback",
      status: "Active",
      questionCount: 15,
      responseCount: 73,
      createdAt: "2025-06-10",
    },
    {
      id: 15,
      title: "Sustainability Practices Survey",
      type: "CSR",
      status: "Closed",
      questionCount: 11,
      responseCount: 54,
      createdAt: "2025-04-25",
    },
    {
      id: 16,
      title: "Product Knowledge Test",
      type: "Training Assessment",
      status: "Active",
      questionCount: 20,
      responseCount: 33,
      createdAt: "2025-07-01",
    },
    {
      id: 17,
      title: "Quarterly Performance Review Survey",
      type: "Performance Review",
      status: "Closed",
      questionCount: 25,
      responseCount: 81,
      createdAt: "2025-05-05",
    },
    {
      id: 18,
      title: "Work-Life Balance Study",
      type: "Employee Feedback",
      status: "Active",
      questionCount: 14,
      responseCount: 64,
      createdAt: "2025-06-18",
    },
    {
      id: 19,
      title: "Team Collaboration Feedback",
      type: "Teamwork",
      status: "Draft",
      questionCount: 9,
      responseCount: 0,
      createdAt: "2025-07-22",
    },
    {
      id: 20,
      title: "IT Helpdesk Service Feedback",
      type: "Service Evaluation",
      status: "Active",
      questionCount: 12,
      responseCount: 46,
      createdAt: "2025-06-05",
    },
  ];


  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // show 5 surveys per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSurveys = dummySurveys.slice(indexOfFirstItem, indexOfLastItem);
 const totalPages = Math.ceil(dummySurveys.length / itemsPerPage);

 const handlePageChange = (pageNumber) => {
   setCurrentPage(pageNumber);
 };



  // Filter surveys based on search term and status
  const filteredSurveys = items.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="global-surveys-container">
      <div className="page-header">
        <h1>Global Surveys</h1>
        <button className="btn-primary">Create New Global Survey</button>
      </div>

      <div className="filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search global surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* {loading ? (
        <div className="loading">Loading global surveys...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="surveys-list">
          {filteredSurveys.length === 0 ? (
            <div className="no-data">No global surveys found</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Questions</th>
                  <th>Organizations</th>
                  <th>Total Responses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.map((survey) => (
                  <tr key={survey.id}>
                    <td>{survey.title}</td>
                    <td>
                      <span className={`status-badge ${survey.status}`}>
                        {survey.status}
                      </span>
                    </td>
                    <td>{survey.questions?.length || 0}</td>
                    <td>{survey.organizations?.length || 0}</td>
                    <td>{survey.totalResponses || 0}</td>
                    <td className="actions-cell">
                      <button className="btn-view">View Results</button>
                      <button className="btn-edit">Edit</button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteSurvey(survey.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )} */}

      {/* Always show dummy data instead of loading/error states */}
      <div className="surveys-list">
        {dummySurveys.length === 0 ? (
          <div className="surveys-no-data">No surveys found</div>
        ) : (
          <table className="surveys-data-table">
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
                <tr key={survey.id}>
                  <td>{survey.title}</td>
                  <td>{survey.type}</td>
                  <td>
                    <span
                      className={`surveys-status-badge ${survey.status.toLowerCase()}`}
                    >
                      {survey.status}
                    </span>
                  </td>
                  <td>{survey.questionCount}</td>
                  <td>{survey.responseCount}</td>
                  <td>{new Date(survey.createdAt).toLocaleDateString()}</td>
                  <td className="surveys-actions-cell">
                    <button className="surveys-btn-view">View Results</button>
                    <button className="surveys-btn-edit">Edit</button>
                    <button
                      className="surveys-btn-delete"
                      onClick={() => handleDeleteSurvey(survey.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
     <div className="pagination">
  <button
    disabled={currentPage === 1}
    onClick={() => handlePageChange(currentPage - 1)}
  >
    Previous
  </button>

  {[...Array(totalPages)].map((_, index) => (
    <button
      key={index + 1}
      className={currentPage === index + 1 ? "active" : ""}
      onClick={() => handlePageChange(index + 1)}
    >
      {index + 1}
    </button>
  ))}

  <button
    disabled={currentPage === totalPages}
    onClick={() => handlePageChange(currentPage + 1)}
  >
    Next
  </button>
</div>

    </div>
  );
};

export default GlobalSurveys;