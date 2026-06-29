import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to Excel (.xlsx)
 * @param {Array} data - Array of objects containing data
 * @param {string} filename - Desired filename without extension
 */
export const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn("No data to export to Excel");
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export data to CSV
 * @param {Array} data - Array of objects containing data
 * @param {string} filename - Desired filename without extension
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn("No data to export to CSV");
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to PDF
 * @param {Array} data - Array of objects containing data
 * @param {Array} columns - Array of objects { header: 'Title', dataKey: 'key' }
 * @param {string} filename - Desired filename without extension
 * @param {string} title - Title of the PDF document
 */
export const exportToPDF = (data, columns, filename, title = "Report") => {
  if (!data || data.length === 0) {
    console.warn("No data to export to PDF");
    return;
  }

  const doc = new jsPDF('landscape');
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Generate table
  doc.autoTable({
    startY: 36,
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => {
      // Handle nested properties or custom formatting if needed
      const val = item[col.dataKey];
      if (val instanceof Date) return val.toLocaleDateString();
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      return val !== undefined && val !== null ? String(val) : '';
    })),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
  });

  doc.save(`${filename}.pdf`);
};
