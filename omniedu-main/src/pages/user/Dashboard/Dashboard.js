import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Calendar from '../Calendar/Calendar';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // State for course assignments
  const [selectedDate, setSelectedDate] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  
  // Generate dates for the current month
  const generateDatesForCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Generate dates for the next 30 days from first day of month
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      if (date.getMonth() === month) { // Only include dates in the current month
        dates.push(date);
      }
    }
    return dates;
  };
  
  // Mock data for course assignments
  useEffect(() => {
    // In a real app, this would be an API call
    const currentMonthDates = generateDatesForCurrentMonth();
    
    // Randomly select some dates for assignments
    const selectedDates = [];
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * currentMonthDates.length);
      selectedDates.push(currentMonthDates[randomIndex]);
    }
    
    // Format dates as YYYY-MM-DD
    const formattedDates = selectedDates.map(date => {
      return date.toISOString().split('T')[0];
    });
    
    // Assignment types and categories
    const assignmentTypes = ['course', 'workshop', 'exam', 'certification'];
    const assignmentCategories = ['ASSIGNED', 'MANDATORY', 'ADDITIONAL'];
    const assignmentStatuses = ['completed', 'in-progress', 'not-started'];
    
    // Generate mock assignments
    const mockAssignments = formattedDates.map((date, index) => {
      const typeIndex = Math.floor(Math.random() * assignmentTypes.length);
      const categoryIndex = Math.floor(Math.random() * assignmentCategories.length);
      const statusIndex = Math.floor(Math.random() * assignmentStatuses.length);
      
      return {
        id: index + 1,
        date: date,
        title: getAssignmentTitle(assignmentTypes[typeIndex], index),
        type: assignmentTypes[typeIndex],
        category: assignmentCategories[categoryIndex],
        status: assignmentStatuses[statusIndex],
        description: `This is a detailed description for the ${assignmentTypes[typeIndex]} scheduled on ${new Date(date).toLocaleDateString()}.`,
        duration: Math.floor(Math.random() * 120) + 30 + ' minutes',
        instructor: getRandomInstructor(),
        credits: Math.floor(Math.random() * 5) + 1,
      };
    });
    
    setCourseAssignments(mockAssignments);
  }, []); // Only run once on component mount
  
  // Helper function to generate assignment titles
  const getAssignmentTitle = (type, index) => {
    const titles = {
      course: [
        'Introduction to React',
        'Advanced JavaScript Concepts',
        'Database Design Fundamentals',
        'UI/UX Principles',
        'Mobile App Development'
      ],
      workshop: [
        'Agile Development Workshop',
        'Design Thinking Session',
        'Code Review Best Practices',
        'Team Collaboration Tools',
        'Project Management Essentials'
      ],
      exam: [
        'JavaScript Certification Exam',
        'React Developer Assessment',
        'Database Administrator Test',
        'Frontend Skills Evaluation',
        'Full Stack Developer Exam'
      ],
      certification: [
        'AWS Cloud Practitioner',
        'Google Analytics Certification',
        'Scrum Master Certification',
        'Cybersecurity Fundamentals',
        'Data Science Essentials'
      ]
    };
    
    const randomIndex = Math.floor(Math.random() * titles[type].length);
    return titles[type][randomIndex];
  };
  
  // Helper function to generate random instructors
  const getRandomInstructor = () => {
    const instructors = [
      'Dr. Sarah Johnson',
      'Prof. Michael Chen',
      'Alex Rodriguez',
      'Emma Williams',
      'David Thompson'
    ];
    
    return instructors[Math.floor(Math.random() * instructors.length)];
  };
  
  // Mock data for training categories
  const trainingCategories = [
    { id: 1, name: 'ASSIGNED', count: 3 },
    { id: 2, name: 'ADDITIONAL', count: 5 },
    { id: 3, name: 'MANDATORY', count: 2 },
  ];
  
  // Course statistics
  const courseStatistics = [
    { 
      id: 1, 
      title: 'Total Completed', 
      count: 12, 
      total: 25, 
      percentage: 48, 
      icon: '✅', 
      color: '#10b981',
      navigateTo: '/user/activity-history',
      filterParam: 'status=completed'
    },
    { 
      id: 2, 
      title: 'Total Assigned', 
      count: 25, 
      total: 25, 
      percentage: 100, 
      icon: '📋', 
      color: '#3b82f6',
      navigateTo: '/user/assigned',
      filterParam: 'type=all'
    },
    { 
      id: 3, 
      title: 'In Progress', 
      count: 8, 
      total: 25, 
      percentage: 32, 
      icon: '🔄', 
      color: '#f59e0b',
      navigateTo: '/user/activity-history',
      filterParam: 'status=in-progress'
    },
    { 
      id: 4, 
      title: 'Upcoming', 
      count: 5, 
      total: 25, 
      percentage: 20, 
      icon: '🔜', 
      color: '#8b5cf6',
      navigateTo: '/user/activity-history',
      filterParam: 'status=not-started'
    },
  ];
  
  // Handle date selection from calendar
  const handleDateSelect = (date, assignments) => {
    setSelectedDate(date);
    setSelectedAssignments(assignments || []);
  };
  
  // Handle assignment click
  const handleAssignmentClick = (assignment) => {
    // Navigate to the corresponding training section based on category
    navigate(`/user/${assignment.category.toLowerCase()}`);
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome-section">
        <h2>Welcome to the Learn Portal!</h2>
        <p>
          This portal allows you to view and explore the learning activities assigned to you. 
          You can track your learning progress and see where you stand within your organization. 
          You can also search for content and raise support requests directly from this page.
        </p>
        <p>
          Use the sidebar menu to navigate to your assigned training, explore the catalog, or view your history.
        </p>
      </div>
      
      <div className="dashboard-course-statistics">
        {courseStatistics.map(stat => (
          <div 
            key={stat.id} 
            className="dashboard-stat-card" 
            style={{ borderLeft: `4px solid ${stat.color}` }}
            onClick={() => navigate(`${stat.navigateTo}?${stat.filterParam}`)}
          >
            <div className="dashboard-stat-icon" style={{ backgroundColor: `${stat.color}20` }}>{stat.icon}</div>
            <div className="dashboard-stat-content">
              <h3>{stat.title}</h3>
              <div className="dashboard-stat-count">{stat.count}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-main-content">
          <div className="dashboard-message-board">
            <h3>Message Board</h3>
            <div className="dashboard-message">
              <p>Reminder: Complete mandatory training by end of month!</p>
            </div>
          </div>
          
          <div className="dashboard-dynamic-calendar-section">
            <h3>Scheduled Calendar</h3>
            <Calendar 
              courseAssignments={courseAssignments} 
              onDateSelect={handleDateSelect} 
            />
          </div>
        </div>
        
        <div className="dashboard-sidebar-content">
          <div className="dashboard-training-categories">
            <h3>Training</h3>
            <ul className="dashboard-category-list">
              {trainingCategories.map(category => (
                <li key={category.id} className="dashboard-category-item">
                  <Link to={`/user/${category.name.toLowerCase()}`}  className={`dashboard-category-link ${category.name.toLowerCase()}`}>
                    {category.name}
                    <span className="dashboard-category-count">{category.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="dashboard-catalog-link">
              <Link to="/user/catalog" className="dashboard-btn-outline">Browse Catalog</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-footer">
        <div className="dashboard-support-button">
          <button className="dashboard-btn-primary">Support</button>
        </div>
        <div className="dashboard-copyright">
          © {new Date().getFullYear()} All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


