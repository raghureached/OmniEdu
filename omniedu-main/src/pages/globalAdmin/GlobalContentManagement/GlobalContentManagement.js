import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, deleteContent } from '../../../store/slices/contentSlice';

const GlobalContentManagement = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.content);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("all");

  useEffect(() => {
    dispatch(fetchContent({ isGlobal: true }));
  }, [dispatch]);

  const handleDeleteContent = (contentId) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      dispatch(deleteContent(contentId));
    }
  };

  // Filter content based on search term and type
  const filteredContent = items.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = contentType === "all" || item.type === contentType;
    return matchesSearch && matchesType;
  });
const contentData = [
  {
    id: 1,
    title: "Introduction to HTML",
    type: "Module",
    status: "Published",
    organizations: "Organization A, Organization B",
    createdDate: "2025-03-01",
    actions: "Edit, Delete",
  },
  {
    id: 2,
    title: "JavaScript Fundamentals",
    type: "Module",
    status: "Draft",
    organizations: "Organization C",
    createdDate: "2025-07-06",
    actions: "Edit, Delete",
  },
  {
    id: 3,
    title: "Responsive Web Design",
    type: "Module",
    status: "Published",
    organizations: "Organization L",
    createdDate: "2025-07-03",
    actions: "Edit, Delete",
  },
  {
    id: 4,
    title: "Introduction to React",
    type: "Learning Paths",
    status: "Published",
    organizations: "Organization X, Organization Y",
    createdDate: "2025-12-09",
    actions: "Edit, Delete",
  },
  {
    id: 5,
    title: "Full Stack Development",
    type: "Assignment",
    status: "Published",
    organizations: "Organization T, Organization M",
    createdDate: "2025-10-30",
    actions: "Edit, Delete",
  },
  {
    id: 6,
    title: "Node.js Basics",
    type: "Module",
    status: "Published",
    organizations: "Organization P",
    createdDate: "2025-08-15",
    actions: "Edit, Delete",
  },
  {
    id: 7,
    title: "Advanced CSS Animations",
    type: "Module",
    status: "Draft",
    organizations: "Organization Z, Organization Y",
    createdDate: "2025-06-20",
    actions: "Edit, Delete",
  },
  {
    id: 8,
    title: "Python for Beginners",
    type: "Module",
    status: "Published",
    organizations: "Organization A",
    createdDate: "2025-05-01",
    actions: "Edit, Delete",
  },
  {
    id: 9,
    title: "Data Structures in Java",
    type: "Assignment",
    status: "Draft",
    organizations: "Organization B, Organization F",
    createdDate: "2025-09-12",
    actions: "Edit, Delete",
  },
  {
    id: 10,
    title: "Machine Learning Basics",
    type: "Learning Paths",
    status: "Published",
    organizations: "Organization M",
    createdDate: "2025-04-11",
    actions: "Edit, Delete",
  },
  {
    id: 11,
    title: "Cybersecurity Awareness",
    type: "Module",
    status: "Published",
    organizations: "Organization D, Organization H",
    createdDate: "2025-06-30",
    actions: "Edit, Delete",
  },
  {
    id: 12,
    title: "Agile Project Management",
    type: "Learning Paths",
    status: "Draft",
    organizations: "Organization K",
    createdDate: "2025-07-25",
    actions: "Edit, Delete",
  },
  {
    id: 13,
    title: "Cloud Computing Fundamentals",
    type: "Module",
    status: "Published",
    organizations: "Organization X",
    createdDate: "2025-08-08",
    actions: "Edit, Delete",
  },
  {
    id: 14,
    title: "Database Design",
    type: "Assignment",
    status: "Published",
    organizations: "Organization Q, Organization J",
    createdDate: "2025-09-21",
    actions: "Edit, Delete",
  },
  {
    id: 15,
    title: "DevOps Essentials",
    type: "Module",
    status: "Draft",
    organizations: "Organization Y",
    createdDate: "2025-05-18",
    actions: "Edit, Delete",
  },
  {
    id: 16,
    title: "UI/UX Design Principles",
    type: "Module",
    status: "Published",
    organizations: "Organization W",
    createdDate: "2025-07-10",
    actions: "Edit, Delete",
  },
  {
    id: 17,
    title: "Blockchain Basics",
    type: "Learning Paths",
    status: "Published",
    organizations: "Organization R, Organization T",
    createdDate: "2025-06-05",
    actions: "Edit, Delete",
  },
  {
    id: 18,
    title: "Software Testing Fundamentals",
    type: "Module",
    status: "Draft",
    organizations: "Organization G",
    createdDate: "2025-04-28",
    actions: "Edit, Delete",
  },
  {
    id: 19,
    title: "Artificial Intelligence Overview",
    type: "Module",
    status: "Published",
    organizations: "Organization V",
    createdDate: "2025-08-01",
    actions: "Edit, Delete",
  },
  {
    id: 20,
    title: "Big Data Analytics",
    type: "Assignment",
    status: "Published",
    organizations: "Organization U, Organization Z",
    createdDate: "2025-07-19",
    actions: "Edit, Delete",
  },
];


  //pagination code
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // show 5 surveys per page
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentContent = contentData.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(contentData.length / itemsPerPage);

const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
};

  return (
    <div className="global-content-management">
      <div
        className="page-header"
        style={{ marginTop: "100px", paddingLeft: "20px" }}
      >
        <h1>Global Content Management</h1>
        <button className="btn-primary">Add Global Content</button>
      </div>
      {/* {error && <div className="error-message">{error}</div>} */}

      <div className="filter-section">
        <div className="search-box">
          <input
            type="text"
            class
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <label>Content Type:</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="module">Modules</option>
            <option value="assessment">Assessments</option>
            <option value="learning_path">Learning Paths</option>
          </select>
        </div>
      </div>

      {/* added css for this
       */}

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading global content...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Organizations</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentContent.map((content) => (
                <tr key={content.id}>
                  <td>{content.title}</td>
                  <td>{content.type}</td>
                  <td>
                    <span className={`status-badge ${content.status}`}>
                      {content.status}
                    </span>
                  </td>
                  <td>{content.organizations || "All"}</td>
                  <td>{new Date(content.createdDate).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit">Edit</button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteContent(content.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {contentData.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-results">
                    No global content found.
                  </td>
                </tr>
              )}
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

      {/* <div className="pagination-info">
        Showing {contentData.length} of {20} global content
      </div> */}
    </div>
  );
};

export default GlobalContentManagement;