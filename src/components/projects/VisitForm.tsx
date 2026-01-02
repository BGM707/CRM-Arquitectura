import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { FormField, Input, Textarea } from '../common/FormField';
import { Visit } from '../../types';

interface VisitFormProps {
  visit?: Visit;
  defaultLocation?: string;
  onSubmit: (visit: Omit<Visit, 'id'>) => void;
  onCancel: () => void;
}

export function VisitForm({ visit, defaultLocation, onSubmit, onCancel }: VisitFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: defaultLocation || '',
    purpose: '',
    notes: '',
    completed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visit) {
      setFormData({
        date: visit.date,
        time: visit.time,
        location: visit.location,
        purpose: visit.purpose,
        notes: visit.notes || '',
        completed: visit.completed,
      });
    }
  }, [visit]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.time) newErrors.time = 'La hora es requerida';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';
    if (!formData.purpose.trim()) newErrors.purpose = 'El propósito es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        date: formData.date,
        time: formData.time,
        location: formData.location,
        purpose: formData.purpose,
        notes: formData.notes || undefined,
        completed: formData.completed,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Fecha" required error={errors.date}>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={!!errors.date}
          />
        </FormField>

        <FormField label="Hora" required error={errors.time}>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            error={!!errors.time}
          />
        </FormField>
      </div>

      <FormField label="Ubicación" required error={errors.location}>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          error={!!errors.location}
          placeholder="Dirección o ubicación de la visita"
        />
      </FormField>

      <FormField label="Propósito" required error={errors.purpose}>
        <Input
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          error={!!errors.purpose}
          placeholder="Ej: Supervisión de cimientos"
        />
      </FormField>

      <FormField label="Notas" error={errors.notes}>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          error={!!errors.notes}
          placeholder="Notas adicionales sobre la visita..."
          rows={3}
        />
      </FormField>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          checked={formData.completed}
          onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
          Marcar como completada
        </label>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {visit ? 'Actualizar Visita' : 'Crear Visita'}
        </Button>
      </div>
    </form>
  );
}