import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminfetchContent, admindeleteContent, admincreateContent, adminupdateContent, adminbulkDeleteContent } from '../../../store/slices/adminModuleSlice';
import "./ModuleManagement.css"
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, Edit3, FileText, Search, Trash2, Users, X } from 'lucide-react';
import LoadingScreen from '../../../components/common/Loading/Loading'
import { RiDeleteBinFill } from "react-icons/ri";
import { FiEdit3 } from "react-icons/fi";
import ModuleModal from './ModuleModal';
import { GoX } from 'react-icons/go';


const ModuleManagement = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.content);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContentId, setEditContentId] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftContent, setDraftContent] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [newContent, setNewContent] = useState({
    title: "",
    duration: "",
    tags: [],
    learningOutcomes: [''],
    prerequisites: "",
    credits: 0,
    stars: 0,
    badges: 0,
    team: "",
    category: "",
    trainingType: "",
    instructions: "",
    externalResource: "",
    feedbackEnabled: false,
    thumbnail: "",
    submissionEnabled: false,
  });
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    dispatch(adminfetchContent());
  }, [dispatch]);

  const handleDeleteContent = (contentId) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      dispatch(admindeleteContent(contentId));
    }
  };

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
    const { name, value, files, type, checked } = e.target;
    // console.log(name, value, files, type, checked)
    if (type === 'checkbox') {
      setNewContent(prev => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === 'file') {
      setNewContent(prev => ({ ...prev, [name]: files[0] }));
      return;
    }
    setNewContent(prev => ({ ...prev, [name]: value }));
  };
  const handleRichInputChange = (e) => {
    setNewContent(prev => ({ ...prev, richText: e }));
  };

  const handleOpenContent = (contentId) => {
    navigate(`/global-admin/module/${contentId}`);
  };
  const handleFileClick = (file) => {
    window.open(file)
  };
  const openDraftModal = () => {
    const drafts = JSON.parse(localStorage.getItem('drafts'));
    setDraftContent(drafts)
    setShowDraftModal(true);
  };
  const useDraft = (title) => {
    const drafts = localStorage.getItem('drafts');
    const draft = JSON.parse(drafts).find((draft) => draft.title === title);
    return draft;
  };
  const handleAddContent = async () => {

    setUploading(true);

    try {
      // Build FormData
      const formData = new FormData();
      const moduleData = {
        ...newContent,
        id: Date.now(), // temporary id
        status: "Draft",
        createdDate: new Date().toISOString(),
      };
      dispatch(admincreateContent(moduleData))

    } catch (err) {
      setUploading(false)
      console.error("Error uploading content:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const openEditModal = (content) => {
    setEditContentId(content.uuid)
    setNewContent({
      title: content.title,
      primaryFile: content.primaryFile,
      duration: content.duration || "",
      tags: content.tags || [],
      description: content.description || "",
      learningOutcomes: content.learning_outcomes || [''],
      additionalFile: content.additionalFile || null,
      difficultyLevel: content.difficulty_level || "",
      prerequisites: content.prerequisites || "",
      credits: content.credits || 0,
      stars: content.stars || 0,
      badges: content.badges || 0,
      team: content.team || "",
      category: content.category || "",
      trainingType: content.trainingType || "",
      instructions: content.instructions || "",
      externalResource: content.externalResource || "",
      feedbackEnabled: !!content.feedbackEnabled,
      richText: content.richText || "",
      thumbnail: content.thumbnail || "",
      submissionEnabled: content.submissionEnabled || false,
    });
    setShowEditModal(true);
  };
  const drafts = localStorage.getItem('draftContent');
  const setDrafts = () => {
    setNewContent(JSON.parse(drafts));
    // setShowModal(true);
  }
  const handleBulkDelete = (ids) => {
    if (ids.length === 0) {
      alert("Please select at least one module to delete.")
      return;
    }
    if (window.confirm("Are you sure you want to delete these modules?")) {
      try {
        dispatch(adminbulkDeleteContent(ids));
      } catch (error) {
        console.error(error);
      }
    }
  }

  const handleOpenModal = () => {
    setShowModal(true);
    setNewContent({
      title: "",
      type: "",
      duration: "",
      tags: [],
      learningOutcomes: [''],
      additionalFile: null,
      primaryFile: null,
      prerequisites: "",
      credits: 0,
      stars: 0,
      badges: 0,
      team: "",
      category: "",
      trainingType: "",
      instructions: "",
      externalResource: "",
      enableFeedback: false,
      richText: "",
      thumbnail: "",
    });
  };
  const handleContinueDraft = (draft) => {
    setNewContent(draft)
    // console.log(draft)
    setShowDraftModal(false)
    if (draft.uuid) {
      setShowEditModal(true)
    } else {
      setShowModal(true)
    }

  }
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedItems(currentContent.map(item => item.uuid));
    } else {
      setSelectedItems([]);
    }
  }
  const handleSelectItem = (e, id) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  }
  const deleteDraft = (title) => {
    const drafts = JSON.parse(localStorage.getItem('drafts'));
    const updatedDrafts = drafts.filter((draft) => draft.title !== title);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
    setShowDraftModal(false)
  }
  // if (loading && !uploading) {
  //   return <LoadingScreen text={"Loading Global Content..."} />
  // }
  // const modules = items?.filter(item => item.type === "module") || [];

  if (loading) {
    return <LoadingScreen text={"Loading Global Content..."} />
  }
  return (
    <div className="global-content-management">
      <div className="global-content-header">
        <div className="global-content-header-content">
          <div className="global-content-header-info">
            <h1 className="global-content-page-title">Modules Management</h1>
            <p className="global-content-page-subtitle">Create, Manage and Organize your modules</p>
          </div>
          <div className="global-content-stats">
            <div className="global-content-stat-card">
              <div className="global-content-stat-icon">
                <FileText size={20} />
              </div>
              <div className="global-content-stat-info">
                <span className="global-content-stat-number">{items.length}</span>
                <span className="global-content-stat-label">Total Modules</span>
              </div>
            </div>
            <div className="global-content-stat-card">
              <div className="global-content-stat-icon published">
                <Users size={20} />
              </div>
              <div className="global-content-stat-info">
                <span className="global-content-stat-number">{items.filter(a => a.status === 'Published').length}</span>
                <span className="global-content-stat-label">Published</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="filter-section">
        <div className="search-box-content" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Search size={16} color="#6b7280" className="search-icon" />
          <input
            type="text"
            class
            placeholder="Search Modules"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px" }}>

            {/* <button className="control-btn" style={{ color: "#6b7280", border: "1px solid #6b7280" }} onClick={() => openDraftModal()}> Drafts</button> */}
            <button className="control-btn" onClick={() => setShowBulkAction(!showBulkAction)}> Bulk Action <ChevronDown size={16} /></button>
            {showBulkAction && (
              <div className="bulk-action-panel-module">
                <div className="bulk-action-header">
                  <label className="bulk-action-title">Items Selected: {selectedItems.length}</label>
                  <GoX
                    size={20}
                    title="Close"
                    aria-label="Close bulk action panel"
                    onClick={() => setShowBulkAction(false)}
                    className="bulk-action-close"
                  />
                </div>
                <div className="bulk-action-actions" style={{ display: "flex", justifyContent:"center" }}>
                  <button
                    className="bulk-action-delete-btn"
                    disabled={selectedItems.length === 0}
                    onClick={() => handleBulkDelete(selectedItems)}
                  >
                    <RiDeleteBinFill size={16} color="#fff" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={() => handleOpenModal()}> + Add Module</button>
          </div>
        </div>
      </div>

      {showModal && <ModuleModal showModal={showModal} setShowModal={setShowModal} newContent={newContent} handleInputChange={handleInputChange} handleAddContent={handleAddContent} uploading={uploading} setUploading={setUploading} handleRichInputChange={handleRichInputChange} error={error} />}
      {showEditModal && <ModuleModal showModal={showEditModal} setShowModal={setShowEditModal} newContent={newContent} handleInputChange={handleInputChange} uploading={uploading} setUploading={setUploading} showEditModal={showEditModal} setShowEditModal={setShowEditModal} editContentId={editContentId} handleRichInputChange={handleRichInputChange} error={error} />}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={(e) => handleSelectAll(e)} checked={selectedItems.length === currentContent.length} /></th>
              <th>Title</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Team</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentContent.map((content) => (
              <tr key={content.id}>
                <td><input type="checkbox" onChange={(e) => handleSelectItem(e, content.uuid)} checked={selectedItems.includes(content.uuid)} /></td>
                <td>
                  <div className="assess-cell-content">
                    <div className="assess-title-container">
                      <h4 className="assess-title">{content.title}</h4>
                      <p className="assess-description">{content.description || "No description provided"}</p>
                      {Array.isArray(content.tags) && content.tags.length > 0 && (
                        <div className="assess-tags">
                          {content.tags.map((t, idx) => (
                            <span key={`${content.id}-tag-${idx}`} className="assess-classification">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{content.credits}</td>
                <td>
                  <span className={` ${content.status === 'Published' ? 'published' : content.status === 'Draft' ? 'draft' : 'saved'} assess-status-badge`}>
                    {content.status === 'Published' ? `✓ ${content.status}` : content.status === 'Draft' ? 'Draft' : 'Saved'}
                  </span>
                </td>
                <td>{content.team?.name || "All"}</td>
                <td>
                  <div className="assess-date-info"><Calendar size={14} />
                    <span>{content.createdAt ? new Date(content.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : ""}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="global-action-btn delete"
                      onClick={() => handleDeleteContent(content.uuid)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="global-action-btn edit" onClick={() => {
                      setEditContentId(content.uuid)
                      openEditModal(content);
                    }}>
                      <Edit3 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

          {currentContent.length === 0 && (
            <tr>
              <td colSpan="6" className="no-results">
                No Modules found.
              </td>
            </tr>
          )}

          {filteredContent.length > 0 && (
            <tr>
              <td colSpan={7}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Prev
                    </button>
                    <span style={{ color: '#0f172a' }}>
                      {`Page ${currentPage} of ${Math.max(1, totalPages)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
      {showDraftModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              padding: '24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="draftsTitle"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2
                id="draftsTitle"
                style={{ margin: 0, fontWeight: '700', fontSize: '1.8rem', color: '#333' }}
              >
                Drafts
              </h2>
              <button className="close-btn" onClick={() => setShowDraftModal(false)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {draftContent?.length > 0 ? (
                draftContent.map((draft) => (
                  <div
                    key={draft.id}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#222' }}>
                      {draft.title}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', color: '#555', fontSize: '0.95rem', lineHeight: 1.4 }}>
                      {draft.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => {
                          handleContinueDraft(draft)
                        }}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#5570f1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3f57d4')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5570f1')}
                        aria-label={`View draft titled ${draft.title}`}
                      >
                        Continue
                      </button>
                      <button
                        onClick={() => {
                          deleteDraft(draft.title)
                        }}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c82333')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
                        aria-label={`Delete draft titled ${draft.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#777', fontStyle: 'italic' }}>No drafts available.</p>
              )}
            </div>
          </div>
        </div>
      )}

          
    </div>
  );
};

export default ModuleManagement;