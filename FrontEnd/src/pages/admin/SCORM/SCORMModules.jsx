import React, { useState, useEffect, useMemo, useCallback    } from 'react';
import { useNavigate } from "react-router-dom";
import { Search, Plus, File, Trash2, Edit3, ChevronDown, Calendar, Play, FileText, Users, Share } from 'lucide-react';
import api from '../../../services/api';
import { useRef } from 'react';
import { Filter } from 'lucide-react';
import { GoX } from 'react-icons/go';
import { RiDeleteBinFill } from 'react-icons/ri';
import { notifySuccess, notifyError } from '../../../utils/notification';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog';
import "../ContentModules/ModuleManagement.css";
import ExportModal from '../../../components/common/ExportModal/ExportModal';
import SelectionBanner from '../../../components/Banner/SelectionBanner';
import {categories} from '../../../utils/constants';
import ScormModuleModal from './UploadScorm';
const SCORMModules = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        timeRange: '',
        team: '',
        subteam: ''
    });
    const [filteredCounts, setFilteredCounts] = useState({
        total: 0,
        published: 0
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [showExportModal, setShowExportModal] = useState(false);
    const [editContentId, setEditContentId] = useState("");
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    // Add these state variables at the top of your component
    const [showFilters, setShowFilters] = useState(false);
    const [showBulkAction, setShowBulkAction] = useState(false);
    const [tempFilters, setTempFilters] = useState({});
    const [teams, setTeams] = useState([]);
    const [subteams, setSubteams] = useState([]);
    const [showModal,setShowModal] = useState(false);
    const bulkButtonRef = useRef(null);
// Add this effect to handle clicks outside the filter and bulk action panels
useEffect(() => {
  const handleClickOutside = (event) => {
    if (filterPanelRef.current && !filterPanelRef.current.contains(event.target) && 
        filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
      setShowFilters(false);
    }
    if (bulkPanelRef.current && !bulkPanelRef.current.contains(event.target) && 
        bulkButtonRef.current && !bulkButtonRef.current.contains(event.target)) {
      setShowBulkAction(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
    // Add these refs
    const filterButtonRef = useRef(null);
    const bulkPanelRef = useRef(null);
    const filterPanelRef = useRef(null);

    // Add these handler functions
    const handleFilter = () => {
        setFilters({ ...tempFilters });
        setShowFilters(false);
    };

    const handleBulkDelete = async (ids) => {
        const confirmed = await confirm({
            title: "Delete Selected Modules",
            message: `Are you sure you want to delete ${ids.length} selected module(s)?`,
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            await Promise.all(ids.map(id => api.delete(`/api/scorm/delete/${id}`)));
            notifySuccess(`${ids.length} module(s) deleted successfully`);
            fetchModules();
            clearSelection();
        } catch (error) {
            console.error("Failed to delete modules:", error);
            notifyError("Failed to delete selected modules");
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setTempFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setTempFilters({});
        setFilters({});
        setSearchTerm("");
        setShowFilters(false);
    };

    

    // Selection state
    const [selectedIds, setSelectedIds] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [excludedIds, setExcludedIds] = useState([]);
    const [selectionScope, setSelectionScope] = useState("none");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    // Fetch SCORM modules
    const fetchModules = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/scorm/fetch');
            setModules(res.data.modules || []);
            // Initialize filtered counts
            updateFilteredCounts(res.data.modules || []);
        } catch (error) {
            console.error("Failed to fetch SCORM modules:", error);
            notifyError("Failed to load SCORM modules");
        } finally {
            setLoading(false);
        }
    };
    // Update filtered counts when modules or filters change
    const updateFilteredCounts = (modulesList) => {
  const filtered = modulesList.filter(module => {   
    const matchesSearch = !searchTerm ||
      module.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || module.status === filters.status;
    const matchesTeam = !filters.team || module.team === filters.team;
    const matchesSubteam = !filters.subteam || module.subteam === filters.subteam;
    const matchesCategory = !filters.category || module.category === filters.category;

    return matchesSearch && matchesStatus && matchesTeam && matchesSubteam && matchesCategory;
  });

  setFilteredCounts({
    total: filtered.length,
    published: filtered.filter(m => m.status === 'Published').length
  });
};
    useEffect(() => {
        fetchModules();
    }, []);

    // Launch SCORM module
    const launchModule = async (id) => {
        try {
            const res = await api.post('/api/scorm/launch', { moduleId: id });
            navigate("/player", { state: { url: res.data.launchUrl } });
        } catch (error) {
            console.error("Failed to launch SCORM module:", error);
            notifyError("Failed to launch SCORM module");
        }
    };

    // Delete SCORM module
    const handleDeleteModule = async (id) => {
        const confirmed = await confirm({
            title: "Delete SCORM Module",
            message: "Are you sure you want to delete this SCORM module? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            await api.delete(`/api/scorm/delete/${id}`);
            notifySuccess("SCORM module deleted successfully");
            fetchModules();
        } catch (error) {
            console.error("Failed to delete SCORM module:", error);
            notifyError("Failed to delete SCORM module");
        }
    };
    

    // Selection logic
    const resolveId = (m) => m?._id || m?.id;
    const visibleIds = useMemo(() => modules.map(resolveId).filter(Boolean), [modules]);
    const isRowSelected = useCallback(
        (id) => allSelected ? !excludedIds.includes(id) : selectedIds.includes(id),
        [allSelected, excludedIds, selectedIds]
    );

    const derivedSelectedCount = useMemo(
        () => (allSelected ? modules.length - excludedIds.length : selectedIds.length),
        [allSelected, excludedIds.length, selectedIds.length, modules.length]
    );

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
        setAllSelected(false);
        setExcludedIds([]);
        setSelectionScope("none");
    }, []);
    

    const toggleSelectOne = (id, checked) => {
        if (allSelected) {
            if (checked) {
                setExcludedIds(prev => prev.filter(x => x !== id));
            } else {
                setExcludedIds(prev => [...new Set([...prev, id])]);
            }
            return;
        }

        setSelectedIds(prev => {
            const next = checked ? [...prev, id] : prev.filter(x => x !== id);
            if (next.length === 0) clearSelection();
            return next;
        });
    };

    // Filter modules based on search term
    const filteredModules = useMemo(() => {
  return modules.filter(module => {
    const matchesSearch =
      !searchTerm ||
      module.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !filters.status || module.status === filters.status;

    const matchesTeam =
      !filters.team || module.team === filters.team;

    const matchesSubteam =
      !filters.subteam || module.subteam === filters.subteam;

    const matchesCategory =
      !filters.category || module.category === filters.category;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesTeam &&
      matchesSubteam &&
      matchesCategory
    );
  });
}, [modules, searchTerm, filters]);


    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentModules = filteredModules.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredModules.length / itemsPerPage);

    return (
        <div className="global-content-management">
            <div className="global-content-header">
                <div className="global-content-header-content">
                    <div className="global-content-header-info">
                        <h1 className="global-content-page-title">SCORM Management</h1>
                        <p className="global-content-page-subtitle">Create, Manage and Organize your SCORM modules</p>
                    </div>
                    <div className="global-content-stats">
                        <div className="global-content-stat-card">
                            <div className="global-content-stat-icon">
                                <FileText size={20} />
                            </div>
                            <div className="global-content-stat-info">
                                <span className="global-content-stat-number">
                                    {filteredCounts.total}
                                </span>
                                <span className="global-content-stat-label">
                                    Total Modules
                                </span>
                            </div>
                        </div>
                        <div className="global-content-stat-card published">
                            <div className="global-content-stat-icon">
                                <Users size={20} />
                            </div>
                            <div className="global-content-stat-info">
                                <span className="global-content-stat-number">
                                    {filteredCounts.published}
                                </span>
                                <span className="global-content-stat-label">
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
                        <button
                            className="control-btn"
                            // onClick={handleExport}
                            title={derivedSelectedCount > 0 ? "Export selected modules to CSV" : "Select modules to export"}
                            disabled={derivedSelectedCount === 0}
                            style={{
                                opacity: derivedSelectedCount === 0 ? 0.5 : 1,
                                cursor: derivedSelectedCount === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >

                            Export<Share size={16} color="#6b7280" /> {derivedSelectedCount > 0 && `(${derivedSelectedCount})`}
                        </button>
                        {showFilters && (
                            <div ref={filterPanelRef} className="adminmodule-filter-panel">
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
                            <div ref={bulkPanelRef} className="adminmodules-bulk-action-panel">
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

                        <button
                            className="btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            + Add Module
                        </button>
                    </div>
                </div>
            </div>

            <SelectionBanner
                selectionScope={selectionScope}
                selectedCount={derivedSelectedCount}
                currentPageCount={currentModules.length}
                totalCount={filteredModules.length}
                onClearSelection={clearSelection}
                onSelectAllPages={() => {
                    setAllSelected(true);
                    setExcludedIds([]);
                    setSelectionScope("all");
                }}
                itemType="module"
            />

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>Loading SCORM modules...</p>
                </div>
            ) : currentModules.length === 0 ? (
                <div className="empty-state">
                    <File size={48} className="empty-icon" />
                    <h3>No SCORM modules found</h3>
                    <p>Get started by uploading your first SCORM package</p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/admin/scorm/upload')}
                    >
                        <Plus size={16} /> Upload SCORM
                    </button>
                </div>
            ) : (
                <div className="table-container">
                    
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={currentModules.length > 0 && currentModules.every(m => isRowSelected(resolveId(m)))}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            if (checked) {
                                                setSelectedIds(currentModules.map(resolveId));
                                                setAllSelected(false);
                                                setExcludedIds([]);
                                                setSelectionScope("page");
                                            } else {
                                                clearSelection();
                                            }
                                        }}
                                    />
                                </th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentModules.map((module) => {
                                const id = resolveId(module);
                                return (
                                    <tr key={id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={isRowSelected(id)}
                                                onChange={(e) => toggleSelectOne(id, e.target.checked)}
                                            />
                                        </td>
                                        <td>
                                            <div className="module-title">
                                                <h4>{module.title || 'Untitled Module'}</h4>
                                                {module.description && <p>{module.description}</p>}
                                                {Array.isArray(module.tags) && module.tags.length > 0 && (
                                                    <div className="assess-tags">
                                                        {module.tags.slice(0, 4).map((t, idx) => (
                                                            <span key={`${module.id}-tag-${idx}`} className="assess-classification">{t}</span>
                                                        ))}
                                                        {module.tags.length > 4 && (
                                                            <span className="assess-classification">+ {module.tags.length - 4}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`assess-status-badge ${module.status?.toLowerCase() || 'draft'}`}>
                                                {module.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td>
                                            {module.createdAt ? (
                                                <div className="date-info">
                                                    <Calendar size={14} />
                                                    <span>
                                                        {new Date(module.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <button
                                                    className="global-action-btn analytics"
                                                    onClick={() => launchModule(module._id)}
                                                    title="Launch"
                                                >
                                                    <Play size={16} />
                                                </button>

                                                <button
                                                    className="global-action-btn edit"
                                                    onClick={() => {
                                                        setEditContentId(module._id);
                                                        // Implement edit functionality
                                                    }}
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className="global-action-btn delete"
                                                    onClick={() => handleDeleteModule(module._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {showModal && <ScormModuleModal showModal={showModal} setShowModal={setShowModal} teams={teams} onSuccess={() => fetchModules()}/>}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
            {showExportModal && (
                <ExportModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    onConfirm={() => {
                        // Implement export functionality
                        notifySuccess("Export started. You'll receive a notification when it's ready.");
                        setShowExportModal(false);
                    }}
                    selectedCount={derivedSelectedCount}
                    totalCount={modules.length}
                    exportType="SCORM modules"
                />
            )}
            
        </div>
    );
};

export default SCORMModules;