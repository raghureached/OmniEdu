// Analytics API service
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Handle API errors
const handleApiError = (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  return response.json();
};

// Get complete analytics data
export const getAnalyticsData = async (timeRange = 'week') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/analytics?timeRange=${timeRange}`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleApiError(response);
    
    if (!result.isSuccess) {
      throw new Error(result.message || 'Failed to fetch analytics data');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Get completion metrics
export const getCompletionMetrics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/analytics/completion`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleApiError(response);
    
    if (!result.isSuccess) {
      throw new Error(result.message || 'Failed to fetch completion metrics');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching completion metrics:', error);
    throw error;
  }
};

// Get deadlines and overdue assignments
export const getDeadlines = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/analytics/deadlines`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleApiError(response);
    
    if (!result.isSuccess) {
      throw new Error(result.message || 'Failed to fetch deadlines');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching deadlines:', error);
    throw error;
  }
};

// Get time spent learning
export const getTimeSpent = async (timeRange = 'week') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/analytics/time-spent?timeRange=${timeRange}`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleApiError(response);
    
    if (!result.isSuccess) {
      throw new Error(result.message || 'Failed to fetch time spent data');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching time spent data:', error);
    throw error;
  }
};

// Get assessment performance
export const getAssessmentPerformance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/analytics/assessment-performance`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleApiError(response);
    
    if (!result.isSuccess) {
      throw new Error(result.message || 'Failed to fetch assessment performance');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching assessment performance:', error);
    throw error;
  }
};

// Get gamification stats
export const getGamificationStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/analytics/gamification`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleApiError(response);
    
    if (!result.isSuccess) {
      throw new Error(result.message || 'Failed to fetch gamification stats');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    throw error;
  }
};
