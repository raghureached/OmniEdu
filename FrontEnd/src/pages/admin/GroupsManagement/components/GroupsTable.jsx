import React, { useEffect, useRef, useState } from 'react';
import { Edit3, Trash2, Eye, Plus, ChevronDown, ChevronUp, Users } from 'lucide-react';
import '../GroupsManagement.css';
const GroupsTable = ({
  groups,
  selectedGroups,
  onSelectGroup,
  topCheckboxChecked,
  topCheckboxIndeterminate,
  onTopCheckboxToggle,
  onSelectionOption,
  selectionScope,
  selectAllLoading,
  pageSelectionCount,
  totalFilteredCount,
  totalSelectedCount,
  onSelectAllPages,
  onClearSelection,
  handleEditGroup,
  handleDeleteGroup,
  onTogglePreview,
  expandedTeamId,
  renderExpandedContent,
  onShowMembers,
  onAddSubTeam,
  currentPage,
  totalPages,
  handlePageChange,
  sortKey,
  sortDir,
  onSortChange,
  handleCreateGroup,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // flyout container
  const triggerRef = useRef(null); // pill trigger
  const checkboxRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  // Using global sorting provided by parent via props
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
    // initial position sync
    handleReposition();
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  return (
    <>
      {groups.length === 0 ? (
        <div className="groups-empty-state">
          <div className="groups-empty-icon">
            <Users size={48} />
          </div>
          <h3>No Teams found</h3>
          <p>Start by creating your first team </p>
          <button className="btn-primary" onClick={handleCreateGroup}>
            <Plus size={16} />
            Add Team
          </button>
        </div>
      ) : (
        <div className="table-container">

          <div className="table-header" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#020202', gridTemplateColumns: "10px 50px 200px 180px 180px 180px 40px 120px" }}>
            {/* 1: Select All */}
            <div className="select-all-control" style={{ textAlign: "left" }} >
              <input
                ref={checkboxRef}
                className="col-select"
                type="checkbox"
                checked={topCheckboxChecked}
                onChange={(e) => onTopCheckboxToggle(e.target.checked)}
              />
            </div>
            {/* select */}
            <div style={{ textAlign: "left" }}>
              <button
                type="button"
                ref={triggerRef}
                className={`select-all-menu-toggle ${menuOpen ? 'open' : ''}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Selection options"
                onClick={() => {
                  // compute and open
                  const btn = triggerRef.current;
                  if (btn) {
                    const rect = btn.getBoundingClientRect();
                    const offset = 8;
                    setMenuPos({ top: rect.bottom + offset, left: rect.left });
                  }
                  setMenuOpen((prev) => !prev);
                }} style={{ padding: "0px" }}
              >
                {/* <span className="select-all-label">Select</span> */}
                <ChevronDown size={15} className="chevron" />
              </button>
            </div>

            {/* 2: Team Name */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="col-team">Team Name</span>
              <button
                type="button"
                className="col-team"
                onClick={() => onSortChange && onSortChange('teamName')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#020202' }}
              >

                <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
                  <ChevronUp size={14} color={sortKey === 'teamName' && sortDir === 'asc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
                  <ChevronDown size={14} color={sortKey === 'teamName' && sortDir === 'desc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
                </span>
              </button>
            </div>
            {/* subteam */}
            <div style={{ display: 'inline-flex', justifySelf: 'center', alignItems: 'center', gap: 6 }}>
              <span className="col-subteam" style={{ alignItems: "center" }}>Sub Teams</span>
              <button
                type="button"
                className="col-subteam"
                onClick={() => onSortChange && onSortChange('subTeams')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#020202' }}
              >

                <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
                  <ChevronUp size={14} color={sortKey === 'subTeams' && sortDir === 'asc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
                  <ChevronDown size={14} color={sortKey === 'subTeams' && sortDir === 'desc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
                </span>
              </button>
            </div>

            {/* 3: Members */}
            <div style={{ display: 'inline-flex', justifySelf: 'center', alignItems: 'center', gap: 6 }}>
              <span>Members</span>
              <button
                type="button"
                className="col-members"
                onClick={() => onSortChange && onSortChange('members')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#020202' }}
              >

                <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
                  <ChevronUp size={14} color={sortKey === 'members' && sortDir === 'asc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
                  <ChevronDown size={14} color={sortKey === 'members' && sortDir === 'desc' ? '#111827' : '#cbd5e1'} strokeWidth={3} />
                </span>
              </button>
            </div>

            {/* 4: Status */}
            <span>Status</span>
            {/* <button
            type="button"
            className="col-status"
            onClick={() => onSortChange && onSortChange('status')}
            style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:'none', padding:0, cursor:'pointer', color:'#020202' }}
          >
            
            <span style={{ display:'inline-flex', flexDirection:'column', lineHeight:1 }}>
              <ChevronUp size={14} color={sortKey==='status' && sortDir==='asc' ? '#111827' : '#cbd5e1'} strokeWidth={3}/>
              <ChevronDown size={14} color={sortKey==='status' && sortDir==='desc' ? '#111827' : '#cbd5e1'} strokeWidth={3}/>
            </span>
          </button> */}
            <div className="col-spacer" aria-hidden="true"></div>

            {/* 5: Actions */}
            <div className="col-actions">Actions</div>
          </div>

          {menuOpen && (

            <div
              ref={menuRef}
              className="select-all-flyout"
              role="menu"
              style={{ position: 'fixed', top: menuPos.top, left: menuPos.left,gap:"5px" }}
            >
              <button
                type="button"
                role="menuitem"
                disabled={selectAllLoading}
                onClick={() => {
                  onSelectionOption('all');
                  setMenuOpen(false);
                }}
                className={selectionScope === "all" ? "selected" : ""}
              >
                <span>{selectAllLoading ? 'Selecting all…' : `Select all pages (${totalFilteredCount})`}</span>
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
                  onSelectionOption('page');
                  setMenuOpen(false);
                }}
                className={selectionScope === "page" ? "selected" : ""}
              >
                <span>Select this page ({pageSelectionCount})</span>
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

          {/* {selectionScope !== 'none' && selectedGroups.length > 0 && (
          <div className="selection-banner">
            {selectionScope === 'page' ? (
              <>
                <span>
                  All {pageSelectionCount} {pageSelectionCount === 1 ? 'group' : 'groups'} on this page are selected.
                </span>
                {totalFilteredCount > pageSelectionCount && (
                  <button
                    type="button"
                    onClick={onSelectAllPages}
                    disabled={selectAllLoading}
                  >
                    {selectAllLoading ? 'Selecting all groups…' : `Select all ${totalFilteredCount} groups`}
                  </button>
                )}
                <button type="button" onClick={onClearSelection}>
                  Clear selection
                </button>
              </>
            ) : selectionScope === 'all' ? (
              <>
                <span>
                  All {totalSelectedCount} {totalSelectedCount === 1 ? 'group' : 'groups'} are selected.
                </span>
                <button type="button" onClick={onClearSelection}>
                  Clear selection
                </button>
              </>
            ) : (
              <>
                <span>
                  {selectedGroups.length} {selectedGroups.length === 1 ? 'group' : 'groups'} selected.
                </span>
                {totalFilteredCount > selectedGroups.length && (
                  <button
                    type="button"
                    onClick={onSelectAllPages}
                    disabled={selectAllLoading}
                  >
                    {selectAllLoading ? 'Selecting all groups…' : `Select all ${totalFilteredCount} groups`}
                  </button>
                )}
                <button type="button" onClick={onClearSelection}>
                  Clear selection
                </button>
              </>
            )}
          </div>
          )} */}

          {groups.map((group) => {
            const isExpanded = expandedTeamId === group.id;
            return (
              <React.Fragment key={group.id}>
                <div
                  className={`table-row ${isExpanded ? 'row-expanded-highlight' : ''}`}
                  style={{ gridTemplateColumns: "10px 50px 200px 180px 180px 180px 40px 120px" }}
                >

                  {/* 1: Checkbox */}
                  <input
                    className="col-select"
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={(e) => onSelectGroup(e.target.checked, group.id)}
                  />
                  <div></div>
                  {/* 2: Team name */}
                  <div className="col-team" data-label="Team Name">{group.teamName}</div>
                  <div className="col-subteam" data-label="Sub Teams">{group.subTeams.length}</div>

                  {/* 3: Members */}
                  {/* <div>{group.subTeamName }</div> */}

                  {/* 4: Members */}
                  <button
                    type="button"
                    className="col-members members-link"
                    data-label="Members"
                    onClick={() => onShowMembers && onShowMembers(group)}
                    style={{ textDecoration: 'underline', background: 'none', border: 'none', padding: 0, textAlign: 'center', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#434343' }}
                  >
                    {group.membersCount || 0}
                  </button>

                  {/* 5: Status */}
                  <div className="col-status" data-label="Status">
                    <span
                      className={`users-status-badge status-${group.status.toLowerCase()}`}
                    >
                      {group.status === 'Active' ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>

                  <div className="col-spacer" aria-hidden="true"></div>


                  {/* 6: Actions */}
                  <div className="col-actions" data-label="Actions" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button
                      className={`global-action-btn ${isExpanded ? 'active' : ''}`}
                      onClick={() => onTogglePreview && onTogglePreview(group)}
                      aria-label={`Preview team ${group.teamName}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="global-action-btn"
                      onClick={() => onAddSubTeam && onAddSubTeam(group)}
                      aria-label={`Add subteam to ${group.teamName}`}
                    >
                      <Plus size={16} />
                    </button>
                    <button className="global-action-btn edit" onClick={() => {
                      handleEditGroup(group)
                    }}>
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="global-action-btn delete"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </div>
                {isExpanded && renderExpandedContent && (
                  <div className="expanded-content-wrapper">
                    {renderExpandedContent(group)}
                  </div>
                )}
              </React.Fragment>
            );
          })}
          {/* Pagination aligned with OrganizationManagement */}
          <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '0px', borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>

        </div>
      )}

    </>
  );
};

export default GroupsTable;