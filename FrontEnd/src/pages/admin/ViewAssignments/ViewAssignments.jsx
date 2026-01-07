import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminfetchAssignments, admindeleteAssignment, admingetAssignment } from '../../../store/slices/adminAssignmnetSlice';
import { Calendar, ChevronDown, FileText, Search, Trash2 } from 'lucide-react';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog';
import { notifyError, notifySuccess } from '../../../utils/notification';
import './ViewAssignments.css';

const ViewAssignments = () => {
  const dispatch = useDispatch();
  const { items = [], loading = false, error = null, selected, selectedLoading } = useSelector((s) => s.adminAssignments || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const statusSelectRef = useRef(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const { confirm } = useConfirm();
  const [showDetails, setShowDetails] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    dispatch(adminfetchAssignments());
  }, [dispatch]);

  const openDetails = useCallback((id) => {
    if (!id) return;
    setActiveId(id);
    setShowDetails(true);
    dispatch(admingetAssignment(id));
  }, [dispatch]);

  const closeDetails = useCallback(() => {
    setShowDetails(false);
    setActiveId(null);
  }, []);

  // Close filter panel on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        showFilters &&
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(e.target)
      ) {
        setShowFilters(false);
      }
      if (statusOpen && statusSelectRef.current && !statusSelectRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showFilters, statusOpen]);

  // Normalize assignment fields from API
  const normalize = (a) => ({
    id: a?.uuid || a?._id || a?.id,
    contentName: a?.contentName || a?.title || a?.content?.title || 'Untitled',
    contentType: a?.assign_type || a?.contentType || a?.type || 'Content',
    assignedTo:
      a?.assignedToName ||
      a?.assignedTo ||
      a?.user?.name ||
      a?.group?.name ||
      '—',
    assignOn: a?.assignOn || a?.assignedAt || a?.createdAt,
    dueDate: a?.dueDate || a?.deadline || '',
    status: a?.status || a?.assignmentStatus || 'Assigned',
  });

  const normalized = useMemo(() => (Array.isArray(items) ? items.map(normalize) : []), [items]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return normalized.filter((a) => {
      const matchesSearch =
        !term ||
        a.contentName.toLowerCase().includes(term) ||
        String(a.assignedTo).toLowerCase().includes(term);
      const matchesStatus = !statusFilter || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalized, searchTerm, statusFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  useEffect(() => {
    // Reset to first page when filters/search change
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleDelete = useCallback(
    async (assignmentId) => {
      const ok = await confirm({
        title: 'Unassign content?',
        note: 'This will remove the assignment from targeted users. Progress records might also be removed.',
        confirmText: 'Unassign',
        cancelText: 'Cancel',
        type: 'danger',
        showCheckbox: true,
        checkboxLabel: 'I understand this action cannot be undone.',
      });
      if (!ok) return;

      const res = await dispatch(admindeleteAssignment(assignmentId));
      if (admindeleteAssignment.fulfilled.match(res)) {
        notifySuccess('Assignment deleted successfully');
      } else {
        notifyError('Failed to delete assignment', {
          title: 'Delete failed',
          message: res?.payload?.message,
        });
      }
    },
    [dispatch, confirm]
  );

  return (
    <div className="view-assign-container">
      <div className="view-assign-header">
        <div className="view-assign-header-content">
          <div className="view-assign-header-info">
            <h1 className="view-assign-title">Assignments</h1>
            <p className="view-assign-subtitle">View and manage assignments. Editing is disabled here.</p>
          </div>
          <div className="view-assign-stats">
            <div className="view-assign-stat-card">
              <div className="view-assign-stat-icon">
                <FileText size={18} />
              </div>
              <div className="view-assign-stat-info">
                <span className="view-assign-stat-number">{filtered.length || 0}</span>
                <span className="view-assign-stat-label">Total Assignments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="view-assign-filterbar">
        <div className="view-assign-searchwrap">
          <Search size={16} className="view-assign-searchicon" />
          <input
            className="view-assign-input"
            placeholder="Search by content or assignee"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="view-assign-actions">
          <button
            ref={filterButtonRef}
            className="control-btn"
            onClick={() => setShowFilters((p) => !p)}
          >
            Filters <ChevronDown size={14} />
          </button>
          {showFilters && (
            <div ref={filterPanelRef} className="view-assign-filterpanel">
              <div className="view-assign-filtergroup">
                <label>Status</label>
                <div className="view-assign-selectwrap" ref={statusSelectRef}>
                  <button type="button" className="view-assign-select-display" onClick={() => setStatusOpen((p) => !p)}>
                    {statusFilter || 'All'}
                    <ChevronDown size={14} />
                  </button>
                  {statusOpen && (
                    <div className="view-assign-select-menu">
                      {['', 'Assigned', 'In Progress', 'Completed', 'Overdue', 'Removed'].map((opt) => (
                        <button
                          key={opt || 'all'}
                          type="button"
                          className={`view-assign-select-item ${statusFilter === opt ? 'active' : ''}`}
                          onClick={() => {
                            setStatusFilter(opt);
                            setStatusOpen(false);
                          }}
                        >
                          {opt || 'All'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="view-assign-filteractions">
                <button className="btn-secondary" onClick={() => setStatusFilter('')}>Clear</button>
                <button className="btn-primary" onClick={() => setShowFilters(false)}>Apply</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="view-assign-loading">Loading assignments...</div>
      ) : error ? (
        <div className="view-assign-error">{String(error)}</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Type</th>
                <th>Assigned On</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="view-assign-empty">No assignments found</td>
                </tr>
              ) : (
                currentRows.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="view-assign-cell">
                        <button
                          className="view-assign-titlecell"
                          onClick={() => openDetails(a.id)}
                          title="View assignment details"
                        >
                          {a.contentName}
                        </button>
                      </div>
                    </td>
                    <td>{a.contentType}</td>
                    <td>
                      <div className="view-assign-date"><Calendar size={14} />
                        <span>{a.assignOn ? new Date(a.assignOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                      </div>
                    </td>
                    <td>{a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                    <td>
                      <span className={`view-assign-badge ${
                            a.status === 'Completed' ? 'completed' :
                            a.status === 'Removed' ? 'overdue' :
                            a.status === 'In Progress' ? 'inprogress' : 'assigned'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div className="view-assign-actionsrow">
                        <button
                          className="global-action-btn delete"
                          title="Delete assignment"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetails && (
        <div className="view-assign-modal" role="dialog" aria-modal="true" onClick={closeDetails}>
          <div className="view-assign-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="view-assign-modal-header">
              <h3>Assignment Details</h3>
              <button className="view-assign-modal-close" onClick={closeDetails}>×</button>
            </div>
            {selectedLoading ? (
              <div className="view-assign-modal-body">Loading...</div>
            ) : !selected ? (
              <div className="view-assign-modal-body">No details found.</div>
            ) : (
              <div className="view-assign-modal-body">
                <div className="view-assign-detail-row"><span className="label">Content:</span><span>{selected?.contentName || '—'}</span></div>
                <div className="view-assign-detail-row"><span className="label">Type:</span><span>{selected?.contentType || '—'}</span></div>
                <div className="view-assign-detail-row"><span className="label">Assigned On:</span><span>{selected?.assign_on ? new Date(selected.assign_on).toLocaleString() : '—'}</span></div>
                <div className="view-assign-detail-row"><span className="label">Due Date:</span><span>{selected?.due_date ? new Date(selected.due_date).toLocaleString() : '—'}</span></div>
                <div className="view-assign-detail-row"><span className="label">Method:</span><span>{Array.isArray(selected?.assigned_users) && selected.assigned_users.length > 0 ? 'Individual' : (Array.isArray(selected?.groups) && selected.groups.length > 0 ? 'Groups' : '—')}</span></div>

                {Array.isArray(selected?.assigned_users) && selected.assigned_users.length > 0 && (
                  <div className="view-assign-detail-list">
                    <div className="label">Assigned Users ({selected.assigned_users.length}):</div>
                    <ul>
                      {selected.assigned_users.map((user) => (
                        <li key={user._id}>{user.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(selected?.groups) && selected.groups.length > 0 && (
                  <div className="view-assign-detail-list">
                    <div className="label">Teams ({selected.groups.length}):</div>
                    <ul>
                      {selected.groups.map((g) => (
                        <li key={g._id}>{g.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="view-assign-modal-footer">
              <button className="btn-secondary" onClick={closeDetails}>Close</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="view-assign-pagination">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewAssignments;
 
            