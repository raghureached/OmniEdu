import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchContent, createContent, deleteContent } from '../../../store/slices/contentSlice';
import { Search, Filter, Plus } from 'lucide-react';
import './AdminPortalActivity.css';

const AdminPortalActivity = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Dummy data for demonstration
  const dummyContent = [
    {
      id: 1,
      type: 'Module',
      title: 'Introduction to HTML',
      team: 'Tech',
      status: 'Published',
      tags: ['frontend', 'web-development', 'html']
    },
    {
      id: 2,
      type: 'Assessment',
      title: 'HTML Basics Quiz',
      team: 'Tech',
      status: 'Published',
      tags: ['frontend', 'assessment', 'html']
    },
    {
      id: 3,
      type: 'Learning Path',
      title: 'Frontend Onboarding',
      team: 'Tech',
      status: 'Published',
      tags: ['frontend', 'career-path', 'development']
    },
    {
      id: 4,
      type: 'Survey',
      title: 'Course Feedback Form',
      status: 'Published',
      tags: ['feedback', 'course-evaluation']
    }
  ];

  // State for filters
  const [nameSearch, setNameSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagSearch, setTagSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState(dummyContent);

  // Apply filters whenever filter values change
  useEffect(() => {
    let filtered = dummyContent;

    // Filter by name
    if (nameSearch) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(nameSearch.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Filter by tag
    if (tagSearch) {
      filtered = filtered.filter(item =>
        item.tags.some(tag =>
          tag.toLowerCase().includes(tagSearch.toLowerCase())
        )
      );
    }

    setFilteredItems(filtered);
  }, [nameSearch, typeFilter, tagSearch]);

  const handleAddContent = (type) => {
    switch(type) {
      case 'Module':
        navigate('/admin/content-modules');
        break;
      case 'Assessment':
        navigate('/admin/content-assessments');
        break;
      case 'LearningPath':
        navigate('/admin/learning-paths');
        break;
      case 'Survey':
        navigate('/admin/manage-surveys');
        break;
      default:
        break;
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status.toLowerCase()}`;
  };

  const handleFilter = () => {
    // Additional filter logic if needed
    console.log('Additional filtering applied');
  };

  return (
    <div className="portal-activity-container">
      {/* <h1>Portal Library</h1> */}
      
      <div className="filters-section">
        <div className="search-filter">
          <label>Name:</label>
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="type-filter">
          <label>Type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="module">Module</option>
            <option value="assessment">Assessment</option>
            <option value="learning-path">Learning Path</option>
            <option value="survey">Survey</option>
          </select>
        </div>

        <div className="search-filter">
          <label>Tag:</label>
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by tag..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />
          </div>
        </div>

        <button className="filter-button" onClick={handleFilter}>
          <Filter size={20} />
          Filter
        </button>
      </div>

      <div className="actions-section">
        <button className="add-button" onClick={() => handleAddContent('Module')}>
          <Plus size={20} />
          Add Module
        </button>
        <button className="add-button" onClick={() => handleAddContent('Assessment')}>
          <Plus size={20} />
          Add Assessment
        </button>
        <button className="add-button" onClick={() => handleAddContent('LearningPath')}>
          <Plus size={20} />
          Add Learning Path
        </button>
        <button className="add-button" onClick={() => handleAddContent('Survey')}>
          <Plus size={20} />
          Add Survey
        </button>
      </div>

      <div className="content-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="content-card">
            <div className="content-type">{item.type}</div>
            <h3>{item.title}</h3>
            <div className="content-meta">
              {item.team && <span>Team: {item.team}</span>}
              <span className={getStatusBadgeClass(item.status)}>
                Status: {item.status}
              </span>
            </div>
            <div className="content-tags">
              {item.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPortalActivity;