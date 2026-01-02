import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { FormField, Input, Textarea, Select } from '../common/FormField';
import { Invoice, InvoiceItem, Client, Project } from '../../types';

interface InvoiceFormProps {
  invoice?: Invoice;
  clients: Client[];
  projects: Project[];
  onSubmit: (invoice: Omit<Invoice, 'id'>) => void;
  onCancel: () => void;
}

export function InvoiceForm({ invoice, clients, projects, onSubmit, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft' as Invoice['status'],
    notes: '',
    tax: 19, // IVA por defecto
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (invoice) {
      setFormData({
        clientId: invoice.clientId,
        projectId: invoice.projectId || '',
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        notes: invoice.notes || '',
        tax: invoice.tax,
      });
      setItems(invoice.items);
    } else {
      // Generar número de factura automático
      const invoiceNumber = `F-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, invoiceNumber }));
    }
  }, [invoice]);

  const clientProjects = projects.filter(project => project.client === clients.find(c => c.id === formData.clientId)?.name);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * formData.tax) / 100;
  const total = subtotal + taxAmount;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) newErrors.clientId = 'El cliente es requerido';
    if (!formData.invoiceNumber) newErrors.invoiceNumber = 'El número de factura es requerido';
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.dueDate) newErrors.dueDate = 'La fecha de vencimiento es requerida';

    if (items.some(item => !item.description.trim())) {
      newErrors.items = 'Todos los items deben tener descripción';
    }

    if (items.some(item => item.quantity <= 0 || item.unitPrice <= 0)) {
      newErrors.items = 'Cantidad y precio unitario deben ser mayores a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        clientId: formData.clientId,
        projectId: formData.projectId || undefined,
        invoiceNumber: formData.invoiceNumber,
        date: formData.date,
        dueDate: formData.dueDate,
        items,
        subtotal,
        tax: taxAmount,
        total,
        status: formData.status,
        notes: formData.notes || undefined,
      });
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'sent', label: 'Enviada' },
    { value: 'paid', label: 'Pagada' },
    { value: 'overdue', label: 'Vencida' },
  ];

  const clientOptions = clients.map(client => ({ value: client.id, label: client.name }));
  const projectOptions = [
    { value: '', label: 'Sin proyecto específico' },
    ...clientProjects.map(project => ({ value: project.id, label: project.name }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField label="Cliente" required error={errors.clientId}>
          <Select
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value, projectId: '' })}
            options={clientOptions}
            error={!!errors.clientId}
          />
        </FormField>

        <FormField label="Proyecto" error={errors.projectId}>
          <Select
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            options={projectOptions}
            error={!!errors.projectId}
            disabled={!formData.clientId}
          />
        </FormField>

        <FormField label="Estado" error={errors.status}>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Invoice['status'] })}
            options={statusOptions}
            error={!!errors.status}
          />
        </FormField>

        <FormField label="Número de Factura" required error={errors.invoiceNumber}>
          <Input
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
            error={!!errors.invoiceNumber}
            placeholder="F-001234"
          />
        </FormField>

        <FormField label="Fecha" required error={errors.date}>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={!!errors.date}
          />
        </FormField>

        <FormField label="Fecha de Vencimiento" required error={errors.dueDate}>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            error={!!errors.dueDate}
          />
        </FormField>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Items de Facturación</h3>
          <Button type="button" onClick={addItem} size="small">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Item
          </Button>
        </div>

        {errors.items && (
          <p className="text-red-600 text-sm">{errors.items}</p>
        )}

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="col-span-12 md:col-span-5">
                <FormField label="Descripción">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Descripción del servicio..."
                  />
                </FormField>
              </div>
              
              <div className="col-span-4 md:col-span-2">
                <FormField label="Cantidad">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    min="1"
                  />
                </FormField>
              </div>
              
              <div className="col-span-4 md:col-span-2">
                <FormField label="Precio Unitario">
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    min="0"
                  />
                </FormField>
              </div>
              
              <div className="col-span-3 md:col-span-2">
                <FormField label="Total">
                  <Input
                    value={`$${item.total.toLocaleString()}`}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                </FormField>
              </div>
              
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="space-y-2 max-w-sm ml-auto">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">IVA ({formData.tax}%):</span>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                className="w-16 text-center"
                min="0"
                max="100"
              />
              <span className="font-medium">${taxAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <FormField label="Notas adicionales">
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas adicionales para la factura..."
          rows={3}
        />
      </FormField>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {invoice ? 'Actualizar Factura' : 'Crear Factura'}
        </Button>
      </div>
    </form>
  );
}