import React, { useState } from 'react';
import { Plus, FileText, Send, Eye, CreditCard as Edit, Trash2, Download, Filter, Grid3x3 as Grid3X3, List, Import as SortAsc, Dessert as SortDesc, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, DollarSign, Calendar, Users } from 'lucide-react'
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { SearchBar } from '../common/SearchBar';
import { Invoice, Client, Project } from '../../types';

interface InvoiceManagerProps {
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  onInvoiceCreate: (invoice: Omit<Invoice, 'id'>) => void;
  onInvoiceUpdate: (invoice: Invoice) => void;
  onInvoiceDelete: (invoiceId: string) => void;
}

export function InvoiceManager({ 
  invoices, 
  clients, 
  projects, 
  onInvoiceCreate, 
  onInvoiceUpdate, 
  onInvoiceDelete 
}: InvoiceManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const client = clients.find(c => c.id === invoice.clientId);
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleCreateInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    onInvoiceCreate(invoiceData);
    setShowCreateModal(false);
  };

  const handleEditInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    if (selectedInvoice) {
      onInvoiceUpdate({ ...invoiceData, id: selectedInvoice.id });
      setShowEditModal(false);
      setSelectedInvoice(null);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      onInvoiceDelete(invoiceId);
    }
  };

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Facturación</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Facturado</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${paidAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cobrado</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              ${pendingAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pendiente de Cobro</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar facturas..."
            className="flex-1"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviada</option>
            <option value="paid">Pagada</option>
            <option value="overdue">Vencida</option>
          </select>
        </div>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => {
          const client = clients.find(c => c.id === invoice.clientId);
          const project = projects.find(p => p.id === invoice.projectId);
          
          return (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Factura #{invoice.invoiceNumber}
                    </h3>
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Cliente:</span>
                      <p>{client?.name || 'Cliente no encontrado'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Proyecto:</span>
                      <p>{project?.name || 'Sin proyecto'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>
                      <p>{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ${invoice.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowPreviewModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleDeleteInvoice(invoice.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredInvoices.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' ? 
              'No se encontraron facturas que coincidan con los filtros.' :
              'No hay facturas creadas aún.'
            }
          </p>
        </Card>
      )}

      {/* Modals */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Factura"
        size="xlarge"
      >
        <InvoiceForm
          clients={clients}
          projects={projects}
          onSubmit={handleCreateInvoice}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedInvoice(null);
        }}
        title="Editar Factura"
        size="xlarge"
      >
        {selectedInvoice && (
          <InvoiceForm
            invoice={selectedInvoice}
            clients={clients}
            projects={projects}
            onSubmit={handleEditInvoice}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedInvoice(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedInvoice(null);
        }}
        title="Vista Previa de Factura"
        size="xlarge"
      >
        {selectedInvoice && (
          <InvoicePreview
            invoice={selectedInvoice}
            client={clients.find(c => c.id === selectedInvoice.clientId)}
            project={projects.find(p => p.id === selectedInvoice.projectId)}
          />
        )}
      </Modal>
    </div>
  );
}