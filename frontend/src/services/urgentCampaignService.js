import api from './api';

export const urgentCampaignService = {
  async send(subject, message) {
    const { data } = await api.post('/urgentcampaign/send', { subject, message });
    return data;
  },
};