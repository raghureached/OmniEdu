import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminfetchDocument, admindeleteContent, admincreateContent, adminupdateContent, adminbulkDeleteContent } from '../../../store/slices/adminDocumentSlice';
import "./DocumentsManagement.css"
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ChevronDown, Edit3, FileText, Search, Trash2, Users, X, Filter, Plus, BarChart3, Download ,Share} from 'lucide-react';
import LoadingScreen from '../../../components/common/Loading/Loading'
import { RiDeleteBinFill } from "react-icons/ri";
import { FiEdit3 } from "react-icons/fi";
import DocumentsModal from './DocumentsModal';
import { GoX } from 'react-icons/go';
import { toast } from 'react-toastify';
import { notifyError, notifySuccess } from '../../../utils/notification';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog';
import api from '../../../services/api';
import SelectionBanner from '../../../components/Banner/SelectionBanner';
import { categories } from '../../../utils/constants';
import { exportModulesWithSelection } from '../../../utils/moduleExport';
import ExportModal from '../../../components/common/ExportModal/ExportModal';



const DocumentsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loading, error } = useSelector((state) => state.adminDocument);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContentId, setEditContentId] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftContent, setDraftContent] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [selectAllLoading, setSelectAllLoading] = useState(false);
  // console.log(items)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    timeRange: '',
    team: '',
    subteam: ''
  });
  const [tempFilters, setTempFilters] = useState({
    status: '',
    category: '',
    timeRange: '',
    team: '',
    subteam: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [filteredCounts, setFilteredCounts] = useState({
    total: 0,
    published: 0
  });
  const filterButtonRef = useRef(null);
  const bulkButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const bulkPanelRef = useRef(null);
  const [newContent, setNewContent] = useState({
    title: "",
    duration: "",
    // tags: [],
    // learningOutcomes: [''],
    // prerequisites: "",
    credits: 0,
    stars: 0,
    badges: 0,
    team: "",
    subteam: "",
    category: "",
    trainingType: "",
    instructions: "",
    // externalResource: "",
    // feedbackEnabled: false,
    thumbnail: "",
    // submissionEnabled: false,
  });
  const [teams,setTeams] = useState([])
  const [subteams, setSubteams] = useState([])
  const [uploading, setUploading] = useState(false)
  useEffect(() => {
    dispatch(adminfetchDocument());
  }, [dispatch]);

  // Handle navigation state for filters from AdminAnalytics
  useEffect(() => {
    if (location.state?.status || location.state?.category || location.state?.timeRange || location.state?.team) {
      const newFilters = {
        status: location.state.status || '',
        category: location.state.category || '',
        search: searchTerm || '',
        timeRange: location.state.timeRange || '',
        team: location.state.team || ''
      };
      setFilters(newFilters);
      setTempFilters(newFilters);
      
      // If timeRange is provided, we might need to filter modules based on creation date
      if (location.state.timeRange) {
        // This would require backend support to filter by creation date
        console.log('Time range filter:', location.state.timeRange);
      }
    }
  }, [location.state, searchTerm]);

  // Calculate filtered counts
  useEffect(() => {
    if (filters.status || filters.category || filters.timeRange || filters.team || filters.subteam) {
      // For total modules: count all modules (including drafts) matching category, team, subteam, and time range filters
      const totalFiltered = items?.filter((item) => {
        const matchesCategory = !filters.category || filters.category === '' || item.category === filters.category;
        const matchesTeam = !filters.team || filters.team === '' || item.team === filters.team;
        const matchesSubteam = !filters.subteam || filters.subteam === '' || item.subteam === filters.subteam;
        
        // Apply time range filter
        let matchesTimeRange = true;
        if (filters.timeRange && filters.timeRange !== '') {
          const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : filters.timeRange === '90d' ? 90 : 30;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          matchesTimeRange = new Date(item.createdAt) >= cutoffDate;
        }
        
        return matchesCategory && matchesTeam && matchesSubteam && matchesTimeRange;
      }) || [];
      
      // For published modules: count only published modules matching the filters
      const publishedFiltered = totalFiltered.filter(item => item.status === 'Published');
      
      setFilteredCounts({
        total: totalFiltered.length,
        published: publishedFiltered.length
      });
    } else {
      setFilteredCounts({
        total: 0,
        published: 0
      });
    }
  }, [filters, items]);
  const { confirm } = useConfirm();


  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get('/api/admin/getGroups');
        setTeams(res.data.data);
      } catch (error) {
        console.log(error);
      }
    }
    
    const fetchSubteams = async () => {
      try {
        const res = await api.get('/api/admin/analytics/getSubteams');
        setSubteams(res.data.subteams);
      } catch (error) {
        console.log(error);
      }
    }
    
    fetchTeams();
    fetchSubteams();

  }, []);

  const handleDeleteContent = async (contentId) => {
    const confirmed = await confirm({
      title: `Are you sure you want to delete this document?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // or 'warning', 'info'
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated assignments will be removed for users.',
    });
    if (!confirmed)  return;
      const res = await dispatch(admindeleteContent(contentId));
      if (admindeleteContent.fulfilled.match(res)) {
        notifySuccess("Content deleted successfully");
      } else {
        notifyError("Failed to delete content", {
          message: res.payload.message,
          title: "Failed to delete content"
        });
      }
    
  };

  const handleAnalyticsClick = async (contentId) => {
    try {
      setAnalyticsLoading(true);
      setShowAnalytics(true);
      console.log('Fetching analytics for content ID:', contentId);
      
      // Fetch analytics data for the specific content
      const response = await api.get(`/api/admin/analytics/content/${contentId}`);
      console.log('Analytics response:', response.data);
      setAnalyticsData(response.data.data);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      notifyError('Failed to load analytics data');
      setShowAnalytics(false);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = (exportScope) => {
    try {
      if (exportScope === 'selected') {
        // Export based on selection criteria and filters
        exportModulesWithSelection(
          items, 
          selectedIds, 
          excludedIds, 
          allSelected, 
          teams, 
          subteams, 
          filters
        );
        
        // Show appropriate success message
        if (allSelected) {
          const exportCount = totalItems - excludedIds.length;
          notifySuccess(`${exportCount} modules exported successfully`);
        } else if (selectedIds.length > 0) {
          notifySuccess(`${selectedIds.length} selected modules exported successfully`);
        } else {
          notifySuccess('Filtered modules exported successfully');
        }
      } else if (exportScope === 'all') {
        // Export all modules
        exportModulesWithSelection(
          items, 
          [], // No selected IDs
          [], // No excluded IDs  
          false, // Not all selected
          teams, 
          subteams, 
          { status: '', category: '', team: '', subteam: '', search: '' } // No filters
        );
        notifySuccess(`${items.length} modules exported successfully`);
      }
    } catch (error) {
      console.error('Export error:', error);
      notifyError('Failed to export modules');
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
      category: '',
      search: '',
      team: '',
      subteam: ''
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

    const matchesCategory = !filters.category || filters.category === '' || item.category === filters.category;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesTeam = !filters.team || filters.team === '' || item.team === filters.team;
    const matchesSubteam = !filters.subteam || filters.subteam === '' || item.subteam === filters.subteam;
    
    // Apply time range filter based on creation date
    let matchesTimeRange = true;
    if (filters.timeRange && filters.timeRange !== '') {
      const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : filters.timeRange === '90d' ? 90 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      matchesTimeRange = new Date(item.createdAt) >= cutoffDate;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesTeam && matchesSubteam && matchesTimeRange;
  }) || [];

  //pagination code
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // show 5 surveys per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContent = filteredContent.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);

  // ----------------- Gmail-style Selection Model -----------------


  const [selectedIds, setSelectedIds] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [excludedIds, setExcludedIds] = useState([]);
  const [selectionScope, setSelectionScope] = useState("none");
  const [selectedPageRef, setSelectedPageRef] = useState(null);
  const [allSelectionCount, setAllSelectionCount] = useState(null);

  // Normalize ID
  const resolveId = (m) => m?.uuid || m?._id || m?.id;

  // Visible IDs = current page modules
  const visibleIds = useMemo(
    () => (currentContent || []).map(resolveId).filter(Boolean),
    [currentContent]
  );


  // Total modules across all pages
  const totalItems = filteredContent?.length || 0;
  // Row is selected?
  const isRowSelected = useCallback(
    (id) => {
      if (!id) return false;
      return allSelected ? !excludedIds.includes(id) : selectedIds.includes(id);
    },
    [allSelected, excludedIds, selectedIds]
  );

  // Derived counts
  const derivedSelectedCount = useMemo(
    () => (allSelected ? totalItems - excludedIds.length : selectedIds.length),
    [allSelected, excludedIds.length, selectedIds.length, totalItems]
  );

  const derivedSelectedOnPage = useMemo(
    () => visibleIds.filter(isRowSelected),
    [visibleIds, isRowSelected]
  );

  // Header checkbox states
  const topCheckboxChecked =
    visibleIds.length > 0 &&
    visibleIds.every((id) => isRowSelected(id));

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

  // Toggle Select-All on page
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

  // Select ALL across all pages
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
      let next;
      if (checked) next = [...prev, id];
      else next = prev.filter((x) => x !== id);

      if (next.length === 0) clearSelection();
      else setSelectionScope("custom");

      return next;
    });
  };
  ////dropdown
  // For "Select all pages / Select this page" dropdown
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
  const handleSelectionOption = (option) => {
    switch (option) {
      case 'page':
        // Use your existing Gmail "select this page" logic
        handleSelectAllToggle(true);
        break;
      case 'all':
        // Use your existing "select all pages" logic
        handleSelectAllAcrossPages();
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
  const handleOpenContent = (contentId) => {
    navigate(`/global-admin/module/${contentId}`);
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
      const DocumentData = {
        ...newContent,
        id: Date.now(), // temporary id
        status: "Draft",
        createdDate: new Date().toISOString(),
      };
      dispatch(admincreateContent(DocumentData))

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
      // tags: content.tags || [],
      description: content.description || "",
      // learningOutcomes: content.learning_outcomes || [''],
      // additionalFile: content.additionalFile || null,
      // difficultyLevel: content.difficulty_level || "",
      // prerequisites: content.prerequisites || "",
      credits: content.credits || 0,
      stars: content.stars || 0,
      badges: content.badges || 0,
      team: content.team || "",
      subteam: content.subteam || "",
      category: content.category || "",
      trainingType: content.trainingType || "",
      instructions: content.instructions || "",
      // externalResource: content.externalResource || "",
      // feedbackEnabled: !!content.feedbackEnabled,
      richText: content.richText || "",
      thumbnail: content.thumbnail || "",
      // submissionEnabled: content.submissionEnabled || false,
    });
    setShowEditModal(true);
  };
  const drafts = localStorage.getItem('draftContent');
  const setDrafts = () => {
    setNewContent(JSON.parse(drafts));
    // setShowModal(true);
  }
  const handleBulkDelete = async (ids) => {
    if (ids.length === 0) {
      alert("Please select at least one document to delete.")
      return;
    }
    const confirmed = await confirm({
      title: `Are you sure you want to delete these documents?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // or 'warning', 'info'
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated assignments will be removed for users.',
    });
    if (confirmed) {
      try {
        const res = await dispatch(adminbulkDeleteContent(ids));
        if (adminbulkDeleteContent.fulfilled.match(res)) {
          notifySuccess("Documents deleted successfully", {
            message: "Documents deleted successfully",
            title: "Documents deleted successfully"
          });
        } else {
          notifyError("Failed to delete documents", {
            message: res.payload.message,
            title: "Failed to delete documents"
          });
        }
      } catch (error) {
        notifyError("Failed to delete documents", {
          message: error.message,
          title: "Failed to delete documents"
        });
      }
    }
  }

  const handleOpenModal = () => {
    setShowModal(true);
    setNewContent({
      title: "",
      type: "",
      duration: "",
      // tags: [],
      // learningOutcomes: [''],
      // additionalFile: null,
      primaryFile: null,
      // prerequisites: "",
      credits: 0,
      stars: 0,
      badges: 0,
      team: "",
      subteam: "",
      category: "",
      trainingType: "",
      instructions: "",
      // externalResource: "",
      // enableFeedback: false,
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

  const deleteDraft = (title) => {
    const drafts = JSON.parse(localStorage.getItem('drafts'));
    const updatedDrafts = drafts.filter((draft) => draft.title !== title);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
    setShowDraftModal(false)
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
    return <LoadingScreen text={"Loading Content..."} />
  }
  return (
    <div className="global-document-management">
      <div className="global-document-header">
        <div className="global-document-header-content">
          <div className="global-document-header-info">
            <h1 className="global-document-page-title">Document Management</h1>
            <p className="global-document-page-subtitle">Create, Manage and Organize your documents</p>
          </div>
          <div className="global-document-stats">
            <div className="global-document-stat-card">
              <div className="global-document-stat-icon">
                <FileText size={20} />
              </div>
              <div className="global-document-stat-info">
                <span className="global-document-stat-number">
                  {filters.status || filters.category || filters.timeRange || filters.team || filters.subteam ? filteredCounts.total : items.length}
                </span>
                <span className="global-document-stat-label">
                  Total Documents
                </span>
              </div>
            </div>
            <div className="global-document-stat-card">
              <div className="global-document-stat-icon published">
                <Users size={20} />
              </div>
              <div className="global-document-stat-info">
                <span className="global-document-stat-number">
                  {filters.status || filters.category || filters.timeRange || filters.team || filters.subteam ? filteredCounts.published : items.filter(a => a.status === 'Published').length}
                </span>
                <span className="global-document-stat-label">
                  Published
                </span>
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
            placeholder="Search Documents"
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
            <button
              className="control-btn"
              onClick={handleExport}
              title={derivedSelectedCount > 0 ? "Export selected Documents to CSV" : "Select Documents to export"}
              disabled={derivedSelectedCount === 0}
              style={{ 
                opacity: derivedSelectedCount === 0 ? 0.5 : 1,
                cursor: derivedSelectedCount === 0 ? 'not-allowed' : 'pointer'
              }}
            >
             
              Export<Share size={16} color="#6b7280" /> {derivedSelectedCount > 0 && `(${derivedSelectedCount})`}
            </button>
            {showFilters && (
              <div ref={filterPanelRef} className="admindocument-filter-panel">
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
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Team</label>
                  <select
                    name="team"
                    value={tempFilters?.team || ""}
                    onChange={(e) => {
                      handleFilterChange(e);
                      // Reset subteam when team changes
                      setTempFilters(prev => ({ ...prev, subteam: '' }));
                    }}
                  >
                    <option value="">All Teams</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Subteam</label>
                  <select
                    name="subteam"
                    value={tempFilters?.subteam || ""}
                    onChange={handleFilterChange}
                    disabled={!tempFilters?.team || tempFilters?.team === ''}
                  >
                    <option value="">All Subteams</option>
                    {subteams
                      .filter(subteam => !tempFilters?.team || tempFilters?.team === '' || subteam.team_id?._id === tempFilters?.team)
                      .map((subteam) => (
                        <option key={subteam._id} value={subteam._id}>
                          {subteam.name}
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
              <div ref={bulkPanelRef} className="admindocuments-bulk-action-panel">
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

            <button className="btn-primary" onClick={() => handleOpenModal()}> + Add Document </button>
          </div>
        </div>
      </div>

      {/* {selectionScope !== 'none' && derivedSelectedCount > 0 && (
        <div
          className="module-selection-banner"
          style={{ margin: '12px 0', justifyContent: 'center' }}
        >
          {selectionScope === 'page' ? (
            <>
              <span>
                All {visibleIds.length}{' '}
                {visibleIds.length === 1 ? 'module' : 'modules'} on this page are selected.
              </span>
              {totalItems > visibleIds.length && (
                <button
                  type="button"
                  className="selection-action action-primary"
                  onClick={handleSelectAllAcrossPages}
                  disabled={false}
                >
                  {`Select all ${totalItems} modules`}
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
                {derivedSelectedCount === 1 ? 'module' : 'modules'} are selected across
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
                {derivedSelectedCount === 1 ? 'module' : 'modules'} selected.
              </span>
              {totalItems > derivedSelectedCount && (
                <button
                  type="button"
                  className="selection-action action-primary"
                  onClick={handleSelectAllAcrossPages}
                >
                  {`Select all ${totalItems} modules`}
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
      )} */}

      <SelectionBanner
        selectionScope={selectionScope}
        selectedCount={derivedSelectedCount}
        currentPageCount={visibleIds.length}
        totalCount={totalItems}
        onClearSelection={clearSelection}
        onSelectAllPages={handleSelectAllAcrossPages}
        selectAllLoading={selectAllLoading}
        itemType="document"
        variant="default"
        showWelcomeMessage={true}
      />
      {showModal && <DocumentsModal showModal={showModal} setShowModal={setShowModal} newContent={newContent} handleInputChange={handleInputChange} handleAddContent={handleAddContent} uploading={uploading} setUploading={setUploading} handleRichInputChange={handleRichInputChange} error={error} teams={teams}/>}
      {showEditModal && <DocumentsModal showModal={showEditModal} setShowModal={setShowEditModal} newContent={newContent} handleInputChange={handleInputChange} uploading={uploading} setUploading={setUploading} showEditModal={showEditModal} setShowEditModal={setShowEditModal} editContentId={editContentId} handleRichInputChange={handleRichInputChange} error={error} teams={teams}/>}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onConfirm={handleExportConfirm}
          selectedCount={derivedSelectedCount}
          totalCount={totalItems}
          hasMembers={false}
          exportType="documents"
        />
      )}
      {currentContent.length === 0 ? (
        <div className='assess-table-section'>
          <div className='assess-table-container'>
            <div className="assess-empty-state">
              <div className="assess-empty-icon" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <FileText size={48} />
              </div>
              <h3>No documents found</h3>
              <p>Get started by creating your first document</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <button className="assess-btn-primary" onClick={handleOpenModal} >
                  <Plus size={16} />
                  Create Document
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {/* <th><input type="checkbox" checked={topCheckboxChecked}
                  ref={(el) => el && (el.indeterminate = topCheckboxIndeterminate)}
                  onChange={(e) => handleSelectAllToggle(e.target.checked)} /></th> */}
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
                    {/* Master checkbox (same as before) */}
                    <div style={{gap:4}}>
                    <input
                      type="checkbox"
                      checked={topCheckboxChecked}
                      ref={(el) => el && (el.indeterminate = topCheckboxIndeterminate)}
                      onChange={(e) => handleSelectAllToggle(e.target.checked)}
                    />
                    </div>

                    {/* Dropdown trigger (Chevron) */}
                    <div>
                    <button
                      type="button"
                      ref={selectionTriggerRef}
                      className={`document-select-all-menu-toggle ${selectionMenuOpen ? 'open' : ''}`}
                      aria-haspopup="menu"
                      aria-expanded={selectionMenuOpen}
                      aria-label="Selection options"
                      onClick={() => {
                        const btn = selectionTriggerRef.current;
                        if (btn) {
                          const rect = btn.getBoundingClientRect();
                          const offset = 8;
                          setSelectionMenuPos({ top: rect.bottom + offset, left: rect.left });
                        }
                        setSelectionMenuOpen((prev) => !prev);
                      }}
                      style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      <ChevronDown size={15} className="chevron" />
                    </button>
                    </div>
                  </div>

                  {/* Flyout menu (positioned like GroupsTable) */}
                  {selectionMenuOpen && (
                    <div
                      ref={selectionMenuRef}
                      className="document-select-all-flyout"
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
                          />
                        )}
                      </button>
                    </div>
                  )}
                </th>

                <th>Title</th>
                <th>Status</th>
                {/* <th>Team</th> */}
                <th>Date Published</th>
                <th style={{textAlign: 'left'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentContent.map((content) => {
                const id = resolveId(content); // <-- FIXED: define id correctly
                return (
                  <tr key={content.id}>
                    <td><input type="checkbox" checked={isRowSelected(id)} onChange={(e) => toggleSelectOne(id, e.target.checked)} /></td>
                    <td>
                      <div className="assess-cell-content">
                        <div className="assess-title-container">
                          <h4 className="assess-title">{content.title}</h4>
                          <p className="assess-description">{content.description || "No description provided"}</p>
                          {Array.isArray(content.tags) && content.tags.length > 0 && (
                            <div className="assess-tags">
                              {content.tags.slice(0, 4).map((t, idx) => (
                                <span key={`${content.id}-tag-${idx}`} className="assess-classification">{t}</span>
                              ))}
                              {content.tags.length > 4 && (
                                <span className="assess-classification">+ {content.tags.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={` ${content.status === 'Published' ? 'published' : content.status === 'Draft' ? 'draft' : 'saved'} assess-status-badge`}>
                        {content.status === 'Published' ? `${content.status}` : content.status === 'Draft' ? 'Draft' : 'Saved'}
                      </span>
                    </td>
                    {/* <td>{content.team?.name || "All"}</td> */}
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
                      <div style={{ display: "flex", gap: "10px",textAlign:"left" }}>
                      <button className="global-action-btn edit" onClick={() => {
                          setEditContentId(content.uuid)
                          openEditModal(content);
                        }}>
                          <Edit3 size={16} />
                        </button>
                         {content.status !== 'Draft' && (
                          <button
                            className="global-action-btn analytics"
                            onClick={() => handleAnalyticsClick(content.uuid)}
                            title="View Analytics"
                          >
                            <BarChart3 size={16} />
                          </button>
                        )}
                        <button
                          className="global-action-btn delete"
                          onClick={() => handleDeleteContent(content.uuid)}
                        >
                          <Trash2 size={16} />
                        </button>
                       
                        
                       
                      </div>
                    </td>
                  </tr>
                )
              })}
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
      )}
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

export default DocumentsManagement;