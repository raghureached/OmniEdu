import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Plus, Edit3, Trash2, User, Users } from 'lucide-react';
import '../UsersManagement.css';
const UsersTable = ({
  users,
  selectedItems,
  topCheckboxChecked,
  topCheckboxIndeterminate,
  onTopCheckboxToggle,
  onOpenSelectMenu, // deprecated: kept for backward compatibility, no longer used
  menuOpen: _legacyMenuOpen, // deprecated
  onSelectItem,
  resolveUserId,
  getStatusLabel,
  buildUserTagLabels,
  openPreview,
  handleAssignToTeam,
  openForm,
  handleDelete,
  currentPage,
  totalPages,
  handlePageChange,
  sortKey,
  sortDir,
  onSortChange,
  // New props to mirror GroupsTable behavior
  onSelectionOption,
  selectionScope,
  selectAllLoading,
  handleCreateUser,
  // Count props for dropdown
  pageSelectionCount,
  totalFilteredCount,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const checkboxRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = Boolean(topCheckboxIndeterminate);
    }
  }, [topCheckboxIndeterminate]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event) => {
      if (!menuRef.current) return;
      if (
        !menuRef.current.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const handleReposition = () => {
      const btn = triggerRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const offset = 8;
      setMenuPos({ top: rect.bottom + offset, left: rect.left });
    };
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    handleReposition();
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  return (
    users.length==0?(
      <div className="users-empty-state">
        <div className="users-empty-icon">
          <Users size={48} />
        </div>
        <h3>No Users found</h3>
        <p>Start by adding your first user</p>
        <button className="btn-primary" onClick={handleCreateUser}>
          <Plus size={16} />
          Add User
        </button>
      </div>
    ):(
    <div className="users-table-container">
      <div className="users-table-header">
        {/* checkbox */}
        <div className="users-checkbox-cell" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            ref={checkboxRef}
            onChange={(e) => onTopCheckboxToggle(e.target.checked)}
            checked={topCheckboxChecked}
          />
        </div>
        {/* page */}
        <div style={{ textAlign: "left" }}>
          <button
            type="button"
            ref={triggerRef}
            className={`users-select-all-menu-toggle ${menuOpen ? 'open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={!!menuOpen}
            aria-label="Selection options"
            onClick={() => {
              const btn = triggerRef.current;
              if (btn) {
                const rect = btn.getBoundingClientRect();
                const offset = 8;
                setMenuPos({ top: rect.bottom + offset, left: rect.left });
              }
              setMenuOpen((prev) => !prev);
            }}
          >
            {/* <span className="users-select-all-label">Select</span> */}
            <ChevronDown size={15} className="chevron" />
          </button>
        </div>
        {/* name */}
        <div style={{ display: 'flex', justifySelf: 'flex-start', paddingLeft: "42px", gap: 6 }}>
          <span className='users-header-cell'>Name</span>
          <button
            type="button"
            className="users-header-cell"
            // style={{ justifySelf: 'flex-start', paddingLeft: '45px', display:'inline-flex', alignItems:'center', gap:6, background:'none', border:'none', padding:0, cursor:'pointer' }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={() => onSortChange && onSortChange('name')}
          >
            <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
              <ChevronUp size={14} color={sortKey === 'name' && sortDir === 'asc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
              <ChevronDown size={14} color={sortKey === 'name' && sortDir === 'desc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
            </span>
          </button>
        </div>

      
        <div style={{ justifySelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className='users-header-cell'>Designation</span>
          <button
            type="button"
            className="users-header-cell"
            style={{ justifySelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={() => onSortChange && onSortChange('designation')}
          >

            <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
              <ChevronUp size={14} color={sortKey === 'designation' && sortDir === 'asc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
              <ChevronDown size={14} color={sortKey === 'designation' && sortDir === 'desc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
            </span>
          </button>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className='users-header-cell'>Role</span>
          <button
            type="button"
            className="users-header-cell"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={() => onSortChange && onSortChange('role')}
          >

            <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
              <ChevronUp size={14} color={sortKey === 'role' && sortDir === 'asc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
              <ChevronDown size={14} color={sortKey === 'role' && sortDir === 'desc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
            </span>
          </button>
        </div>

        <span className='users-header-cell'>Status</span>
      
        <div className="users-header-cell">Actions</div>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          className="users-select-all-flyout"
          role="menu"
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, gap: "5px" }}
        >
          <button
            type="button"
            role="menuitem"
            disabled={selectAllLoading}
            onClick={() => {
              onSelectionOption && onSelectionOption('all');
              setMenuOpen(false);
            }}
            className={selectionScope === "all" ? "selected" : ""}
          >
            <span>{selectAllLoading ? 'Selecting all…' : `Select all pages (${totalFilteredCount || 0})`}</span>
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
            onClick={() => {
              onSelectionOption && onSelectionOption('page');
              setMenuOpen(false);
            }}
            className={selectionScope === "page" ? "selected" : ""}

          >
            <span>Select this page ({pageSelectionCount || users?.length || 0})</span>
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

      {users.map((user) => {
        const statusLabel = getStatusLabel(user?.status);
        const userId = resolveUserId(user) || user?._id;
        const nameInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase();
        const tagLabels = buildUserTagLabels(user);
        const rawDesignation = user?.profile?.designation;
        const normalizedDesignation = typeof rawDesignation === 'string' && rawDesignation.trim()
          ? rawDesignation.trim()
          : 'N/A';
        const designationCellClass = normalizedDesignation === 'N/A'
          ? 'users-designation-cell users-designation-cell--empty'
          : 'users-designation-cell';

        return (
          <div className="users-table-row" key={userId}>
            <div className="users-checkbox-cell">
              <input
                type="checkbox"
                checked={selectedItems.includes(userId)}
                onChange={(e) => onSelectItem && onSelectItem(e, userId)}
              />
            </div>
            <div></div>
            <div className="users-user-cell">
              <div>
                <div className="users-user-avatar">{nameInitial}</div>
              </div>
              <div className="users-user-info">
                <div className="users-user-name">{user?.name || '-'}</div>
                <div className="users-email-cell">{user?.email || '-'}</div>

              </div>
            </div>

            {/* <div className="users-email-cell">{user?.email || '-'}</div> */}
            <div className={designationCellClass}>{normalizedDesignation}</div>
            <div className="users-role-cell">
              <span className="users-role-badge">
                {typeof user?.global_role_id === 'string'
                  ? user?.global_role_id
                  : (user?.global_role_id?.name || user?.global_role_id?.title || '-')}
              </span>
            </div>

            <div className="users-status-cell">
              <span className={`users-status-badge status-${(statusLabel || '').toLowerCase()}`}>
                {statusLabel === 'Active' ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>
            <div className="users-actions-cell">
              <button
                className="global-action-btn view"
                onClick={() => openPreview && openPreview(user)}
                title="View"
                type="button"
              >
                <Eye size={16} />
              </button>
              <button
                className="global-action-btn"
                onClick={() => handleAssignToTeam && handleAssignToTeam(userId)}
                title="Assign to Team"
                type="button"
              >
                <Plus size={16} />
              </button>
              <button
                className="global-action-btn edit"
                onClick={() => openForm && openForm(user)}
                title="Edit"
                type="button"
              >
                <Edit3 size={16} />
              </button>
              <button
                className="global-action-btn delete"
                onClick={() => handleDelete && handleDelete(userId)}
                title="Delete"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {tagLabels.length ? (
              <div className="users-row-tags">{tagLabels.join(', ')}</div>
            ) : null}
          </div>
        );
      })
      }

      <div className="users-pagination">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Prev
        </button>
        <span>{`Page ${currentPage} of ${Math.max(1, totalPages)}`}</span>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
    )
  );
};

export default UsersTable;
