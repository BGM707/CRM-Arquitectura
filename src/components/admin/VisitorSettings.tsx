import React, { useState } from 'react';
import { Eye, EyeOff, Settings, Save, Users, Lock, Unlock, Download, Camera, FileText, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Project, Client } from '../../types';

interface VisitorSettingsProps {
  project: Project;
  client: Client;
  onSaveSettings: (settings: VisitorSettings) => void;
  onGenerateLink: (settings: VisitorSettings) => string;
}

interface VisitorSettings {
  showBudget: boolean;
  showPayments: boolean;
  showTasks: boolean;
  showPhotos: boolean;
  showReceipts: boolean;
  showProgress: boolean;
  showTimeline: boolean;
  allowDownloads: boolean;
  expirationDate?: string;
  accessCode?: string;
}

export function VisitorSettings({ project, client, onSaveSettings, onGenerateLink }: VisitorSettingsProps) {
  const [settings, setSettings] = useState<VisitorSettings>({
    showBudget: false,
    showPayments: true,
    showTasks: true,
    showPhotos: true,
    showReceipts: false,
    showProgress: true,
    showTimeline: true,
    allowDownloads: false,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleToggle = (key: keyof VisitorSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    onSaveSettings(settings);
    const link = onGenerateLink(settings);
    setGeneratedLink(link);
  };

  const settingsOptions = [
    {
      key: 'showBudget' as keyof VisitorSettings,
      label: 'Mostrar Presupuesto',
      description: 'Permite al cliente ver el presupuesto del proyecto',
      icon: DollarSign,
      color: 'text-green-600',
      sensitive: true
    },
    {
      key: 'showPayments' as keyof VisitorSettings,
      label: 'Estado de Pagos',
      description: 'Muestra el estado de los pagos pendientes y realizados',
      icon: FileText,
      color: 'text-blue-600',
      sensitive: true
    },
    {
      key: 'showTasks' as keyof VisitorSettings,
      label: 'Tareas del Proyecto',
      description: 'Lista las tareas completadas y pendientes',
      icon: CheckCircle,
      color: 'text-purple-600',
      sensitive: false
    },
    {
      key: 'showPhotos' as keyof VisitorSettings,
      label: 'Galería de Fotos',
      description: 'Permite ver las fotos del progreso del proyecto',
      icon: Camera,
      color: 'text-indigo-600',
      sensitive: false
    },
    {
      key: 'showReceipts' as keyof VisitorSettings,
      label: 'Documentos y Boletas',
      description: 'Muestra documentos relacionados con el proyecto',
      icon: FileText,
      color: 'text-orange-600',
      sensitive: true
    },
    {
      key: 'showProgress' as keyof VisitorSettings,
      label: 'Progreso del Proyecto',
      description: 'Barra de progreso y porcentaje de avance',
      icon: CheckCircle,
      color: 'text-green-600',
      sensitive: false
    },
    {
      key: 'showTimeline' as keyof VisitorSettings,
      label: 'Cronología',
      description: 'Timeline con hitos y fechas importantes',
      icon: Clock,
      color: 'text-gray-600',
      sensitive: false
    },
    {
      key: 'allowDownloads' as keyof VisitorSettings,
      label: 'Permitir Descargas',
      description: 'Permite al cliente descargar fotos y documentos',
      icon: Download,
      color: 'text-red-600',
      sensitive: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración de Acceso del Cliente</h2>
          <p className="text-gray-600 mt-1">
            Configura qué información puede ver {client.name} del proyecto "{project.name}"
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar y Generar Enlace
          </Button>
        </div>
      </div>

      {/* Información del Proyecto */}
      <Card>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <p className="text-gray-600">Cliente: {client.name}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Estado:</span>
            <p className="font-medium text-gray-900">{project.status}</p>
          </div>
          <div>
            <span className="text-gray-600">Progreso:</span>
            <p className="font-medium text-gray-900">{project.progress}%</p>
          </div>
          <div>
            <span className="text-gray-600">Fecha de fin:</span>
            <p className="font-medium text-gray-900">{new Date(project.endDate).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {/* Configuraciones de Privacidad */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configuraciones de Privacidad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsOptions.map((option) => {
            const Icon = option.icon;
            const isEnabled = settings[option.key] as boolean;
            
            return (
              <div
                key={option.key}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isEnabled 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                } ${option.sensitive ? 'border-l-4 border-l-yellow-400' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${option.color}`} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {option.sensitive && (
                      <Lock className="h-3 w-3 text-yellow-600" />
                    )}
                  </div>
                  <button
                    onClick={() => handleToggle(option.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Configuraciones Adicionales */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuraciones Adicionales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Expiración del Enlace
            </label>
            <input
              type="date"
              value={settings.expirationDate || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, expirationDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Acceso (Opcional)
            </label>
            <input
              type="text"
              value={settings.accessCode || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, accessCode: e.target.value }))}
              placeholder="Ej: PROYECTO2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Enlace Generado */}
      {generatedLink && (
        <Card className="bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Enlace Generado</h3>
          <div className="bg-white border border-green-300 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Comparte este enlace con tu cliente:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm"
              />
              <Button
                size="small"
                onClick={() => navigator.clipboard.writeText(generatedLink)}
              >
                Copiar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Resumen de Configuración */}
      <Card className="bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Resumen de Configuración</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(settings).filter(Boolean).length}
            </div>
            <div className="text-blue-700">Opciones Habilitadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {settingsOptions.filter(opt => settings[opt.key] && !opt.sensitive).length}
            </div>
            <div className="text-green-700">Información Pública</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {settingsOptions.filter(opt => settings[opt.key] && opt.sensitive).length}
            </div>
            <div className="text-yellow-700">Información Sensible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {settings.allowDownloads ? 'Sí' : 'No'}
            </div>
            <div className="text-purple-700">Descargas Permitidas</div>
          </div>
        </div>
      </Card>
    </div>
  );
}