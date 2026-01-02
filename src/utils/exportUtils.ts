import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Project, Client, Task } from '../types';

// Exportar a Excel
export const exportToExcel = (data: any[], filename: string, sheetName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Exportar clientes a Excel
export const exportClientesToExcel = (clientes: Client[]) => {
  const data = clientes.map(cliente => ({
    Nombre: cliente.name,
    Email: cliente.email,
    Teléfono: cliente.phone,
    Dirección: cliente.address,
    Empresa: cliente.company || '',
    'Proyectos Activos': cliente.projects.length,
  }));
  
  exportToExcel(data, 'clientes', 'Clientes');
};

// Exportar proyectos a Excel
export const exportProyectosToExcel = (proyectos: Project[]) => {
  const data = proyectos.map(proyecto => ({
    Nombre: proyecto.name,
    Cliente: proyecto.client,
    Estado: proyecto.status,
    'Fecha Inicio': proyecto.startDate,
    'Fecha Fin': proyecto.endDate,
    Presupuesto: proyecto.budget,
    Progreso: `${proyecto.progress}%`,
    Ubicación: proyecto.location,
    Prioridad: proyecto.priority,
  }));
  
  exportToExcel(data, 'proyectos', 'Proyectos');
};

// Exportar a PDF
export const exportToPDF = (data: any[], title: string, columns: string[], filename: string) => {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Fecha
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
  
  // Tabla
  (doc as any).autoTable({
    head: [columns],
    body: data.map(item => columns.map(col => item[col] || '')),
    startY: 40,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
  });
  
  doc.save(`${filename}.pdf`);
};

// Exportar clientes a PDF
export const exportClientesToPDF = (clientes: Client[]) => {
  const data = clientes.map(cliente => ({
    Nombre: cliente.name,
    Email: cliente.email,
    Teléfono: cliente.phone,
    Empresa: cliente.company || 'N/A',
  }));
  
  exportToPDF(data, 'Lista de Clientes', ['Nombre', 'Email', 'Teléfono', 'Empresa'], 'clientes');
};

// Exportar proyectos a PDF
export const exportProyectosToPDF = (proyectos: Project[]) => {
  const data = proyectos.map(proyecto => ({
    Nombre: proyecto.name,
    Cliente: proyecto.client,
    Estado: proyecto.status,
    Presupuesto: `$${proyecto.budget.toLocaleString()}`,
    Progreso: `${proyecto.progress}%`,
  }));
  
  exportToPDF(data, 'Lista de Proyectos', ['Nombre', 'Cliente', 'Estado', 'Presupuesto', 'Progreso'], 'proyectos');
};

// Descargar respaldo JSON
export const downloadBackup = (data: any, filename: string) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
};

// Generar nombre de archivo con fecha
export const generateFilename = (base: string): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `${base}_${date}`;
};