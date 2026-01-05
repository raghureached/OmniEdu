import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, deleteContent, createContent, updateContent, bulkDeleteContent } from '../../../store/slices/contentSlice';
import "./GlobalModuleManagement.css"
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, Edit3, FileText, Search, Trash2, Users, X, Filter, BarChart3, File } from 'lucide-react';
import LoadingScreen from '../../../components/common/Loading/Loading'
import { RiDeleteBinFill } from "react-icons/ri";
import GlobalModuleModal from './GlobalModuleModal';
import { GoX } from 'react-icons/go';
import { useNotification } from '../../../components/common/Notification/NotificationProvider.jsx';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog.jsx';
import SelectionBanner from '../../../components/Banner/SelectionBanner';
import { categories } from '../../../utils/constants.js';
import api from '../../../services/api.js';
import { notifyError } from '../../../utils/notification.js';
import AnalyticsPop from '../../../components/AnalyticsPopup/AnalyticsPop.jsx';


const GlobalModuleManagement = () => {
  const dispatch = useDispatch();
  const { confirm } = useConfirm();
  const { items, loading, error } = useSelector((state) => state.content);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContentId, setEditContentId] = useState(null);
  const [draftId, setDraftId] = useState(null);

  const [showBulkAction, setShowBulkAction] = useState(false);
  const { showNotification } = useNotification()
  const [filters, setFilters] = useState({
    status: ''
  });
  const [tempFilters, setTempFilters] = useState({
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const filterButtonRef = useRef(null);
  const bulkButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const bulkPanelRef = useRef(null);
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
    subteam: "",
    category: "",
    trainingType: "",
    instructions: "",
    externalResource: "",
    feedbackEnabled: false,
    thumbnail: "",
    submissionEnabled: false,
  });
  const [uploading, setUploading] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const navigate = useNavigate()
  useEffect(() => {
    dispatch(fetchContent());
  }, [dispatch]);

  const handleDeleteContent = async (contentId) => {
    const confirmed = await confirm({
      title: `Are you sure you want to delete this Module?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // or 'warning', 'info'
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated items will be removed.',
    });
    if (confirmed) {
      const deleteRes = dispatch(deleteContent(contentId));
      deleteRes.then(() => {
        showNotification({
          type: "success",
          message: "Module deleted successfully",
        });
      }).catch((error) => {
        showNotification({
          type: "error",
          message: "Failed to delete module",
        });
      });
    }
  };

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = () => {
    setFilters({
      ...tempFilters,
      search: searchTerm
    });
    setShowFilters(false);
  };

  const resetFilters = () => {
    const resetFilters = {
      status: '',
      search: ''
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setSearchTerm('');
  };

  // Filter the content based on search term and filters
  const filteredContent = items?.filter((item) => {
    const matchesSearch = !filters.search ||
      (item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesType = contentType === "all" || item.type === contentType;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchCategory = !filters.category || item.category === filters.category;
    return matchesSearch && matchesStatus && matchCategory;
  }) || [];

  //pagination code
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // show 5 surveys per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContent = filteredContent.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);

  // ---------------- Gmail-style Selection Model ----------------


  const [selectedIds, setSelectedIds] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [excludedIds, setExcludedIds] = useState([]);
  const [selectionScope, setSelectionScope] = useState("none");
  const [selectedPageRef, setSelectedPageRef] = useState(null);
  const [allSelectionCount, setAllSelectionCount] = useState(null);

  // Normalize ID for all content rows
  const resolveId = (item) => item?.uuid || item?._id || item?.id;

  // Visible items on this page
  const visibleIds = useMemo(
    () => (currentContent || []).map(resolveId).filter(Boolean),
    [currentContent]
  );

  // Total items (filtered)
  const totalItems = filteredContent?.length || 0;

  // Row selection check
  const isRowSelected = useCallback(
    (id) => {
      if (!id) return false;
      return allSelected ? !excludedIds.includes(id) : selectedIds.includes(id);
    },
    [allSelected, excludedIds, selectedIds]
  );

  // Derived counts
  const derivedSelectedCount = useMemo(() => {
    return allSelected
      ? totalItems - excludedIds.length
      : selectedIds.length;
  }, [allSelected, excludedIds.length, selectedIds.length, totalItems]);

  const derivedSelectedOnPage = useMemo(
    () => visibleIds.filter(isRowSelected),
    [visibleIds, isRowSelected]
  );

  // Header checkbox states
  const topCheckboxChecked =
    visibleIds.length > 0 &&
    visibleIds.every((id) => isRowSelected(id));

  const topCheckboxIndeterminate =
    visibleIds.some((id) => isRowSelected(id)) &&
    !topCheckboxChecked;

  // Reset everything
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setAllSelected(false);
    setExcludedIds([]);
    setSelectionScope("none");
    setSelectedPageRef(null);
    setAllSelectionCount(null);
  }, []);

  // Toggle header checkbox (select all on page)
  const handleSelectAllToggle = (checked) => {
    if (checked) {
      setSelectedIds(visibleIds);
      setExcludedIds([]);
      setAllSelected(false);
      setSelectionScope("page");
      setSelectedPageRef(currentPage);
    } else {
      if (allSelected) {
        setExcludedIds((prev) => [...new Set([...prev, ...visibleIds])]);
      } else {
        setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      }

      const remaining = allSelected
        ? totalItems - (excludedIds.length + visibleIds.length)
        : selectedIds.length - visibleIds.length;

      if (remaining <= 0) clearSelection();
      else setSelectionScope("custom");
    }
  };

  // Select ALL across pages
  const handleSelectAllAcrossPages = () => {
    setAllSelected(true);
    setExcludedIds([]);
    setSelectionScope("all");
    setAllSelectionCount(totalItems);
  };

  // Row toggle
  const toggleSelectOne = (id, checked) => {
    if (allSelected) {
      if (checked) {
        setExcludedIds((prev) => prev.filter((x) => x !== id));
      } else {
        setExcludedIds((prev) => [...new Set([...prev, id])]);
      }
      return;
    }

    setSelectedIds((prev) => {
      const next = checked ? [...prev, id] : prev.filter((x) => x !== id);

      if (next.length === 0) clearSelection();
      else setSelectionScope("custom");

      return next;
    });
  };


  // "Select all pages / Select this page" dropdown (like GroupsTable)
  const [selectionMenuOpen, setSelectionMenuOpen] = useState(false);
  const selectionMenuRef = useRef(null);
  const selectionTriggerRef = useRef(null);
  const [selectionMenuPos, setSelectionMenuPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!selectionMenuOpen) return;

    const handleClickOutside = (event) => {
      if (!selectionMenuRef.current) return;
      if (
        !selectionMenuRef.current.contains(event.target) &&
        !selectionTriggerRef.current?.contains(event.target)
      ) {
        setSelectionMenuOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectionMenuOpen(false);
    };

    const handleReposition = () => {
      const btn = selectionTriggerRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const offset = 8;
      setSelectionMenuPos({ top: rect.bottom + offset, left: rect.left });
    };

    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    // initial position sync
    handleReposition();

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [selectionMenuOpen]);
  // Map dropdown options -> existing Gmail selection logic
  const handleSelectionOption = (option) => {
    switch (option) {
      case 'all':   // "Select all pages"
        handleSelectAllAcrossPages();
        break;
      case 'page':  // "Select this page"
        handleSelectAllToggle(true);
        break;
      case 'none':
      default:
        clearSelection();
        break;
    }

    setSelectionMenuOpen(false);
  };

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
      subteam: content.subteam || "",
      category: content.category || "",
      trainingType: content.trainingType || "",
      instructions: content.instructions || "",
      externalResource: content.externalResource || "",
      feedbackEnabled: !!content.feedbackEnabled,
      richText: content.richText || "",
      thumbnail: content.thumbnail || "",
      submissionEnabled: content.submissionEnabled || false,
    });
  };
  const handleViewSubmissions = (contentId) => {
    navigate(`/global-admin/viewSubmissions/${contentId}`);
  }
  const handleBulkDelete = async (ids) => {
    if (ids.length === 0) {
      alert("Please select at least one module to delete.")
      return;
    }
    const confirmed = await confirm({
      title: `Are you sure you want to delete these Modules?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // or 'warning', 'info'
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated items will be removed.',
    });
    if (confirmed) {
      try {
        dispatch(bulkDeleteContent(ids));
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
      subteam: "",
      category: "",
      trainingType: "",
      instructions: "",
      externalResource: "",
      enableFeedback: false,
      richText: "",
      thumbnail: "",
    });
  };
  const handleEditClick = (content) => {
    openEditModal(content)
    setShowEditModal(true);
    if (content.status === "Draft") {
      setDraftId(content.uuid);   // enables UPDATE draft
    } else {
      setDraftId(null);           // disables draft autosave
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const filterBtn = filterButtonRef.current;
      const bulkBtn = bulkButtonRef.current;
      const filterPanel = filterPanelRef.current;
      const bulkPanel = bulkPanelRef.current;

      if (
        (showFilters || showBulkAction) &&
        !(
          (filterPanel && filterPanel.contains(target)) ||
          (bulkPanel && bulkPanel.contains(target)) ||
          (filterBtn && filterBtn.contains(target)) ||
          (bulkBtn && bulkBtn.contains(target))
        )
      ) {
        setShowFilters(false);
        setShowBulkAction(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, showBulkAction]);

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setFilters(prev => ({
                ...prev,
                search: e.target.value
              }));
            }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              ref={filterButtonRef}
              className="control-btn"
              onClick={() => {
                setShowFilters(prev => {
                  const next = !prev;
                  if (next) {
                    setShowBulkAction(false);
                  }
                  return next;
                });
              }}
            >
              <Filter size={16} />
              Filter
            </button>
            {showFilters && (
              <div ref={filterPanelRef} className="globalmodule-filter-panel">
                <span
                  style={{ cursor: "pointer", position: "absolute", right: "10px", top: "10px" }}
                  onClick={() => setShowFilters(false)}
                >
                  <GoX size={20} color="#6b7280" />
                </span>
                <div className="filter-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={tempFilters?.status || ""}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="Saved">Saved</option>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>

                  </select>
                </div>
                <div className="filter-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={tempFilters?.category || ""}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    {categories?.map((category) => (
                      <option key={category._id} value={category}>
                        {category}
                      </option>
                    ))}

                  </select>
                </div>
                <div className="filter-actions">
                  <button className="btn-secondary" onClick={resetFilters} style={{ padding: '6px 12px', fontSize: '14px' }}>
                    Clear
                  </button>
                  <button className="btn-primary" onClick={handleFilter} style={{ padding: '6px 12px', fontSize: '14px' }}>
                    Apply
                  </button>

                </div>
              </div>
            )}
            {/* <button className="control-btn" style={{ color: "#6b7280", border: "1px solid #6b7280" }} onClick={() => openDraftModal()}> Drafts</button> */}
            {/* <button className="control-btn" onClick={() => setShowBulkAction(!showBulkAction)}> Bulk Action <ChevronDown size={16} /></button> */}
            <button
              ref={bulkButtonRef}
              className="control-btn"
              onClick={() => {
                setShowBulkAction(prev => {
                  const next = !prev;
                  if (next) {
                    setShowFilters(false);
                  }
                  return next;
                });
              }}
            > Bulk Action <ChevronDown size={16} /></button>
            {showBulkAction && (
              // <div className="bulk-action-panel-module">
              <div ref={bulkPanelRef} className="bulk-action-panel-module">
                <div className="bulk-action-header">
                  <label className="bulk-action-title">Items Selected: {derivedSelectedCount}</label>
                  <GoX
                    size={20}
                    title="Close"
                    aria-label="Close bulk action panel"
                    onClick={() => setShowBulkAction(false)}
                    className="bulk-action-close"
                  />
                </div>
                <div className="bulk-action-actions" style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    className="bulk-action-delete-btn"
                    disabled={derivedSelectedCount === 0}
                    onClick={() => handleBulkDelete(selectedIds)}
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

      <SelectionBanner
        selectionScope={selectionScope}
        selectedCount={derivedSelectedCount}
        currentPageCount={visibleIds.length}
        totalCount={totalItems}
        onClearSelection={clearSelection}
        onSelectAllPages={handleSelectAllAcrossPages}
        selectAllLoading={false}
        itemType="module"
        variant="default"
        showWelcomeMessage={true}
      />
      {showModal && <GlobalModuleModal showModal={showModal} setShowModal={setShowModal} newContent={newContent} handleInputChange={handleInputChange} uploading={uploading} setUploading={setUploading} handleRichInputChange={handleRichInputChange} error={error} />}
      {showEditModal && <GlobalModuleModal showModal={showEditModal} setShowModal={setShowEditModal} newContent={newContent} handleInputChange={handleInputChange} uploading={uploading} setUploading={setUploading} showEditModal={showEditModal} setShowEditModal={setShowEditModal} editContentId={editContentId} handleRichInputChange={handleRichInputChange} error={error} draftId={draftId} setDraftId={setDraftId} />}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>

              <th>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    position: 'relative',
                  }}
                >
                  {/* Master checkbox (same behaviour as before) */}
                  <input
                    type="checkbox"
                    checked={topCheckboxChecked}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = topCheckboxIndeterminate;
                      }
                    }}
                    onChange={(e) => handleSelectAllToggle(e.target.checked)}
                    aria-label="Select all modules on this page"
                  />

                  {/* Dropdown trigger (Chevron) — same idea as GroupsTable */}
                  <button
                    type="button"
                    ref={selectionTriggerRef}
                    className={`module-select-all-menu-toggle ${selectionMenuOpen ? 'open' : ''}`}
                    aria-haspopup="menu"
                    aria-expanded={selectionMenuOpen}
                    aria-label="Selection options"
                    onClick={() => {
                      const btn = selectionTriggerRef.current;
                      if (btn) {
                        const rect = btn.getBoundingClientRect();
                        const offset = 8;
                        setSelectionMenuPos({
                          top: rect.bottom + offset,
                          left: rect.left,
                        });
                      }
                      setSelectionMenuOpen((prev) => !prev);
                    }}
                    style={{
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',

                    }}
                  >
                    <ChevronDown size={15} className="chevron" />
                  </button>
                </div>

                {/* Flyout menu (fixed, like GroupsTable) */}
                {selectionMenuOpen && (
                  <div
                    ref={selectionMenuRef}
                    className="module-select-all-flyout"
                    role="menu"
                    style={{
                      position: 'fixed',
                      top: selectionMenuPos.top,
                      left: selectionMenuPos.left,
                      gap: '5px',

                    }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleSelectionOption('all')}
                      className={selectionScope === 'all' ? 'selected' : ''}

                    >
                      <span>Select all pages ({totalItems})</span>
                      {selectionScope === 'all' && (
                        <img
                          src="https://cdn.dribbble.com/assets/icons/check_v2-dcf55f98f734ebb4c3be04c46b6f666c47793b5bf9a40824cc237039c2b3c760.svg"
                          alt="selected"
                          className="check-icon"
                          style={{ width: 16, height: 16 }}
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleSelectionOption('page')}
                      className={selectionScope === 'page' ? 'selected' : ''}

                    >
                      <span>Select this page ({visibleIds.length})</span>
                      {selectionScope === 'page' && (
                        <img
                          src="https://cdn.dribbble.com/assets/icons/check_v2-dcf55f98f734ebb4c3be04c46b6f666c47793b5bf9a40824cc237039c2b3c760.svg"
                          alt="selected"
                          className="check-icon"
                          style={{ width: 16, height: 16 }}
                        />
                      )}
                    </button>


                  </div>
                )}
              </th>

              <th>Title</th>
              <th>Credits</th>
              <th>Status</th>

              <th>Date Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentContent.map((content) => (
              <tr key={content.uuid || content.id} className={isRowSelected(content.uuid) ? "selected-row" : ""}>

                <td><input type="checkbox" checked={isRowSelected(content.uuid)}
                  onChange={(e) => toggleSelectOne(content.uuid, e.target.checked)} /></td>
                <td>
                  <div className="assess-cell-content">
                    <div className="assess-title-container">
                      <h4 className="assess-title">{content.title}</h4>
                      <p className="assess-description">{content.description || "No description provided"}</p>
                      {Array.isArray(content.tags) && content.tags.length > 0 && (
                        <div className="assess-tags">
                          {content.tags.slice(0, 3).map((t, idx) => (
                            <span key={`${content.id}-tag-${idx}`} className="assess-classification">{t}</span>
                          ))}
                          {content.tags.length > 3 && (
                            <span className="assess-classification">+ {content.tags.length - 3} more</span>
                          )}
                        </div>

                      )}
                    </div>
                  </div>
                </td>
                <td>{content.credits}</td>
                <td>
                  <span className={` ${content.status === 'Published' ? 'published' : content.status === 'Draft' ? 'draft' : 'saved'} assess-status-badge`}>
                    {content.status === 'Published' ? `${content.status}` : content.status === 'Draft' ? 'Draft' : 'Saved'}
                  </span>
                </td>

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
                      className={`global-action-btn ${content.status === 'Draft' || content?.submissionEnabled ? 'analytics' : ''}`}
                      onClick={() => handleViewSubmissions(content._id)}
                      title="View Submissions"
                      disabled={content.status === 'Draft' || !content?.submissionEnabled}
                    >
                      <File size={16} />
                    </button>

                    <button className="global-action-btn edit" onClick={() => {
                      handleEditClick(content)
                    }}>
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="global-action-btn delete"
                      onClick={() => handleDeleteContent(content.uuid)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentContent.length === 0 && (
              <tr>
                <td colSpan="6" className="no-results">
                  No Global Modules found.
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
      <AnalyticsPop
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        data={analyticsData}
        loading={analyticsLoading}
      />

    </div>
  );
};

export default GlobalModuleManagement;