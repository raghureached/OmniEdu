import { ChevronRight } from 'lucide-react';
import React from 'react';

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
  onNext
}) => {
  
  const handleContentTypeSelect = (type) => {
    setSelectedContentType(type);
    setSelectedItem(null);
    setFilterTeam('');
    setFilterSubTeam('');
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const getItemMeta = (item) => {
    if (selectedContentType === 'Learning Path') {
      return `${item.duration || 0} min • ${item.elements || 0} elements`;
    } else if (selectedContentType === 'Assessment') {
      return `${item.duration || 0} min • ${item.questions || 0} questions`;
    }
    return `${item.duration || 0} minutes`;
  };

  const getBadgeClass = () => {
    switch(selectedContentType) {
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
    return true;
  });

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
              onChange={() => {}}
            />
            <div className="radio-option-content">
              <div className="radio-option-title">Module (Standalone Topic)</div>
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
              onChange={() => {}}
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
              onChange={() => {}}
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
              onChange={() => {}}
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
            <label>Filter Content</label>
            <div className="filter-row">
              <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
                <option value="">All Teams</option>
                <option value="sales">Sales</option>
                <option value="engineering">Engineering</option>
                <option value="hr">Human Resources</option>
                <option value="marketing">Marketing</option>
              </select>
              <select value={filterSubTeam} onChange={(e) => setFilterSubTeam(e.target.value)}>
                <option value="">All Sub-Teams</option>
                <option value="sales-east">Sales - East Region</option>
                <option value="sales-west">Sales - West Region</option>
                <option value="eng-frontend">Engineering - Frontend</option>
                <option value="eng-backend">Engineering - Backend</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="required">Select Item to Assign</label>
            <div className="help-text">Only one item can be selected. To assign multiple items, create a Learning Path.</div>
            <div className="items-list">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
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
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn-primary" 
          onClick={onNext}
          disabled={!selectedContentType || !selectedItem}
        >
          Next: Select Users <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
};

export default Step1ContentSelection;
