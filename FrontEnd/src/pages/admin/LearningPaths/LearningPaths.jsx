import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, deleteContent } from '../../../store/slices/contentSlice';
import LearningPathModal from './LearningPathModal';
import './LearningPaths.css';
import { ChevronDown, Edit3, FileText, Filter, Plus, Search, Trash2, Users, BarChart3, Share } from 'lucide-react';
import { getLearningPaths } from '../../../store/slices/learningPathSlice';
import { deleteLearningPath } from '../../../store/slices/learningPathSlice';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { GoX } from 'react-icons/go';
import { RiDeleteBinFill } from 'react-icons/ri';
import SelectionBanner from '../../../components/Banner/SelectionBanner';
import { categories } from '../../../utils/constants';
import AnalyticsPop from '../../../components/AnalyticsPopup/AnalyticsPop';
import api from '../../../services/api';
import { notifyError, notifySuccess } from '../../../utils/notification';
import ExportModal from '../../../components/common/ExportModal/ExportModal';
import { exportLearningPathsWithSelection } from '../../../utils/learningPathExport';
import CustomSelect from '../../../components/dropdown/DropDown';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog';



const LearningPaths = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.content);
  const { assessments } = useSelector((state) => state.adminAssessments)
  const { learningPaths, loading } = useSelector((state) => state.learningPaths)
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const filterButtonRef = useRef(null);
  const bulkButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const bulkPanelRef = useRef(null);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const {confirm} = useConfirm();
  const [tempFilters, setTempFilters] = useState({
    status: '',
    category: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  // State for filters
  const [nameSearch, setNameSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    dispatch(getLearningPaths());
  }, [dispatch]);

  // Close filter/bulk panels on outside click
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({ ...prev, [name]: value }));
  };

  // Export handlers
  const handleExport = () => {
    setShowExportModal(true);
  };
  const handleExportConfirm = (exportScope) => {
    try {
      if (exportScope === 'selected') {
        exportLearningPathsWithSelection(filteredPaths, selectedIds, excludedIds, allSelected);
      } else if (exportScope === 'all') {
        exportLearningPathsWithSelection(filteredPaths, [], [], false);
      }
      clearSelection();
    } catch (e) {
      console.error('Export learning paths failed', e);
      notifyError('Failed to export learning paths');
    }
     clearSelection();
  };

  const handleFilter = () => {
    setFilters(prev => ({ ...prev, ...tempFilters }));
    setShowFilters(false);
  };

  const resetFilters = () => {
    const reset = { status: '', category: '' };
    setTempFilters(reset);
    setFilters(reset);
  };
  const filteredPaths = learningPaths.filter(path => {
    const matchesName = path.title.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesClassification = classificationFilter === 'all' || path.classification === classificationFilter;
    const statusActive = (filters.status && filters.status.length > 0) ? filters.status : statusFilter;
    const matchesStatus = statusActive === 'all' || statusActive === '' || path.status === statusActive;
    const matchesCategory = !filters.category || filters.category === '' || path.category === filters.category;

    return matchesName && matchesClassification && matchesStatus && matchesCategory;
  });
  const total = filteredPaths.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const startIndex = (page - 1) * itemsPerPage;
  const pageItems = filteredPaths.slice(startIndex, startIndex + itemsPerPage);

  // ---------------- Gmail-style Selection Model ----------------


  const [allSelected, setAllSelected] = useState(false);
  const [excludedIds, setExcludedIds] = useState([]);
  const [selectionScope, setSelectionScope] = useState("none");
  const [selectedPageRef, setSelectedPageRef] = useState(null);
  const [allSelectionCount, setAllSelectionCount] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Normalize ID
  const resolveId = (p) => p?.uuid || p?.id;

  // Visible rows on this page
  const visibleIds = useMemo(
    () => (pageItems || []).map(resolveId).filter(Boolean),
    [pageItems]
  );

  // Total items across all filtered results
  const totalItems = filteredPaths.length;

  // Check if row is selected
  const isRowSelected = useCallback(
    (id) => {
      if (!id) return false;
      return allSelected ? !excludedIds.includes(id) : selectedIds.includes(id);
    },
    [allSelected, excludedIds, selectedIds]
  );

  // Derived selected count
  const derivedSelectedCount = useMemo(() => {
    return allSelected
      ? totalItems - excludedIds.length
      : selectedIds.length;
  }, [allSelected, excludedIds.length, selectedIds.length, totalItems]);

  // Header checkbox states
  const topCheckboxChecked =
    visibleIds.length > 0 && visibleIds.every((id) => isRowSelected(id));

  const topCheckboxIndeterminate =
    visibleIds.some((id) => isRowSelected(id)) && !topCheckboxChecked;

  // Reset selection
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setAllSelected(false);
    setExcludedIds([]);
    setSelectionScope("none");
    setSelectedPageRef(null);
    setAllSelectionCount(null);
  }, []);

  // Toggle select-all on page
  const handleSelectAllToggle = (checked) => {
    if (checked) {
      setSelectedIds(visibleIds);
      setExcludedIds([]);
      setAllSelected(false);
      setSelectionScope("page");
      setSelectedPageRef(page);
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

  // Select ALL across all pages
  const handleSelectAllAcrossPages = () => {
    setAllSelected(true);
    setExcludedIds([]);
    setSelectionScope("all");
    setAllSelectionCount(totalItems);
  };

  // Toggle individual row
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
  // Map dropdown options -> existing selection logic
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



  const handleBulkDelete = async(ids) => {
    if (!ids || ids.length === 0) {
      alert('Please select at least one learning path to delete.');
      return;
    }
    const confirmed = await confirm({
      title: `Are you sure you want to delete these Learning Paths?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // or 'warning', 'info'
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated assignments will be removed for users.',
    });
    if (confirmed) {
      ids.forEach(id => dispatch(deleteLearningPath(id)));
      setSelectedIds([]);
      setShowBulkAction(false);
    }
    clearSelection();
  };

  const handleDeletePath = async (pathId) => {
    const confirmed = await confirm({
      title: `Are you sure you want to delete this Learning Path?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // or 'warning', 'info'
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated assignments will be removed for users.',
    });
    if (confirmed) {
      // Optional backend sync
      dispatch(deleteLearningPath(pathId));
    }
  };
  const toggleSelectAll = () => {
    const visibleIds = pageItems.map(p => p.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };
  const openCreateModal = () => {
    setEditingPath(null);
    setIsModalOpen(true);
  };

  const openEditModal = (path) => {
    setEditingPath(path);
    setIsModalOpen(true);
  };

  const handleSavePath = (data) => {
    const { tagsText, ...payload } = data || {};
    if (editingPath) {
      // update
      // dispatch((editingPath.id, payload));
    } else {
      // create
      const newItem = {
        id: Math.max(0, ...learningPaths.map(p => p.id)) + 1,
        title: payload.title,
        classification: payload.classification,
        status: payload.status,
        version: payload.version || '1.0',
        updatedAt: new Date().toISOString(),
        moduleCount: 0,
        enrolledCount: 0,
        completionRate: '0%',
        description: payload.description || '',
        tags: Array.isArray(payload.tags) ? payload.tags : []
      };
    }
    setIsModalOpen(false);
    setEditingPath(null);
  };
  const handleEditPath = (path) => {
    setIsModalOpen(true)
    setEditingPath(path)
    // console.log(path)
  };

  const handleLearningPathAnalytics = async (path) => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get(`/api/admin/analytics/learningPath/${path.uuid}`);
      if (response.data.success) {
        setAnalyticsData(response.data.data);
        setShowAnalytics(true);
      } else {
        notifyError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching learning path analytics:', error);
      notifyError('Error loading analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };



  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages]);
  const handleSelectPath = (e, pathId) => {
    if (e.target.checked) {
      setSelectedIds(prev => Array.from(new Set([...prev, pathId])));
    } else {
      setSelectedIds(prev => prev.filter(id => id !== pathId));
    }
  };
  // Handle filter reset
  const handleFilterReset = () => {
    setNameSearch('');
    setClassificationFilter('all');
    setStatusFilter('all');
  };
  const normalizeDuration = (duration) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  }
  if (loading) {
    return <LoadingScreen text="Loading Learning Paths" />
  }

  return (
    <div className="learnpath-container">
      <div className="learnpath-header">
        <div className="learnpath-header-content">
          <div className="global-content-header-info">
            <h1 className="global-content-page-title">Learning Paths Management</h1>
            <p className="global-content-page-subtitle">Create, Manage and Organize your learning paths</p>
          </div>
          <div className="global-content-stats">
            <div className="global-content-stat-card">
              <div className="global-content-stat-icon">
                <FileText size={20} />
              </div>
              <div className="global-content-stat-info">
                <span className="global-content-stat-number">{learningPaths.length}</span>
                <span className="global-content-stat-label"> Learning Paths</span>
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

      <div className="learnpath-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="learnpath-filter-row">
          <div className="search-box-content">
            {/* <label>Name</label> */}
            <Search size={16} color="#6b7280" className="search-icon" />

            <input type="text" placeholder="Search Learning Paths" value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", position: "relative" }}>
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
          <button
            className="control-btn"
            onClick={handleExport}
            title={derivedSelectedCount > 0 ? "Export selected learning paths to CSV" : "Open export options"}
            disabled={derivedSelectedCount === 0}
            style={{
              opacity: (filteredPaths?.length || 0) === 0 ? 0.5 : 1,
              cursor: (filteredPaths?.length || 0) === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Export <Share size={16} color="#6b7280" /> {derivedSelectedCount > 0 && `(${derivedSelectedCount})`}
          </button>
          {showFilters && (
            <div ref={filterPanelRef} className="adminmodule-filter-panel" style={{ "left": "-40px",width:"220px" }}>
              <span
                style={{ cursor: "pointer", position: "absolute", right: "10px", top: "10px" }}
                onClick={() => setShowFilters(false)}
              >
                <GoX size={20} color="#6b7280" />
              </span>
              <div className="filter-group">
                <label>Status</label>
                <CustomSelect
                  value={(tempFilters?.status || '') || 'All'}
                  options={[
                    { value: 'All', label: 'All' },
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Published', label: 'Published' },
                  ]}
                  onChange={(value) =>
                    setTempFilters(prev => ({ ...prev, status: value === 'All' ? '' : value }))
                  }
                  placeholder="Select Status"
                  searchable={false}
                />
              </div>
              <div className="filter-group">
                <label>Category</label>
                <CustomSelect
                  value={(tempFilters?.category || '') || 'All'}
                  options={[{ value: 'All', label: 'All' }, ...categories.map(c => ({ value: c, label: c }))]}
                  onChange={(value) =>
                    setTempFilters(prev => ({ ...prev, category: value === 'All' ? '' : value }))
                  }
                  placeholder="Select Category"
                  searchable={true}
                />
              </div>

              <div className="filter-actions">
                <button className="btn-primary" onClick={handleFilter} style={{ padding: '6px 12px', fontSize: '14px' }}>
                  Apply
                </button>
                <button className="reset-btn" onClick={resetFilters} style={{ padding: '6px 12px', fontSize: '14px' }}>
                  Clear
                </button>
              </div>
            </div>
          )}
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
            <div ref={bulkPanelRef} className="adminmodules-bulk-action-panel" style={{ "left": "183px", "right": "1000px" }}>
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
                  className="btn-primary"
                  style={{background:"red"}}
                  disabled={derivedSelectedCount === 0}
                  onClick={() => handleBulkDelete(selectedIds)}
                >
                  <RiDeleteBinFill size={16} color="#fff" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
          <button className="btn-primary" onClick={openCreateModal}>+ Add Learning Path</button>

        </div>

      </div>
      {/* {selectionScope !== 'none' && derivedSelectedCount > 0 && (
        <div
          className="LearningPath-selection-banner"
          style={{ margin: '12px 0', justifyContent: 'center' }}
        >
          {selectionScope === 'page' ? (
            <>
              <span>
                All {visibleIds.length}{' '}
                {visibleIds.length === 1 ? 'LearningPath' : 'LearningPaths'} on this page are selected.
              </span>
              {totalItems > visibleIds.length && (
                <button
                  type="button"
                  className="selection-action action-primary"
                  onClick={handleSelectAllAcrossPages}
                  disabled={false }
                >
                  {`Select all ${totalItems} LearningPaths`}
                </button>
              )}
              <button
                type="button"
                className="selection-action action-link"
                onClick={clearSelection}
              >
                Clear selection
              </button>
            </>
          ) : selectionScope === 'all' ? (
            <>
              <span>
                All {derivedSelectedCount}{' '}
                {derivedSelectedCount === 1 ? 'LearningPath' : 'LearningPaths'} are selected across
                all pages.
              </span>
              <button
                type="button"
                className="selection-action action-link"
                onClick={clearSelection}
              >
                Clear selection
              </button>
            </>
          ) : (
            <>
              <span>
                {derivedSelectedCount}{' '}
                {derivedSelectedCount === 1 ? 'LearningPath' : 'LearningPaths'} selected.
              </span>
              {totalItems > derivedSelectedCount && (
                <button
                  type="button"
                  className="selection-action action-primary"
                  onClick={handleSelectAllAcrossPages}
                >
                  {`Select all ${totalItems} LearningPaths`}
                </button>
              )}
              <button
                type="button"
                className="selection-action action-link"
                onClick={clearSelection}
              >
                Clear selection
              </button>
            </>
          )}
        </div>
      )}  */}
      
      <SelectionBanner
        selectionScope={selectionScope}
        selectedCount={derivedSelectedCount}
        currentPageCount={visibleIds.length}
        totalCount={totalItems}
        onClearSelection={clearSelection}
        onSelectAllPages={handleSelectAllAcrossPages}
        selectAllLoading={false}
        itemType="learning path"
        variant="default"
        showWelcomeMessage={true}
      />
      <div className="learnpath-table-wrapper">
        {filteredPaths.length === 0 ? (
          <div className="assess-empty-state">
            <div className="assess-empty-icon" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <FileText size={48} />
            </div>
            <h3>No learning paths found</h3>
            <p>Get started by creating your first learning path</p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <button className="assess-btn-primary" onClick={openCreateModal} >
                <Plus size={16} />
                Create Learning Path
              </button>
            </div>
          </div>
        ) : (
          <table className="learnpath-table">
            <thead>
              <tr>
                {/* <th><input type="checkbox" checked={topCheckboxChecked}
                  ref={(el) => el && (el.indeterminate = topCheckboxIndeterminate)}
                  onChange={(e) => handleSelectAllToggle(e.target.checked)} aria-label="Select all rows" /></th> */}
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
                      aria-label="Select all rows"
                    />

                    {/* Dropdown trigger (Chevron) – copied from GroupsTable */}
                    <button
                      type="button"
                      ref={selectionTriggerRef}
                      className={`LearningPath-select-all-menu-toggle ${selectionMenuOpen ? 'open' : ''}`}
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

                  {/* Flyout menu (fixed, same style idea as GroupsTable) */}
                  {selectionMenuOpen && (
                    <div
                      ref={selectionMenuRef}
                      className="LearningPath-select-all-flyout"
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
                <th>Name</th>
                {/* <th>Classification</th> */}
                <th>Status</th>
                {/* <th>Version</th> */}
                <th>Est. Duration</th>
                <th>Last Updated</th>
                <th style={{textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((path) => (
                <tr key={resolveId(path)}
                  className={isRowSelected(resolveId(path)) ? "selected-row" : ""}>
                  <td>
                    <input type="checkbox" checked={isRowSelected(resolveId(path))}
                      onChange={(e) => toggleSelectOne(resolveId(path), e.target.checked)} aria-label={`Select row ${path.title}`} />
                  </td>
                  <td>
                    <div className="learnpath-name">
                      <div className="learnpath-title-wrap">
                        <h4 className="learnpath-name-title">{path.title}</h4>
                        <p className="learnpath-name-desc">{path.description.slice(0, 50) + '...' || 'No description provided'}</p>
                        {Array.isArray(path.tags) && path.tags.length > 0 && (
                          <div className="learnpath-tags">
                            {path.tags.slice(0, 4).map((t, idx) => (
                              <span key={`${path.id}-tag-${idx}`} className="assess-classification">{t}</span>
                            ))}
                            {path.tags.length > 4 && (
                              <span className="assess-classification">+ {path.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* <td>{path.classification}</td> */}
                  <td>
                    <span className={` ${path.status === 'Published' ? 'published' : path.status === 'Draft' ? 'draft' : 'saved'} assess-status-badge`}>
                        {path.status === 'Published' ? `${path.status}` : path.status === 'Draft' ? 'Draft' : 'Saved'}
                      </span>
                  </td>
                  {/* <td>{path.version}</td> */}
                  <td>{normalizeDuration(path.duration)}</td>
                  <td>{new Date(path.updatedAt).toLocaleDateString()}</td>
                  <td className="learnpath-actions">
                    <div style={{ display: "flex", gap: "10px" }}>
                    <button className="global-action-btn edit" onClick={() => handleEditPath(path)}>
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="global-action-btn analytics"
                        onClick={() => handleLearningPathAnalytics(path)}
                        disabled={analyticsLoading}
                        title="View Analytics"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button
                        className="global-action-btn delete"
                        onClick={() => handleDeletePath(path.uuid)}>
                        <Trash2 size={16} />
                      </button>
                     
                    </div>
                  </td>
                </tr>

              ))}
              <tr>
                <td colSpan={6}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1 || loading}
                        style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: page <= 1 || loading ? 'not-allowed' : 'pointer' }}
                      >
                        Prev
                      </button>
                      <span style={{ color: '#0f172a' }}>
                        {`Page ${page} of ${totalPages}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={loading || page >= totalPages}
                        style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: loading || page >= totalPages ? 'not-allowed' : 'pointer' }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <LearningPathModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPath(null); }}
        onSave={handleSavePath}
        initialData={editingPath}
      />
      
      <AnalyticsPop
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        data={analyticsData}
        loading={analyticsLoading}
        analyticsType="learningPath"
      />
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleExportConfirm}
        selectedCount={derivedSelectedCount}
        totalCount={filteredPaths.length}
        exportType="learningpaths"
      />
    </div>
  );
};

export default LearningPaths;