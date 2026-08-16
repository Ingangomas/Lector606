import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from './gemini';

export function exportToExcel(data: InvoiceData[], companyName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
    'Proveedor': item.proveedor,
    'RNC Proveedor': item.rncProveedor,
    'NCF': item.ncf,
    'Sub-Total': item.subTotal,
    'ITBIS': item.itbis,
    'Total': item.total,
    'Forma de Pago': item.formaPago,
    'RNC Cliente': item.rncCliente,
    'Estado': item.mismatchRnc ? 'MISMATCH_RNC' : (item.ocrError ? 'ERROR_OCR' : 'OK')
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");
  XLSX.writeFile(workbook, `Reporte_606_${companyName.replace(/\s+/g, '_')}.xlsx`);
}

export function exportToPDF(data: InvoiceData[], companyName: string) {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(18);
  doc.text(`Reporte de Facturas 606 - ${companyName}`, 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

  const sortedData = [...data].sort((a, b) => {
    if (a.mismatchRnc === b.mismatchRnc) return 0;
    return a.mismatchRnc ? 1 : -1;
  });

  const tableData = sortedData.map(item => [
    item.proveedor,
    item.rncProveedor,
    item.ncf,
    item.subTotal,
    item.itbis,
    item.total,
    item.formaPago,
    item.mismatchRnc ? 'MISMATCH_RNC' : (item.ocrError ? 'ERROR_OCR' : 'OK')
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['Proveedor', 'RNC Prov.', 'NCF', 'Sub-Total', 'ITBIS', 'Total', 'Pago', 'Estado']],
    body: tableData,
    didParseCell: function(data) {
      if (data.section === 'body') {
        const rowData = sortedData[data.row.index];
        if (rowData.mismatchRnc) {
          data.cell.styles.fillColor = [255, 243, 205];
          data.cell.styles.textColor = [133, 100, 4];
        } else if (rowData.ocrError) {
          data.cell.styles.fillColor = [248, 215, 218];
          data.cell.styles.textColor = [114, 28, 36];
        }
      }
    }
  });

  doc.save(`Reporte_606_${companyName.replace(/\s+/g, '_')}.pdf`);
}
