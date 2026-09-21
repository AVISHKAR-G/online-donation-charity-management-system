import api from './api';

export const emailPreferencesService = {
  // Fetch the current user's email preferences
  getEmailPreferences: async () => {
    const response = await api.get('/settings/email-preferences');
    return response.data;
  },
  // Update the current user's email preferences
  updateEmailPreferences: async (preferences) => {
    // preferences: { donorReceipts, monthlyReports, productUpdates }
    const response = await api.put('/settings/email-preferences', preferences);
    return response.data;
  },
};

export default emailPreferencesService;