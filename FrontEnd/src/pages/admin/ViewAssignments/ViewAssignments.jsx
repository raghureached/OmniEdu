import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminfetchAssignments, admindeleteAssignment, admingetAssignment } from '../../../store/slices/adminAssignmnetSlice';
import { Calendar, ChevronDown, FileText, Search, Trash2 } from 'lucide-react';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog';
import { notifyError, notifySuccess } from '../../../utils/notification';
import './ViewAssignments.css';
import AssignmnetsPopUp from './AssignmnetsPopUp';
import api from '../../../services/api';

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
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
    const[title,setTitle] = useState("")
  useEffect(() => {
    dispatch(adminfetchAssignments());
  }, [dispatch]);

  const fetchDetails = useCallback(async (id) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/api/admin/assignments/${id}/progress`, { params: { page: 1, limit: 50 } });
      const payload = res?.data?.data || { items: [], total: 0, page: 1, limit: 50 };
      const totalAssignments = (payload.items || []).map((p) => {
        const user = p.user_id || {};
        const assign = p.assignment_id || {};
        const contentTitle = assign?.contentId?.title || assign?.contentId?.name || 'Unknown Resource';
        const assignedBy = assign?.created_by?.name || 'System';
        return {
          progressId: p._id,
          userName: user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User',
          email: user.email || '',
          assignment_id: assign,
          contentType: (assign?.contentType || p.contentType || 'course').toLowerCase(),
          resourceName: contentTitle,
          assignedOn: assign?.assign_on || p.createdAt,
          startedOn: p.started_at,
          completedOn: p.completed_at,
          score: p.score || 0,
          status: p.status || 'not-started',
          assignedBy: assignedBy,
          updated_at: p.updatedAt,
        };
      });
      setDetailsData({ totalAssignments });
    } catch (e) {
      notifyError('Failed to load assignment details');
      setDetailsData({ totalAssignments: [] });
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const openDetails = useCallback(async (id,name) => {
    if (!id) return;
    setActiveId(id);
    setShowDetails(true);
    setTitle(name)
    await fetchDetails(id);
    dispatch(admingetAssignment(id));
  }, [dispatch, fetchDetails]);

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
    name:a.name,
    participants: a.assigned_users?.length || a.bulkEmails?.length || a.groups?.length || 0,
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
//   console.log(currentRows)
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  useEffect(() => {
    // Reset to first page when filters/search change
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);


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
            placeholder="Search by Assignment Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="view-assign-actions">
          {/* <button
            ref={filterButtonRef}
            className="control-btn"
            onClick={() => setShowFilters((p) => !p)}
          >
            Filters <ChevronDown size={14} />
          </button> */}
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
                <th>Name</th>
                <th>Assigned On</th>
                <th>Due Date</th>
                <th>Participants</th>
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
                          onClick={() => openDetails(a.id,a.name)}
                          title="View assignment details"
                        >
                          {a.name}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="view-assign-date"><Calendar size={14} />
                        <span>{a.assignOn ? new Date(a.assignOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                      </div>
                    </td>
                    <td>{a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                    <td>{a.participants}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetails && (
        <AssignmnetsPopUp
            title={title}
          isOpen={showDetails}
          onClose={closeDetails}
          data={detailsData}
          loading={detailsLoading}
          hideUserName={false}
          analyticsType={'module'}
          assignmentId={activeId}
          onRefresh={() => activeId && fetchDetails(activeId)}
        />
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
 
            