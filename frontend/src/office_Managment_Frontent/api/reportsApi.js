import axiosInstance from "./axiosConfig";

export const reportsApi = {
  getTasksReport: (params) => axiosInstance.get('/api/reports/tasks', { params }),
  getOverdueReport: (params) => axiosInstance.get('/api/reports/overdue', { params }),
  getClientsReport: (params) => axiosInstance.get('/api/reports/clients', { params }),
  getFeesReport: (params) => axiosInstance.get('/api/reports/fees', { params }),
  getInvoicesReport: (params) => axiosInstance.get('/api/reports/invoices', { params }),
  getPaymentsReport: (params) => axiosInstance.get('/api/reports/payments', { params }),
  getStaffPerformanceReport: (params) => axiosInstance.get('/api/reports/staff-performance', { params }),
};
