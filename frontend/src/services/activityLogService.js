import api from './api';

export const activityLogService = {
  // Fetch the current user's recent activity log entries
  getRecent: async () => {
    const response = await api.get('/activitylog');
    return response.data;
  },
};

export default activityLogService;