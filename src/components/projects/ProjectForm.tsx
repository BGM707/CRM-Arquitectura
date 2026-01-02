import React, { useState, useEffect } from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../common/Button';
import { FormField, Input, Textarea, Select } from '../common/FormField';
import { Project, Client } from '../../types';

interface ProjectFormProps {
  project?: Project;
  clients: Client[];
  onSubmit: (project: Omit<Project, 'id'>) => void;
  onCancel: () => void;
  onClientCreate?: (clientName: string) => void;
}

export function ProjectForm({ project, clients, onSubmit, onCancel, onClientCreate }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: 'planning' as Project['status'],
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    location: '',
    priority: 'medium' as Project['priority'],
    localFolder: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        client: project.client,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget.toString(),
        description: project.description,
        location: project.location,
        priority: project.priority,
        localFolder: (project as any).localFolder || '',
      });
    }
  }, [project]);

  const handleSelectFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        setFormData({ ...formData, localFolder: dirHandle.name });
      } else {
        // Fallback for browsers that don't support File System Access API
        const folderPath = prompt('Ingresa la ruta de la carpeta del proyecto:');
        if (folderPath) {
          setFormData({ ...formData, localFolder: folderPath });
        }
      }
    } catch (error) {
      console.log('User cancelled folder selection');
    }
  };

  const handleCreateNewClient = () => {
    if (newClientName.trim() && onClientCreate) {
      onClientCreate(newClientName.trim());
      setFormData({ ...formData, client: newClientName.trim() });
      setNewClientName('');
      setShowNewClientInput(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.client.trim()) newErrors.client = 'El cliente es requerido';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';
    if (!formData.budget || isNaN(Number(formData.budget))) newErrors.budget = 'El presupuesto debe ser un número válido';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name: formData.name,
        client: formData.client,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget),
        progress: project?.progress || 0,
        description: formData.description,
        location: formData.location,
        priority: formData.priority,
        tasks: project?.tasks || [],
        payments: project?.payments || [],
        visits: project?.visits || [],
        localFolder: formData.localFolder,
      });
    }
  };

  const statusOptions = [
    { value: 'planning', label: 'Planificación' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'review', label: 'Revisión' },
    { value: 'completed', label: 'Completado' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
  ];

  const clientOptions = [
    ...clients.map(client => ({ value: client.name, label: client.name })),
    { value: '__new__', label: '+ Crear nuevo cliente' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nombre del Proyecto" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            placeholder="Ej: Casa Moderna Los Altos"
          />
        </FormField>

        <FormField label="Cliente" required error={errors.client}>
          {showNewClientInput ? (
            <div className="flex space-x-2">
              <Input
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Nombre del nuevo cliente"
                className="flex-1"
              />
              <Button type="button" onClick={handleCreateNewClient} size="small">
                Crear
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowNewClientInput(false)} size="small">
                Cancelar
              </Button>
            </div>
          ) : (
            <Select
              value={formData.client}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setShowNewClientInput(true);
                } else {
                  setFormData({ ...formData, client: e.target.value });
                }
              }}
              options={clientOptions}
              error={!!errors.client}
            />
          )}
        </FormField>

        <FormField label="Estado" error={errors.status}>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
            options={statusOptions}
            error={!!errors.status}
          />
        </FormField>

        <FormField label="Prioridad" error={errors.priority}>
          <Select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
            options={priorityOptions}
            error={!!errors.priority}
          />
        </FormField>

        <FormField label="Fecha de Inicio" required error={errors.startDate}>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            error={!!errors.startDate}
          />
        </FormField>

        <FormField label="Fecha de Fin" required error={errors.endDate}>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            error={!!errors.endDate}
          />
        </FormField>

        <FormField label="Presupuesto" required error={errors.budget}>
          <Input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            error={!!errors.budget}
            placeholder="150000"
            min="0"
          />
        </FormField>

        <FormField label="Ubicación" required error={errors.location}>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            error={!!errors.location}
            placeholder="Ej: Las Condes, Santiago"
          />
        </FormField>
      </div>

      <FormField label="Carpeta Local del Proyecto" error={errors.localFolder}>
        <div className="flex space-x-2">
          <Input
            value={formData.localFolder}
            onChange={(e) => setFormData({ ...formData, localFolder: e.target.value })}
            error={!!errors.localFolder}
            placeholder="Ruta de la carpeta del proyecto"
            className="flex-1"
          />
          <Button type="button" onClick={handleSelectFolder} variant="outline">
            <FolderOpen className="h-4 w-4 mr-2" />
            Seleccionar
          </Button>
        </div>
      </FormField>

      <FormField label="Descripción" error={errors.description}>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={!!errors.description}
          placeholder="Descripción detallada del proyecto..."
          rows={4}
        />
      </FormField>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
        </Button>
      </div>
    </form>
  );
}