import { ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const Step1ContentSelection = ({
  selectedContentType,
  setSelectedContentType,
  selectedItem,
  setSelectedItem,
  filterTeam,
  setFilterTeam,
  filterSubTeam,
  setFilterSubTeam,
  contentItems,
  onNext,
  teams
}) => {
  const [noOfQuestions, setNoOfQuestions] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const handleContentTypeSelect = (type) => {
    setSelectedContentType(type);
    setSelectedItem(null);
    setFilterTeam('');
    setFilterSubTeam('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    if (selectedContentType === 'Assessment') {
      const max = Number(item.questions?.length || 1);
      const min = 1;
      let val = parseInt(noOfQuestions, 10);
      if (isNaN(val)) val = min;
      if (val > max) val = max;
      if (val < min) val = min;
      setNoOfQuestions(val);
    }
  };

  const getItemMeta = (item) => {
    if (selectedContentType === 'Learning Path') {
      return `${item.duration || 0} min • ${item.lessons.length || 0} resources`;
    } else if (selectedContentType === 'Assessment') {
      // console.log(item.duration,item.questions)
      return `${item.duration || 0} min • ${item.questions.length || 0} questions`;
    }
    return `${item.duration || 0} minutes`;
  };

  const getBadgeClass = () => {
    switch (selectedContentType) {
      case 'Module': return 'module';
      case 'Assessment': return 'assessment';
      case 'Survey': return 'survey';
      case 'Learning Path': return 'path';
      default: return '';
    }
  };

  const filteredItems = contentItems.filter(item => {
    if (filterTeam && item.team !== filterTeam) return false;
    if (filterSubTeam && item.subteam !== filterSubTeam) return false;
    if (searchTerm && !String(item.title || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTeam, filterSubTeam, selectedContentType]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  return (
    <div className="assignment-section step-content active">
      <h2 className="section-title">Step 1: Select Content Type</h2>

      <div className="form-group">
        <label className="required">Choose Content Type</label>
        <div className="radio-group">
          <div
            className={`radio-option ${selectedContentType === 'Module' ? 'selected' : ''}`}
            onClick={() => handleContentTypeSelect('Module')}
          >
            <input
              type="radio"
              name="contentType"
              value="Module"
              checked={selectedContentType === 'Module'}
              onChange={() => { }}
              // style={{ display: 'none' }}
            />
            <div className="radio-option-content">
              <div className="radio-option-title">Module</div>
              <div className="radio-option-desc">Individual learning modules covering specific topics</div>
            </div>
          </div>

          <div
            className={`radio-option ${selectedContentType === 'Assessment' ? 'selected' : ''}`}
            onClick={() => handleContentTypeSelect('Assessment')}
          >
            <input
              type="radio"
              name="contentType"
              value="Assessment"
              checked={selectedContentType === 'Assessment'}
              onChange={() => { }}
              // style={{ display: 'none' }}
            />
            <div className="radio-option-content">
              <div className="radio-option-title">Assessment</div>
              <div className="radio-option-desc">Quizzes and tests to evaluate knowledge</div>
            </div>
          </div>

          <div
            className={`radio-option ${selectedContentType === 'Survey' ? 'selected' : ''}`}
            onClick={() => handleContentTypeSelect('Survey')}
          >
            <input
              type="radio"
              name="contentType"
              value="Survey"
              checked={selectedContentType === 'Survey'}
              onChange={() => { }}
              // style={{ display: 'none' }}
            />
            <div className="radio-option-content">
              <div className="radio-option-title">Survey</div>
              <div className="radio-option-desc">Feedback forms and questionnaires</div>
            </div>
          </div>

          <div
            className={`radio-option ${selectedContentType === 'Learning Path' ? 'selected' : ''}`}
            onClick={() => handleContentTypeSelect('Learning Path')}
          >
            <input
              type="radio"
              name="contentType"
              value="Learning Path"
              checked={selectedContentType === 'Learning Path'}
              onChange={() => { }}
              // style={{ display: 'none' }}
            />
            <div className="radio-option-content">
              <div className="radio-option-title">Learning Path</div>
              <div className="radio-option-desc">Structured sequence of modules and assessments</div>
            </div>
          </div>
        </div>
      </div>

      {selectedContentType && (
        <div id="content-filters">
          <div className="form-group">
            <div className="form-group">
              <label>Filter Content</label>
              <div className="filter-row" style={{justifyContent:'flex-start'}}>
                <input
                  type="text"
                  
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-row">
                <select value={filterTeam} onChange={(e) => { setFilterTeam(e.target.value); setFilterSubTeam(''); }}>
                  <option value="">All Teams</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
                <select value={filterSubTeam} onChange={(e) => setFilterSubTeam(e.target.value)}>
                  <option value="">All Sub-Teams</option>
                  {teams
                    .find(team => team._id === filterTeam)
                    ?.subTeams
                    ?.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                </select>
                <select value={filterSubTeam} onChange={(e) => setFilterSubTeam(e.target.value)}>
                  <option value="">Category</option>
                  {teams
                    .find(team => team._id === filterTeam)
                    ?.subTeams
                    ?.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                </select>
              </div>


            </div>

          </div>

          <div className="form-group">
            <label className="required">Select Item to Assign</label>
            <div className="help-text" style={{ marginBottom: 10 }}>Only one item can be selected. To assign multiple items, create a Learning Path.</div>
            <div className="items-list">
              {filteredItems.length > 0 ? (
                paginatedItems.map(item => (
                  <div
                    key={item._id}
                    className={`item-card ${selectedItem?._id === item._id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="contentItem"
                      checked={selectedItem?._id === item._id}
                      onChange={() => handleItemSelect(item)}
                    />
                    <label className="item-info" onClick={() => handleItemSelect(item)}>
                      <div className="item-title">{item.title}</div>
                      <div className="item-meta">{getItemMeta(item)}</div>
                    </label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                      {selectedContentType === 'Assessment' && selectedItem?._id === item._id && Array.isArray(item.questions) && item.questions.length > 0 && (
                        <span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={noOfQuestions}
                            maxLength={String(Number(item.questions?.length || 1)).length}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') { setNoOfQuestions(''); return; }
                              const digits = raw.replace(/[^0-9]/g, '');
                              if (digits === '') { setNoOfQuestions(''); return; }
                              const max = Number(item.questions?.length || 1);
                              let val = parseInt(digits, 10);
                              if (isNaN(val)) { setNoOfQuestions(''); return; }
                              if (val > max) val = max;
                              if (val < 1) val = 1;
                              setNoOfQuestions(String(val));
                            }}
                            onBlur={() => {
                              const max = Number(item.questions?.length || 1);
                              const min = 1;
                              let val = parseInt(noOfQuestions, 10);
                              if (isNaN(val)) val = min;
                              if (val > max) val = max;
                              if (val < min) val = min;
                              setNoOfQuestions(String(val));
                            }}
                            onPaste={(e) => {
                              const text = (e.clipboardData || window.clipboardData).getData('text');
                              const digits = text.replace(/[^0-9]/g, '');
                              if (!digits) { e.preventDefault(); return; }
                              const max = Number(item.questions?.length || 1);
                              let val = parseInt(digits, 10);
                              if (isNaN(val)) { e.preventDefault(); return; }
                              if (val > max) val = max;
                              if (val < 1) val = 1;
                              setNoOfQuestions(String(val));
                              e.preventDefault();
                            }}
                            step={1}
                            style={{ width: "60px", textAlign: "right" }}
                          /> questions
                        </span>
                      )}
                    </div>
                    <span className={`item-badge ${getBadgeClass()}`}>{selectedContentType}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📚</div>
                  <p>No items found matching the selected filters</p>
                </div>
              )}
            </div>

            {filteredItems.length > 0 && Math.ceil(filteredItems.length / pageSize) > 1 && (
              <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span style={{ fontSize: 14 }}>Page {currentPage} of {Math.max(1, Math.ceil(filteredItems.length / pageSize))}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={currentPage === Math.max(1, Math.ceil(filteredItems.length / pageSize))}
                  onClick={() => setCurrentPage(p => Math.min(Math.max(1, Math.ceil(filteredItems.length / pageSize)), p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={!selectedContentType || !selectedItem}
        >
          Next: Select Users <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Step1ContentSelection;
