import api from './api';

export const settingsService = {
  // Fetch the current user's notification preferences
  getNotificationPreferences: async () => {
    const response = await api.get('/settings/notifications');
    return response.data;
  },

  // Update the current user's notification preferences
  updateNotificationPreferences: async (preferences) => {
    // preferences: { emailAlerts, donorSignups, campaignMilestones, weeklyDigest }
    const response = await api.put('/settings/notifications', preferences);
    return response.data;
  },
};

export default settingsService;