import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { FormField, Input, Textarea, Select } from '../common/FormField';
import { CalendarEvent, Project } from '../../types';

interface EventFormProps {
  event?: CalendarEvent;
  projects: Project[];
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => void;
  onCancel: () => void;
}

export function EventForm({ event, projects, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting' as CalendarEvent['type'],
    description: '',
    priority: 'medium' as CalendarEvent['priority'],
    projectId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        time: event.time,
        type: event.type,
        description: event.description,
        priority: event.priority,
        projectId: event.projectId || '',
      });
    }
  }, [event]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.time) newErrors.time = 'La hora es requerida';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        title: formData.title,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        description: formData.description,
        priority: formData.priority,
        projectId: formData.projectId || undefined,
      });
    }
  };

  const typeOptions = [
    { value: 'meeting', label: 'Reunión' },
    { value: 'visit', label: 'Visita' },
    { value: 'deadline', label: 'Fecha límite' },
    { value: 'payment', label: 'Pago' },
    { value: 'reminder', label: 'Recordatorio' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
  ];

  const projectOptions = [
    { value: '', label: 'Sin proyecto asociado' },
    ...projects.map(project => ({ value: project.id, label: project.name }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Título" required error={errors.title}>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={!!errors.title}
          placeholder="Ej: Reunión con cliente"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <FormField label="Tipo" error={errors.type}>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
            options={typeOptions}
            error={!!errors.type}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Prioridad" error={errors.priority}>
          <Select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as CalendarEvent['priority'] })}
            options={priorityOptions}
            error={!!errors.priority}
          />
        </FormField>

        <FormField label="Proyecto Asociado" error={errors.projectId}>
          <Select
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            options={projectOptions}
            error={!!errors.projectId}
          />
        </FormField>
      </div>

      <FormField label="Descripción" required error={errors.description}>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={!!errors.description}
          placeholder="Descripción detallada del evento..."
          rows={4}
        />
      </FormField>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {event ? 'Actualizar Evento' : 'Crear Evento'}
        </Button>
      </div>
    </form>
  );
}