import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, deleteContent } from '../../../store/slices/contentSlice';
import LearningPathModal from './LearningPathModal';
import './LearningPaths.css';
import { ChevronDown, Edit3, FileText, Filter, Search, Trash2, Users } from 'lucide-react';
import { getLearningPaths } from '../../../store/slices/learningPathSlice';
import { deleteLearningPath } from '../../../store/slices/learningPathSlice';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { GoX } from 'react-icons/go';
import { RiDeleteBinFill } from 'react-icons/ri';

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
  const [tempFilters, setTempFilters] = useState({
    status: ''
  });
  const [filters, setFilters] = useState({
    status: ''
  });
  // State for filters
  const [nameSearch, setNameSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    dispatch(getLearningPaths());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    setFilters(prev => ({ ...prev, ...tempFilters }));
    setShowFilters(false);
  };

  const resetFilters = () => {
    const reset = { status: '' };
    setTempFilters(reset);
    setFilters(reset);
  };

  const handleBulkDelete = (ids) => {
    if (!ids || ids.length === 0) {
      alert('Please select at least one learning path to delete.');
      return;
    }
    if (window.confirm('Are you sure you want to delete the selected learning paths?')) {
      ids.forEach(id => dispatch(deleteLearningPath(id)));
      setSelectedIds([]);
      setShowBulkAction(false);
    }
  };

  const handleDeletePath = (pathId) => {
    if (window.confirm('Are you sure you want to delete this learning path?')) {
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
  }
  const filteredPaths = learningPaths.filter(path => {
    const matchesName = path.title.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesClassification = classificationFilter === 'all' || path.classification === classificationFilter;
    const statusActive = (filters.status && filters.status.length > 0) ? filters.status : statusFilter;
    const matchesStatus = statusActive === 'all' || statusActive === '' || path.status === statusActive;

    return matchesName && matchesClassification && matchesStatus;
  });

  const total = filteredPaths.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const startIndex = (page - 1) * itemsPerPage;
  const pageItems = filteredPaths.slice(startIndex, startIndex + itemsPerPage);

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
        <div style={{display:"flex",gap:"10px",position:"relative"}}>
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
          <div ref={filterPanelRef} className="adminmodule-filter-panel" style={{"left":"-40px"}}>
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
            <div className="filter-actions">
              <button className="btn-primary" onClick={handleFilter}>
                Apply
              </button>
              <button className="reset-btn" onClick={resetFilters}>
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
          <div ref={bulkPanelRef} className="adminmodules-bulk-action-panel" style={{"left":"-40px","right":"1000px"}}>
            <div className="bulk-action-header">
              <label className="bulk-action-title">Items Selected: {selectedIds.length}</label>
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
                disabled={selectedIds.length === 0}
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

      <div className="learnpath-table-wrapper">
        {filteredPaths.length === 0 ? (
          <div className="learnpath-empty">No learning paths found</div>
        ) : (
          <table className="learnpath-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={toggleSelectAll} checked={pageItems.length > 0 && pageItems.every(p => selectedIds.includes(p.id))} aria-label="Select all rows" /></th>
                <th>Name</th>
                {/* <th>Classification</th> */}
                <th>Status</th>
                {/* <th>Version</th> */}
                <th>Est. Duration</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((path) => (
                <tr key={path.id}>
                  <td>
                    <input type="checkbox" onChange={(e) => handleSelectPath(e, path.id)} checked={selectedIds.includes(path.id)} aria-label={`Select row ${path.title}`} />
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
                    <span className={`learnpath-badge learnpath-${path.status.toLowerCase()}`}>{path.status}</span>
                  </td>
                  {/* <td>{path.version}</td> */}
                  <td>{normalizeDuration(path.duration)}</td>
                  <td>{new Date(path.updatedAt).toLocaleDateString()}</td>
                  <td className="learnpath-actions">
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="global-action-btn delete"
                        onClick={() => handleDeletePath(path.uuid)}>
                        <Trash2 size={16} />
                      </button>
                      <button className="global-action-btn edit" onClick={() => handleEditPath(path)}>
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                
              ))}
              <tr>
                <td colSpan={6}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      {/* <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {(() => {
                        const start = assessments.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
                        const end = Math.min(pagination.page * pagination.limit, pagination.total || start);
                        const total = pagination.total || 0;
                        return `Showing ${start}-${end} of ${total}`;
                      })()}
                    </div> */}
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
    </div>
  );
};

export default LearningPaths;