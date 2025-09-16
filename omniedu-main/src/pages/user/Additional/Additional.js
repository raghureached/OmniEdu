import React from 'react';
import './Additional.css';

const Additional = () => {
  // Dummy additional courses data
  const additionalCourses = [
    {
      id: 1,
      title: "Effective Communication Skills",
      category: "Soft Skills",
      duration: "3 hours",
      popularity: "High",
      enrolled: 245,
      tags: ["Communication", "Professional Development"]
    },
    {
      id: 2,
      title: "Advanced Excel Formulas & Functions",
      category: "Technical Skills",
      duration: "4 hours",
      popularity: "Medium",
      enrolled: 187,
      tags: ["Excel", "Data Analysis", "Office Skills"]
    },
    {
      id: 3,
      title: "Design Thinking Workshop",
      category: "Innovation",
      duration: "6 hours",
      popularity: "Medium",
      enrolled: 156,
      tags: ["Innovation", "Problem Solving", "Creativity"]
    },
    {
      id: 4,
      title: "Introduction to SQL for Non-Developers",
      category: "Technical Skills",
      duration: "5 hours",
      popularity: "High",
      enrolled: 298,
      tags: ["SQL", "Data", "Technical"]
    },
    {
      id: 5,
      title: "Mindfulness and Stress Management",
      category: "Wellbeing",
      duration: "2 hours",
      popularity: "High",
      enrolled: 312,
      tags: ["Wellbeing", "Mental Health", "Work-Life Balance"]
    }
  ];

  // Function to determine popularity badge color
  const getPopularityClass = (popularity) => {
    switch(popularity) {
      case "High":
        return "popularity-high";
      case "Medium":
        return "popularity-medium";
      case "Low":
        return "popularity-low";
      default:
        return "popularity-medium";
    }
  };

  return (
    <div className="additional-courses-container">
      <header className="additional-courses-header">
        <p className="additional-courses-subtitle">Optional courses available for your professional development.</p>
      </header>
      
      <div className="additional-courses-content">
        {additionalCourses.length > 0 ? (
          <div className="additional-courses-list">
            {additionalCourses.map(course => (
              <div key={course.id} className="additional-course-card additional-card">
                <div className="additional-course-header">
                  <h3>{course.title}</h3>
                  <span className={`additional-popularity-badge ${getPopularityClass(course.popularity)}`}>
                    {course.popularity} Demand
                  </span>
                </div>
                
                <div className="additional-course-details">
                  <div className="additional-detail">
                    <span className="additional-detail-label">Category:</span>
                    <span className="additional-detail-value">{course.category}</span>
                  </div>
                  <div className="additional-detail">
                    <span className="additional-detail-label">Duration:</span>
                    <span className="additional-detail-value">{course.duration}</span>
                  </div>
                  <div className="additional-detail">
                    <span className="additional-detail-label">Enrolled:</span>
                    <span className="additional-detail-value">{course.enrolled} employees</span>
                  </div>
                </div>
                
                <div className="additional-course-tags">
                  {course.tags.map((tag, index) => (
                    <span key={index} className="additional-course-tag">{tag}</span>
                  ))}
                </div>
                
                <div className="additional-course-actions">
                  <button className="additional-course-action-btn additional-btn">
                    Enroll Now
                  </button>
                  <button className="additional-course-info-btn">
                    More Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="additional-empty-state">
            <p>No additional courses are available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Additional;