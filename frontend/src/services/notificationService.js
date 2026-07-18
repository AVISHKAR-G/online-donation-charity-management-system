import api from './api';

export const notificationService = {
  // Reuses the existing history endpoint — no new backend route needed
  async getMyNotifications() {
    const { data } = await api.get('/user/me/history');

    const donationNotifs = (data.donations || [])
      .filter((d) => d.adminMessage && (d.status === 'Approved' || d.status === 'Rejected'))
      .map((d) => ({
        id: `donation-${d.donationId}`,
        type: d.status === 'Approved' ? 'success' : 'error',
        message: d.adminMessage,
        date: d.date,
      }));

    const applicationNotifs = (data.applications || [])
      .filter((a) => a.status === 'Approved' || a.status === 'Rejected' || a.status === 'FundAllocated')
      .map((a) => ({
        id: `application-${a.applicationId}`,
        type: a.status === 'Rejected' ? 'error' : 'success',
        message:
          a.status === 'FundAllocated'
            ? `🎉 Great news! Funds of ₹${a.amountRequired?.toLocaleString()} have been allocated for your "${a.type}" application.`
            : a.status === 'Approved'
            ? `✅ Your "${a.type}" application has been approved and is being processed.`
            : `Your "${a.type}" application could not be approved. Please check your submission or contact support.`,
        date: a.createdAt,
      }));

    const aidNotifs = (data.aidReceived || [])
      .filter((d) => d.status === 'Delivered')
      .map((d) => ({
        id: `aid-${d.aidDeliveryId}`,
        type: 'success',
        message: `📦 Aid of ₹${d.amountDelivered?.toLocaleString()} has been delivered to you via ${d.method}. Thank you for being part of the HopeCare community!`,
        date: d.deliveredAt,
      }));

    return [...donationNotifs, ...applicationNotifs, ...aidNotifs].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  },
};