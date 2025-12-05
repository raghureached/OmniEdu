import React, { useState, useEffect } from 'react';
import './Catalog.css';
import api from '../../../services/api';
import { CourseCard } from '../Cards/ContentCards';
import { categories } from '../../../utils/constants';
import LoadingScreen from '../../../components/common/Loading/Loading';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState([]);
  useEffect(() => {
    const fetchCatalogItems = async () => {
      setIsLoading(true);
      const response = await api.get('/api/user/getCatalog');
      const data = response.data.data;
      setCatalogItems(data);
      setIsLoading(false);
    };
    
    fetchCatalogItems();
  }, []);
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel = selectedLevel === 'all' 
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const renderSkeleton = () => {
    return Array(4).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className="course-card skeleton">
        <div className="skeleton-image"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-meta"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-button"></div>
      </div>
    ));
  };
  if (isLoading) {
    return <LoadingScreen text="Loading catalog items..." />;
  }
  
  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <p>Discover courses to enhance your skills and advance your career</p>
      </div>
      
      <div className="catalog-filter-section">
        <div className="catalog-filter-row">
          <div className="catalog-search-box">
            <input
              type="text"
              placeholder="Search anything"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="catalog-filter-dropdown">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          {/* <div className="catalog-filter-dropdown">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level}
                </option>
              ))}
            </select>
          </div> */}
        </div>
      </div>
      
      <div className="catalog-courses-grid">
        {isLoading ? (
          renderSkeleton()
        ) : (
          filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <CourseCard key={item.id} data={item} status={item.inProgress ? "in_progress" : "not_enrolled"} progressPct={-1} contentType={item.type} />
            ))
          ) : (
            <div className="catalog-no-results">
              <p>No courses match your search criteria.</p>
              <button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}>Clear Filters</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Catalog;