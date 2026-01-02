import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Download, Calendar, MapPin, Building2, Users, Camera, FileText, Clock, CheckCircle, AlertCircle, Lock, Unlock } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Project, Client, ProjectPhoto, Receipt } from '../../types';

interface VisitorLayoutProps {
  project: Project;
  client: Client;
  photos: ProjectPhoto[];
  receipts: Receipt[];
  visitorSettings: VisitorSettings;
  onLogActivity: (activity: string) => void;
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
}

export function VisitorLayout({ 
  project, 
  client, 
  photos, 
  receipts, 
  visitorSettings, 
  onLogActivity 
}: VisitorLayoutProps) {
  const [viewedSections, setViewedSections] = useState<string[]>([]);

  useEffect(() => {
    onLogActivity(`Cliente ${client.name} accedió al proyecto ${project.name}`);
  }, []);

  const handleSectionView = (section: string) => {
    if (!viewedSections.includes(section)) {
      setViewedSections(prev => [...prev, section]);
      onLogActivity(`Cliente visualizó sección: ${section}`);
    }
  };

  const handleDownload = (type: string, filename: string) => {
    if (visitorSettings.allowDownloads) {
      onLogActivity(`Cliente descargó archivo: ${filename} (${type})`);
      // Aquí iría la lógica de descarga real
      alert(`Descargando: ${filename}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'review': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planificación';
      case 'in-progress': return 'En Progreso';
      case 'review': return 'Revisión';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600">Portal del Cliente - {client.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
              <div className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen del Proyecto */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Información del Proyecto
                </h3>
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => handleSectionView('Información del Proyecto')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">{project.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                  {visitorSettings.showBudget && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Presupuesto: ${project.budget.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {visitorSettings.showProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Progreso del Proyecto</span>
                      <span className="font-bold text-blue-600">{project.progress}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Tareas del Proyecto */}
            {visitorSettings.showTasks && (
              <Card className="hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Estado de Tareas
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => handleSectionView('Estado de Tareas')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {project.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={task.completed ? 'success' : 'default'}>
                          {task.completed ? 'Completada' : 'En Progreso'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Galería de Fotos */}
            {visitorSettings.showPhotos && photos.length > 0 && (
              <Card className="hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-purple-600" />
                    Galería del Proyecto ({photos.length} fotos)
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => handleSectionView('Galería del Proyecto')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.slice(0, 8).map((photo) => (
                    <div key={photo.id} className="group relative">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        {visitorSettings.allowDownloads && (
                          <Button
                            size="small"
                            onClick={() => handleDownload('photo', photo.originalName)}
                            className="text-white bg-white bg-opacity-20 hover:bg-opacity-30"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 truncate">{photo.description || photo.originalName}</p>
                    </div>
                  ))}
                </div>
                
                {photos.length > 8 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">+{photos.length - 8} fotos más</p>
                  </div>
                )}
              </Card>
            )}

            {/* Timeline del Proyecto */}
            {visitorSettings.showTimeline && (
              <Card className="hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    Cronología del Proyecto
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => handleSectionView('Cronología del Proyecto')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="font-medium text-gray-900">Inicio del Proyecto</p>
                      <p className="text-sm text-gray-600">{new Date(project.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {project.tasks.filter(t => t.completed).map((task) => (
                    <div key={task.id} className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">Completada el {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mt-2" />
                    <div>
                      <p className="font-medium text-gray-900">Finalización Estimada</p>
                      <p className="text-sm text-gray-600">{new Date(project.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Información del Cliente */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Su Información
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium text-gray-900">{client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium text-gray-900">{client.phone}</p>
                </div>
              </div>
            </Card>

            {/* Estado de Pagos */}
            {visitorSettings.showPayments && (
              <Card className="hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Estado de Pagos
                </h3>
                <div className="space-y-3">
                  {project.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">${payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{payment.description}</p>
                        <p className="text-xs text-gray-500">Vence: {new Date(payment.dueDate).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'error' : 'warning'}>
                        {payment.status === 'paid' ? 'Pagado' : payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Documentos */}
            {visitorSettings.showReceipts && receipts.length > 0 && (
              <Card className="hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-red-600" />
                  Documentos ({receipts.length})
                </h3>
                <div className="space-y-2">
                  {receipts.slice(0, 5).map((receipt) => (
                    <div key={receipt.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{receipt.description}</p>
                        <p className="text-xs text-gray-600">${receipt.amount.toLocaleString()}</p>
                      </div>
                      {visitorSettings.allowDownloads && (
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDownload('receipt', receipt.originalName)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Configuración de Privacidad */}
            <Card className="bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Información de Acceso
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p className="flex items-center">
                  {visitorSettings.showBudget ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  Información financiera
                </p>
                <p className="flex items-center">
                  {visitorSettings.allowDownloads ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  Descarga de archivos
                </p>
                <p className="flex items-center">
                  {visitorSettings.showPhotos ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  Galería de fotos
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Portal del Cliente - ArchiManager Pro
            </p>
            <p className="text-xs mt-1">
              Última actualización: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}