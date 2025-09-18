import React, { useState, useEffect } from 'react';
import './Catalog.css';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for catalog items - in a real app, this would come from an API
  const catalogItems = [
    { id: 1, title: 'Introduction to React', category: 'Web Development', level: 'Beginner', duration: '2 hours', enrolled: 1243, rating: 4.7, image: 'https://cdn.pixabay.com/photo/2017/01/31/13/05/computer-2023911_1280.png' },
    { id: 2, title: 'Advanced JavaScript Concepts', category: 'Web Development', level: 'Advanced', duration: '4 hours', enrolled: 892, rating: 4.9, image: 'https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_1280.png' },
    { id: 3, title: 'UI/UX Design Principles', category: 'Design', level: 'Intermediate', duration: '3 hours', enrolled: 1056, rating: 4.5, image: 'https://cdn.pixabay.com/photo/2017/01/29/13/21/mobile-devices-2017978_1280.png' },
    { id: 4, title: 'Data Analysis with Python', category: 'Data Science', level: 'Intermediate', duration: '5 hours', enrolled: 1489, rating: 4.8, image: 'https://cdn.pixabay.com/photo/2023/01/22/13/46/swot-analysis-7736190_1280.png' },
    { id: 5, title: 'Cloud Computing Fundamentals', category: 'Cloud', level: 'Beginner', duration: '3 hours', enrolled: 765, rating: 4.6, image: 'https://cdn.pixabay.com/photo/2018/05/04/20/01/website-3374825_1280.jpg' },
    { id: 6, title: 'Machine Learning Basics', category: 'Data Science', level: 'Intermediate', duration: '6 hours', enrolled: 1876, rating: 4.9, image: 'https://cdn.pixabay.com/photo/2019/04/16/13/30/ai-4131541_1280.jpg' }
  ];
  
  // Categories for filter
  const categories = ['all', 'Web Development', 'Design', 'Data Science', 'Cloud'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  
  // Simulate loading data from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter items based on search, category and level
  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || item.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });
  
  // Render loading skeleton
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
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="catalog-filter-dropdown">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="catalog-filter-dropdown">
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
          </div>
        </div>
      </div>
      
      <div className="catalog-courses-grid">
        {isLoading ? (
          renderSkeleton()
        ) : (
          filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item.id} className="catalog-course-card">
                <div className="catalog-course-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <h3 className="catalog-course-title">{item.title}</h3>
                <div className="catalog-course-meta">
                  <span>{item.level}</span>
                  <span>{item.duration}</span>
                </div>
                <div className="catalog-course-stats">
                  <div className="catalog-rating">
                    <span className="catalog-rating-value">{item.rating}</span>
                    <span className="catalog-rating-stars">★★★★★</span>
                  </div>
                  <div className="catalog-enrolled">
                    <span>{item.enrolled.toLocaleString()} students</span>
                  </div>
                </div>
                <button className="catalog-enroll-button">Enroll Now</button>
              </div>
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