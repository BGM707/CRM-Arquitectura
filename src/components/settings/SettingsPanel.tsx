import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileText, 
  Users, 
  Building2, 
  Moon, 
  Sun,
  Lock,
  RefreshCw,
  Database,
  FileSpreadsheet,
  Shield,
  Bell,
  Palette,
  Settings,
  HardDrive,
  Wifi,
  Monitor,
  Smartphone,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ChangePasswordForm } from '../auth/ChangePasswordForm';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { 
  downloadBackup, 
  exportClientesToExcel, 
  exportProyectosToExcel,
  exportClientesToPDF,
  exportProyectosToPDF,
  generateFilename 
} from '../../utils/exportUtils';
import { Project, Client } from '../../types';

interface SettingsPanelProps {
  projects?: Project[]; // Made optional
  clients?: Client[]; // Made optional
  onChangePassword: (currentPassword: string, newPassword: string) => boolean;
  onClose: () => void;
}

export function SettingsPanel({ projects = [], clients = [], onChangePassword, onClose }: SettingsPanelProps) {
  console.log('SettingsPanel props:', { projects, clients, onChangePassword, onClose });
  const { theme, toggleTheme } = useTheme();
  console.log('Theme:', { theme, toggleTheme });
  const { addNotification } = useNotifications();
  console.log('Notifications:', { addNotification });
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'data' | 'export' | 'about'>('general');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
    payments: true,
    deadlines: true,
    projects: false
  });
  const [privacy, setPrivacy] = useState({
    analytics: false,
    crashReports: true,
    autoBackup: true,
    cloudSync: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFullBackup = () => {
    try {
      // Incluir datos de usuario (con contraseña actualizada)
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const data = {
        clientes: clients,
        proyectos: projects,
        payments: JSON.parse(localStorage.getItem('payments') || '[]'),
        visits: JSON.parse(localStorage.getItem('visits') || '[]'),
        calendarEvents: JSON.parse(localStorage.getItem('calendar-events') || '[]'),
        notifications: JSON.parse(localStorage.getItem('notifications') || '[]'),
        usuario: {
          username: userData.username || '',
          password: userData.password || '', // Add fallback for safety
        },
        configuracion: {
          tema: theme,
          ultimaActualizacion: new Date().toISOString(),
          version: '1.0.0',
        },
      };
      return data;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  };

  const handleFullBackup = async () => {
    setLoading(true);
    try {
      const data = getFullBackup();
      if (data) {
        downloadBackup(data, generateFilename('respaldo_completo'));
        addNotification({
          title: 'Respaldo Completo',
          message: 'Respaldo descargado exitosamente',
          type: 'success',
        });
      }
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Error al crear el respaldo',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientBackup = () => {
    downloadBackup(clients, generateFilename('clientes'));
    addNotification({
      title: 'Respaldo de Clientes',
      message: 'Respaldo de clientes descargado',
      type: 'success',
    });
  };

  const handleProjectBackup = () => {
    downloadBackup(projects, generateFilename('proyectos'));
    addNotification({
      title: 'Respaldo de Proyectos',
      message: 'Respaldo de proyectos descargado',
      type: 'success',
    });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const importData = (data: any) => {
    try {
      if (data.clientes) {
        localStorage.setItem('clients', JSON.stringify(data.clientes));
      }
      if (data.proyectos) {
        localStorage.setItem('projects', JSON.stringify(data.proyectos));
      }
      if (data.payments) {
        localStorage.setItem('payments', JSON.stringify(data.payments));
      }
      if (data.visits) {
        localStorage.setItem('visits', JSON.stringify(data.visits));
      }
      if (data.calendarEvents) {
        localStorage.setItem('calendar-events', JSON.stringify(data.calendarEvents));
      }
      if (data.notifications) {
        localStorage.setItem('notifications', JSON.stringify(data.notifications));
      }
      if (data.usuario) {
        // Restaurar credenciales de usuario
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          username: data.usuario.username || currentUser.username || '',
          password: data.usuario.password || currentUser.password || '',
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      if (data.configuracion?.tema) {
        localStorage.setItem('theme', data.configuracion.tema);
      }
    } catch (error) {
      throw new Error('Error importing data to localStorage');
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      importData(data);
      
      addNotification({
        title: 'Importación Exitosa',
        message: 'Datos importados correctamente. La página se recargará para aplicar los cambios.',
        type: 'success',
      });
      
      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      addNotification({
        title: 'Error de Importación',
        message: 'Error al importar los datos. Verifica el formato del archivo.',
        type: 'error',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportClientsExcel = () => {
    exportClientesToExcel(clients);
    addNotification({
      title: 'Exportación Excel',
      message: 'Clientes exportados a Excel',
      type: 'success',
    });
  };

  const handleExportProjectsExcel = () => {
    exportProyectosToExcel(projects);
    addNotification({
      title: 'Exportación Excel',
      message: 'Proyectos exportados a Excel',
      type: 'success',
    });
  };

  const handleExportClientsPDF = () => {
    exportClientesToPDF(clients);
    addNotification({
      title: 'Exportación PDF',
      message: 'Clientes exportados a PDF',
      type: 'success',
    });
  };

  const handleExportProjectsPDF = () => {
    exportProyectosToPDF(projects);
    addNotification({
      title: 'Exportación PDF',
      message: 'Proyectos exportados a PDF',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-1">Personaliza y administra tu aplicación ArchiManager</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <Settings className="h-4 w-4 mr-2" />
          Cerrar
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'security', label: 'Seguridad', icon: Shield },
            { id: 'data', label: 'Datos', icon: Database },
            { id: 'export', label: 'Exportar', icon: Download },
            { id: 'about', label: 'Acerca de', icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Apariencia */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Apariencia
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {theme === 'light' ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <span className="font-medium text-gray-900">Tema de la aplicación</span>
                    <p className="text-sm text-gray-600">Modo {theme === 'light' ? 'Claro' : 'Oscuro'} activo</p>
                  </div>
                </div>
                <Button onClick={toggleTheme} variant="outline">
                  <Monitor className="h-4 w-4 mr-2" />
                  Cambiar a {theme === 'light' ? 'Oscuro' : 'Claro'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Notificaciones */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificaciones
            </h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Notificaciones por email', desc: 'Recibir alertas importantes por correo' },
                { key: 'desktop', label: 'Notificaciones de escritorio', desc: 'Mostrar notificaciones en el navegador' },
                { key: 'payments', label: 'Alertas de pagos', desc: 'Notificar sobre pagos pendientes y vencidos' },
                { key: 'deadlines', label: 'Fechas límite', desc: 'Recordatorios de fechas importantes' },
                { key: 'projects', label: 'Actualizaciones de proyectos', desc: 'Cambios en el estado de proyectos' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Privacidad */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Privacidad y Datos
            </h3>
            <div className="space-y-4">
              {[
                { key: 'autoBackup', label: 'Respaldo automático', desc: 'Crear respaldos automáticos semanalmente' },
                { key: 'crashReports', label: 'Reportes de errores', desc: 'Enviar reportes anónimos para mejorar la app' },
                { key: 'analytics', label: 'Análisis de uso', desc: 'Compartir datos de uso para mejoras' },
                { key: 'cloudSync', label: 'Sincronización en la nube', desc: 'Sincronizar datos con servicios en la nube' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy[item.key as keyof typeof privacy]}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Seguridad de la Cuenta
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-900">Contraseña de acceso</span>
                    <p className="text-sm text-gray-600">Última actualización: hace 30 días</p>
                  </div>
                </div>
                <Button onClick={() => setShowPasswordModal(true)} variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Recomendaciones de Seguridad</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Usa una contraseña fuerte con al menos 8 caracteres</li>
                      <li>• Incluye números, letras mayúsculas y símbolos</li>
                      <li>• Cambia tu contraseña regularmente</li>
                      <li>• No compartas tus credenciales de acceso</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Sistema de Respaldos
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <HardDrive className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Respaldo Completo</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Incluye: Proyectos, Clientes, Pagos, Visitas, Calendario, Notificaciones, Credenciales y Configuración.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleFullBackup} disabled={loading} className="w-full">
                  {loading ? <LoadingSpinner size="small" /> : <Download className="h-4 w-4 mr-2" />}
                  Respaldo Completo
                </Button>
                <Button onClick={handleClientBackup} variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Solo Clientes
                </Button>
                <Button onClick={handleProjectBackup} variant="outline" className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  Solo Proyectos
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <Button onClick={handleImport} disabled={importing} className="w-full">
                  {importing ? <LoadingSpinner size="small" /> : <Upload className="h-4 w-4 mr-2" />}
                  Restaurar desde Respaldo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Exportar Datos
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Exportar a Excel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleExportClientsExcel} variant="outline" className="w-full">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    Clientes (.xlsx)
                  </Button>
                  <Button onClick={handleExportProjectsExcel} variant="outline" className="w-full">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    Proyectos (.xlsx)
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Exportar a PDF</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleExportClientsPDF} variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2 text-red-600" />
                    Clientes (.pdf)
                  </Button>
                  <Button onClick={handleExportProjectsPDF} variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2 text-red-600" />
                    Proyectos (.pdf)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="space-y-6">
          <Card>
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ArchiManager Pro</h2>
              <p className="text-gray-600 mb-4">Sistema integral de gestión para estudios de arquitectura</p>
              <Badge variant="info">Versión 1.0.0</Badge>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Gestión de Proyectos</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Administración de Clientes</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Sistema de Facturación</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-orange-600" />
                <span className="text-gray-700">Gestión Local de Archivos</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Sistema</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
                <div className="text-sm text-gray-600">Clientes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{projects.length}</div>
                <div className="text-sm text-gray-600">Proyectos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {projects.filter(p => p.status === 'in-progress').length}
                </div>
                <div className="text-sm text-gray-600">En Progreso</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completados</div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Técnica</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Navegador:</span>
                <span className="text-gray-900">{navigator.userAgent.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plataforma:</span>
                <span className="text-gray-900">{navigator.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Idioma:</span>
                <span className="text-gray-900">{navigator.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Almacenamiento:</span>
                <span className="text-gray-900">Local Storage</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Cambio de Contraseña */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Cambiar Contraseña"
      >
        <ChangePasswordForm
          onChangePassword={onChangePassword}
          onCancel={() => setShowPasswordModal(false)}
        />
      </Modal>
    </div>
  );
}