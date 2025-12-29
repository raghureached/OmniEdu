import api from '../../../FrontEnd/src/services/api';

/**
 * Fetch content counts for admin dashboard
 * @param {string} timeRange - Time range for filtering (default: '7d')
 * @returns {Promise} Content counts data
 */
export const getContentCounts = async (timeRange = '7d') => {
  try {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    const response = await api.get(`/api/admin/analytics/content-counts${params}`);
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
