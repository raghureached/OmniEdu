import api from '../../../FrontEnd/src/services/api';

/**
 * Fetch content counts for admin dashboard
 * @param {string} timeRange - Time range for filtering (default: '7d')
 * @param {object} customDates - Custom date range with startDate and endDate
 * @returns {Promise} Content counts data
 */
export const getContentCounts = async (timeRange = '7d', customDates = null) => {
  try {
    const params = new URLSearchParams();
    if (timeRange) params.append('timeRange', timeRange);
    if (customDates && customDates.startDate) params.append('startDate', customDates.startDate.toISOString());
    if (customDates && customDates.endDate) params.append('endDate', customDates.endDate.toISOString());
    const url = params.toString() ? `/api/admin/analytics/content-counts?${params}` : '/api/admin/analytics/content-counts';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching content counts:', error);
    throw error;
  }
};

export const getContentCountsAll = async () => {
  try {
    const response = await api.get('/api/admin/analytics/content-counts-all');
    return response.data;
  } catch (error) {
    console.error('Error fetching content counts:', error);
    throw error;
  }
};
