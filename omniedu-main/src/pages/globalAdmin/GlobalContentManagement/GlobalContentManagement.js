import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, deleteContent, createContent, updateContent } from '../../../store/slices/contentSlice';
import "./GlobalContentManagement.css"
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import CustomLoader from '../../../components/common/Loading/CustomLoader';

const GlobalContentManagement = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.content);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContentId, setEditContentId] = useState(null);
  const [newContent, setNewContent] = useState({
    title: "",
    type: "theory",
    content: "",
    file: null,
  });
  const navigate = useNavigate()
  useEffect(() => {
    dispatch(fetchContent({ isGlobal: true }));
  }, [dispatch,]);

  const handleDeleteContent = (contentId) => {
    // console.log(contentId);

    if (window.confirm("Are you sure you want to delete this content?")) {
      dispatch(deleteContent(contentId));
    }
  };

  // Filter content based on search term and type
  const filteredContent = items?.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = contentType === "all" || item.type === contentType;
    return matchesSearch && matchesType;
  }) || [];



  //pagination code
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // show 5 surveys per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContent = filteredContent.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    // console.log(name, value,files);
    if (name === "file") {
      setNewContent({ ...newContent, file: files[0] });
    } else {
      setNewContent({ ...newContent, [name]: value });
    }
  };
  const handleOpenContent = (contentId) => {
    navigate(`/global-admin/content/${contentId}`);
  };
  const handleFileClick = (file) => {
    window.open(file)
  };

  const handleAddContent = async () => {
    // Validate form
    console.log(newContent)
    if (!newContent.title || !newContent.type || !newContent.content || !newContent.file) {
      alert("Please fill all required fields");
      return;
    }
    // Dispatch to Redux or add locally
    dispatch(
      createContent({
        ...newContent,
        id: Date.now(), // temporary id
        status: "active",
        organizations: "All",
        createdDate: new Date().toISOString(),
      })
    );
    // Close modal and reset form
    setShowModal(false);
    setNewContent({ title: "", type: "theory", content: "", file: null });
  };

  const openEditModal = (content) => {
    setNewContent({
      title: content.title,
      type: content.type,
      content: content.content,
      file: content.file_url, // Reset file unless user uploads a new one
    });
    setEditContentId(content.uuid);
    setShowEditModal(true);
  };
  
  const handleEditContent = () => {
    if (!newContent.title || !newContent.type || !newContent.content) {
      alert("Please fill all required fields");
      return;
    }
    // console.log(newContent);
    
    dispatch(updateContent({ id: editContentId, updatedData: newContent }));
    setShowEditModal(false);
    setEditContentId(null);
    setNewContent({ title: "", type: "theory", content: "", file: null });
  };

const handleOpenModal = () => {
    setShowModal(true);
    setNewContent({ title: "", type: "", content: "", file: null });
  };
  return (
    <div className="global-content-management">
      <div
        className="page-header"
        style={{ paddingLeft: "20px" }}
      >
        <h1 className='page-title'>Global Content Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}> + Add Global Content</button>
      </div>
      {/* {error && <div className="error-message">{error}</div>} */}

      <div className="filter-section">
        <div className="search-box-content">
          <Search size={16} color="#6b7280" className="search-icon" />
          <input
            type="text"
            class
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* <div className="filter-box">
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
        </div> */}
      </div>

      {/* Add Content Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Global Content</h2>
            <label>
              Title
              <input
                type="text"
                name="title"
                value={newContent.title}
                onChange={handleInputChange}
                className="modal-input"
              />
            </label>
            <label>
              Type
              <select
                name="type"
                value={newContent.type}
                onChange={handleInputChange}
                className="modal-input"
              >
                <option value="theory">Theory</option>
                <option value="module">Module</option>
                <option value="assessment">Assessment</option>
                <option value="learning_path">Learning Path</option>
              </select>
            </label>
            <label>
              Content
              <textarea
                name="content"
                value={newContent.content}
                onChange={handleInputChange}
                rows={4}
                className="modal-input"
              ></textarea>
            </label>
            <label>
              Upload File
              <input
                type="file"
                name="file"
                onChange={handleInputChange}
                className="modal-input"
              />
            </label>

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-add"
                onClick={handleAddContent}
              >
                Add Content
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Global Content</h2>
            <label>
              Title
              <input
                type="text"
                name="title"
                value={newContent.title}
                onChange={handleInputChange}
                className="modal-input"
              />
            </label>
            <label>
              Type
              <select
                name="type"
                value={newContent.type}
                onChange={handleInputChange}
                className="modal-input"
              >
                <option value="theory">Theory</option>
                <option value="module">Module</option>
                <option value="assessment">Assessment</option>
                <option value="learning_path">Learning Path</option>
              </select>
            </label>
            <label>
              Content
              <textarea
                name="content"
                value={newContent.content}
                onChange={handleInputChange}
                rows={4}
                className="modal-input"
              ></textarea>
            </label>
            <label>
              Status
              <select
                name="status"
                value={newContent.status}
                onChange={handleInputChange}
                className="modal-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>  
            <label>
              File
              <span onClick={() => handleFileClick(newContent.file)}>View File</span>
            </label>
            <label>
              Upload File
              <input
                type="file"
                name="file"
                onChange={handleInputChange}
                className="modal-input"
              />
            </label>

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-add" onClick={handleEditContent}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="table-container">
        {loading ? (
          <CustomLoader text=" Loading Content..." />
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
                  <td style={{ cursor: "pointer" }} onClick={() => handleOpenContent(content.uuid)}>{content.title}</td>
                  <td>{content.type}</td>
                  <td>
                    <span className={`status-badge ${content.is_active ? 'active' : 'inactive'}`}>
                      {content.is_active ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </td>
                  <td>{content.organizations || "All"}</td>
                  <td>{new Date(content.createdAt).toLocaleDateString()}</td>
                  <td>
                  <button
                      className="delete-btn action-btn"
                      onClick={() => handleDeleteContent(content.uuid)}
                    >
                      Delete
                    </button>
                    <button className="edit-btn action-btn" onClick={() => openEditModal(content)}>Edit</button>
                    
                  </td>
                </tr>
              ))}

              {currentContent.length === 0 && (
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