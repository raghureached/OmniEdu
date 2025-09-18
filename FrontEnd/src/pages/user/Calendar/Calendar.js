import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = ({ onDateSelect, courseAssignments }) => {
  // State for calendar data
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredAssignment, setHoveredAssignment] = useState(null);
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', empty: true });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAssignments = courseAssignments.filter(assignment => assignment.date === dateStr);
      
      // Check if this is today
      const today = new Date();
      const isToday = day === today.getDate() && 
                     currentMonth === today.getMonth() && 
                     currentYear === today.getFullYear();
      
      days.push({
        day,
        assignments: dayAssignments,
        date: dateStr,
        hasAssignment: dayAssignments.length > 0,
        assignmentTypes: [...new Set(dayAssignments.map(assignment => assignment.type))],
        categories: [...new Set(dayAssignments.map(assignment => assignment.category))],
        isToday
      });
    }
    
    return days;
  };
  
  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null); // Clear selection when changing months
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null); // Clear selection when changing months
  };
  
  // Handle date selection
  const handleDateClick = (date, assignments) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date, assignments);
    }
  };
  
  // Format month and year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Get assignments for selected date
  const getAssignmentsForSelectedDate = () => {
    if (!selectedDate) return [];
    return courseAssignments.filter(assignment => assignment.date === selectedDate);
  };
  
  // Handle assignment hover
  const handleAssignmentHover = (assignment) => {
    setHoveredAssignment(assignment);
  };
  
  const handleAssignmentLeave = () => {
    setHoveredAssignment(null);
  };
  
  const calendarDays = generateCalendarDays();
  const selectedDateAssignments = getAssignmentsForSelectedDate();
  
  return (
    <div className="calendar-section">
      <div className="calendar-header-controls">
        <div className="calendar-navigation">
          <button onClick={handlePrevMonth} className="calendar-nav-button">❮</button>
          <h4>{formatMonthYear(currentDate)}</h4>
          <button onClick={handleNextMonth} className="calendar-nav-button">❯</button>
        </div>
      </div>
      
      <div className="calendar-container">
        <div className="calendar-grid">
          <div className="calendar-header">
            <div className="calendar-weekday">Sun</div>
            <div className="calendar-weekday">Mon</div>
            <div className="calendar-weekday">Tue</div>
            <div className="calendar-weekday">Wed</div>
            <div className="calendar-weekday">Thu</div>
            <div className="calendar-weekday">Fri</div>
            <div className="calendar-weekday">Sat</div>
          </div>
          <div className="calendar-days">
            {calendarDays.map((dayData, index) => (
              <div 
                key={index} 
                className={`calendar-day 
                  ${dayData.empty ? 'empty' : ''} 
                  ${dayData.hasAssignment ? 'has-assignment' : ''} 
                  ${selectedDate === dayData.date ? 'selected' : ''}
                  ${dayData.isToday ? 'today' : ''}`}
                onClick={() => !dayData.empty && handleDateClick(dayData.date, dayData.assignments)}
              >
                {!dayData.empty && (
                  <>
                    <span className="day-number">{dayData.day}</span>
                    {dayData.hasAssignment && (
                      <div className="assignment-indicators">
                        {dayData.assignmentTypes.map((type, i) => (
                          <span 
                            key={i} 
                            className={`assignment-type-indicator ${type}`} 
                            title={`${type} on this day`}
                          ></span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="selected-date-assignments">
          {selectedDate ? (
            <>
              <h4>Assignments for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
              <div className="assignment-navigation-hint">
                <p>Click on an assignment to view details</p>
              </div>
              {selectedDateAssignments.length > 0 ? (
                <ul className="assignment-list">
                  {selectedDateAssignments.map(assignment => (
                    <li 
                      key={assignment.id} 
                      className={`assignment-item ${assignment.status} ${assignment.category.toLowerCase()}`}
                      onMouseEnter={() => handleAssignmentHover(assignment)}
                      onMouseLeave={handleAssignmentLeave}
                    >
                      <div className={`assignment-category-indicator ${assignment.category.toLowerCase()}`}></div>
                      <div className="assignment-details">
                        <span className="assignment-title">{assignment.title}</span>
                        <div className="assignment-meta">
                          <span className={`assignment-type ${assignment.type}`}>{assignment.type}</span>
                          <span className="assignment-status">{assignment.status.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-assignments">No assignments scheduled for this date</p>
              )}
              
              {hoveredAssignment && (
                <div className="assignment-details-popup">
                  <h5>{hoveredAssignment.title}</h5>
                  <p className="assignment-description">{hoveredAssignment.description}</p>
                  <div className="assignment-detail-meta">
                    <div className="assignment-detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{hoveredAssignment.duration}</span>
                    </div>
                    <div className="assignment-detail-item">
                      <span className="detail-label">Instructor:</span>
                      <span className="detail-value">{hoveredAssignment.instructor}</span>
                    </div>
                    <div className="assignment-detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status-${hoveredAssignment.status}`}>
                        {hoveredAssignment.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="select-date-prompt">Select a date to view assignments</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;