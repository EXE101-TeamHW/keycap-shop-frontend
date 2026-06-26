import axiosClient from './axiosClient';

export const reportApi = {
  revenue: (from: string, to: string, groupBy: string = "DAY") =>
    axiosClient.get(`/reports/revenue?from=${from}&to=${to}&groupBy=${groupBy}`),
  staffPerformance: () => axiosClient.get('/reports/staff-performance'),
  trends: () => axiosClient.get('/reports/trends'),
  dashboardSummary: (from: string, to: string) =>
    axiosClient.get(`/reports/dashboard-summary?from=${from}&to=${to}`),
};
