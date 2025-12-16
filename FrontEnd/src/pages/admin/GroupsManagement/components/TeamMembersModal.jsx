import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { GoX } from 'react-icons/go';

const membersPerPage = 100;


const TeamMembersModal = ({ isOpen, onClose, team, members = [] }) => {
  console.log("subteam in Team MEMBER MODEL", members)
  console.log("groups in Team MEMBER MODEL", team)
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('addOrg-modal-overlay')) {
      onClose && onClose();
    }
  };

  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [isOpen, team]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Build a lookup of subteam id -> name from the provided team
  const subTeamNameMap = useMemo(() => {
    const map = new Map();
    const subTeams = Array.isArray(team?.subTeams) ? team.subTeams : [];
    subTeams.forEach((st) => {
      const id = st?._id || st?.id || st?.uuid || null;
      const name = st?.name || st?.subTeamName || st?.subteamName || st?.sub_team_name || '';
      if (id) map.set(String(id), name || '');
    });
    return map;
  }, [team]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const sorter = (a, b) => {
      const aName = (a?.name || a?.fullName || '').toString().trim().toLowerCase();
      const bName = (b?.name || b?.fullName || '').toString().trim().toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    };

    if (!normalizedSearch) {
      return [...members].sort(sorter);
    }

    return members
      .filter((member) => {
        const name = (member.name || member.fullName || '').toLowerCase();
        const email = (member.email || '').toLowerCase();
        return name.includes(normalizedSearch) || email.includes(normalizedSearch);
      })
      .sort(sorter);
  }, [members, searchTerm]);
  console.log('filteredMembers', filteredMembers)
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / membersPerPage));

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

  const activePage = Math.min(currentPage, totalPages);
  const paginatedMembers = useMemo(() => {
    const startIndex = (activePage - 1) * membersPerPage;
    return filteredMembers.slice(startIndex, startIndex + membersPerPage);
  }, [filteredMembers, activePage]);

  if (!isOpen || !team) {
    return null;
  }

  return (
    <div className="addOrg-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="addOrg-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-members-title"
      >
        <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <Users size={24} color="#5570f1" />
            </div>
            <div>
              <h2 id="team-members-title">Members of {team.teamName || team.name || 'Team'}</h2>
              <p className="addOrg-header-subtitle">Team overview</p>
            </div>
          </div>
          <button
            type="button"
            className="addOrg-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <GoX size={20} />
          </button>
        </div>

        <div className="addOrg-form-section" style={{ padding: 24 }}>
          {members.length > 0 && (
            <div className="table-toolbar" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div className="roles-search-bar" style={{ flex: 1, maxWidth: 320 }}>
                <Search size={16} color="#6b7280" className="search-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search members"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}


          <div className="table-container">
            <div className="table-header" style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr', color: "#000000" }}>
              <div className="col-team">Name</div>
              <div className="col-team">Email</div>
              <div className="col-team">Team</div>
              <div className="col-team">Subteams</div>
            </div>

            {members.length === 0 ? (
              <div className="table-row" style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr',paddingLeft:'165px' }}>
                <div className="col-team"></div>
                <div className="col-team" style={{ textAlign: "center", color: "#64748b" }}>No members found for this team</div>
                <div className="col-team"></div>
                <div className="col-team"></div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="table-row" style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr',paddingLeft:'165px' }}>
                <div className="col-team"></div>
                <div className="col-team" style={{ textAlign: "center", color: "#64748b" }}>No members match your search</div>
                <div className="col-team"></div>
                <div className="col-team"></div>
              </div>
            ) : (
              <>
                {paginatedMembers.map((member) => {
                  // Debug: Log the full member object to inspect its structure
                  console.log('Member data:', member);

                  // Extract subteam names from the nested structure

                  // const subteamNames = teams
                  //   .filter(st => st.members.some(m => m._id === member._id || m.id === member.id))
                  //   .map(st => st.name)
                  //   .join(', ');
                  //   console.log('subteamNames', subteamNames)

                  const toDisplayName = (val) => {
                    const raw = (val ?? '').toString();
                    if (!raw) return '';
                    return subTeamNameMap.get(raw) || raw;
                  };

                  const subteamText = Array.isArray(member.subTeamNames)
                    ? member.subTeamNames.map(toDisplayName).filter(Boolean).join(', ')
                    : toDisplayName(member.subTeamName || '');

                  return (
                    <div key={member.id || member._id} className="table-row" style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr' }}>
                      <div className="col-team">{member.name || member.fullName || 'N/A'}</div>
                      <div className="col-team">{member.email || 'N/A'}</div>
                      <div className="col-team">{team.teamName || team.name || 'N/A'}</div>
                      <div className={"col-team"} title={subteamText}>
                        {subteamText || 'N/A'}
                      </div>
                    </div>
                  );
                })}

                <div
                  className="table-footer"
                  style={{
                    padding: '12px 24px',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    className="pagination"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      borderTop: 'none',
                      padding: "0px",
                      marginTop: "0px"
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={activePage === 1}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          background: '#fff',
                          color: '#0f172a',
                          cursor: activePage === 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Prev
                      </button>

                      <span style={{ color: '#0f172a' }}>{`Page ${activePage} of ${totalPages}`}</span>

                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={activePage === totalPages}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          background: '#fff',
                          color: '#0f172a',
                          cursor: activePage === totalPages ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
             </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersModal;
