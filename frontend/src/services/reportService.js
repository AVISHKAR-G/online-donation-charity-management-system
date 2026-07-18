import api from './api';

export const reportService = {
  async dashboardSummary() {
    const { data } = await api.get('/dashboard/summary');
    return data;
  },
  async campaignPerformance() {
    const { data } = await api.get('/report/campaign-performance');
    return data;
  },
  async fundAllocation() {
    const { data } = await api.get('/report/fund-allocation');
    return data;
  },
};
