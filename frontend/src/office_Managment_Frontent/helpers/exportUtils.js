import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* Export data to Excel (.xlsx) */
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

/* Export data to CSV */
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

/* Export data to PDF */
export const exportToPDF = (data, columns, filename, title = "Report") => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18);
  doc.text(title, 14, 22);

  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  autoTable(doc, {
    startY: 36,
    head: [Object.keys(data[0])],
    body: data.map(row => Object.values(row)),
    theme: "grid",
  });

  doc.save(`${filename}.pdf`);
};
