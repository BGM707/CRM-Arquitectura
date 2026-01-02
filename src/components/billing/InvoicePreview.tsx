import React from 'react';
import { Download, Send, CreditCard as Edit } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Invoice, Client, Project } from '../../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  client?: Client;
  project?: Project;
}

export function InvoicePreview({ invoice, client, project }: InvoicePreviewProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviada';
      case 'paid': return 'Pagada';
      case 'overdue': return 'Vencida';
      default: return status;
    }
  };

  const handleDownloadPDF = () => {
    // En un entorno real, aquí se generaría y descargaría el PDF
    alert('Funcionalidad de descarga PDF en desarrollo');
  };

  const handleSendInvoice = () => {
    // En un entorno real, aquí se enviaría la factura por email
    alert('Funcionalidad de envío por email en desarrollo');
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <Badge variant={getStatusVariant(invoice.status)} size="medium">
          {getStatusLabel(invoice.status)}
        </Badge>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button variant="outline" onClick={handleSendInvoice}>
            <Send className="h-4 w-4 mr-2" />
            Enviar por Email
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">FACTURA</h1>
            <p className="text-gray-600 dark:text-gray-400">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">ArchiManager</h2>
            <p className="text-gray-600 dark:text-gray-400">Gestión Arquitectónica</p>
            <p className="text-gray-600 dark:text-gray-400">contacto@archimanager.com</p>
          </div>
        </div>

        {/* Client and Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Facturar a:</h3>
            <div className="text-gray-600 dark:text-gray-400">
              <p className="font-medium">{client?.name || 'Cliente no encontrado'}</p>
              {client?.company && <p>{client.company}</p>}
              <p>{client?.email}</p>
              <p>{client?.phone}</p>
              <p>{client?.address}</p>
            </div>
          </div>
          
          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fecha de Factura:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(invoice.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fecha de Vencimiento:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
              {project && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Proyecto:</span>
                  <span className="text-gray-900 dark:text-gray-100">{project.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-gray-900 dark:text-gray-100 font-semibold">Descripción</th>
                <th className="text-center py-3 text-gray-900 dark:text-gray-100 font-semibold">Cantidad</th>
                <th className="text-right py-3 text-gray-900 dark:text-gray-100 font-semibold">Precio Unit.</th>
                <th className="text-right py-3 text-gray-900 dark:text-gray-100 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 text-gray-600 dark:text-gray-400">{item.description}</td>
                  <td className="py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                    ${item.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-900 dark:text-gray-100 font-medium">
                    ${item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-gray-100">${invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">IVA:</span>
              <span className="text-gray-900 dark:text-gray-100">${invoice.tax.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                <span className="text-gray-900 dark:text-gray-100">${invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notas:</h4>
            <p className="text-gray-600 dark:text-gray-400">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Gracias por confiar en nuestros servicios profesionales de arquitectura</p>
        </div>
      </div>
    </div>
  );
}