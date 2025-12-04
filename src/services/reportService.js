import api from '../utils/api';

class ReportService {
  async getAvailableMonths() {
    try {
      const response = await api.get('/reports/available-months');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error getting available months');
    }
  }

  async getReportPreview(year, month) {
    try {
      const response = await api.get(`/reports/preview?year=${year}&month=${month}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error getting report preview');
    }
  }

  async downloadMonthlyReport(year, month) {
    try {
      const response = await api.get(`/reports/monthly?year=${year}&month=${month}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      // Create blob and download file
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `VISTA_Reporte_${year}_${month}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error downloading report');
    }
  }

  getMonthName(month) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  }
}

export default new ReportService();