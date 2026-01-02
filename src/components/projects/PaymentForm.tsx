import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { FormField, Input, Textarea, Select } from '../common/FormField';
import { Payment } from '../../types';

interface PaymentFormProps {
  payment?: Payment;
  client: string;
  onSubmit: (payment: Omit<Payment, 'id'>) => void;
  onCancel: () => void;
}

export function PaymentForm({ payment, client, onSubmit, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    status: 'pending' as Payment['status'],
    description: '',
    client: client,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount.toString(),
        dueDate: payment.dueDate,
        status: payment.status,
        description: payment.description,
        client: payment.client,
      });
    }
  }, [payment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || isNaN(Number(formData.amount))) newErrors.amount = 'El monto debe ser un número válido';
    if (!formData.dueDate) newErrors.dueDate = 'La fecha de vencimiento es requerida';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        status: formData.status,
        description: formData.description,
        client: formData.client,
      });
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagado' },
    { value: 'overdue', label: 'Vencido' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Monto" required error={errors.amount}>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            error={!!errors.amount}
            placeholder="50000"
            min="0"
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

        <FormField label="Estado" error={errors.status}>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
            options={statusOptions}
            error={!!errors.status}
          />
        </FormField>

        <FormField label="Cliente" error={errors.client}>
          <Input
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            error={!!errors.client}
            placeholder="Nombre del cliente"
          />
        </FormField>
      </div>

      <FormField label="Descripción" required error={errors.description}>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={!!errors.description}
          placeholder="Ej: Pago inicial - Diseño arquitectónico"
          rows={3}
        />
      </FormField>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {payment ? 'Actualizar Pago' : 'Crear Pago'}
        </Button>
      </div>
    </form>
  );
}