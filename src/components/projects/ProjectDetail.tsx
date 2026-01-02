import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard as Edit, Trash2, Plus, Calendar, DollarSign, MapPin, Clock, CheckCircle, FolderOpen, ExternalLink } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ProjectForm } from './ProjectForm';
import { TaskForm } from './TaskForm';
import { PaymentForm } from './PaymentForm';
import { VisitForm } from './VisitForm';
import { PhotoManager } from './PhotoManager';
import { ReceiptManager } from './ReceiptManager';
import { Project, Task, Payment, Visit, Client } from '../../types';
import { ProjectPhoto, Receipt } from '../../types';

interface ProjectDetailProps {
  project: Project;
  clients: Client[];
  onBack: () => void;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectDetail({ project, clients, onBack, onUpdate, onDelete }: ProjectDetailProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>();
  const [editingVisit, setEditingVisit] = useState<Visit | undefined>();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'payments' | 'visits' | 'photos' | 'receipts'>('overview');
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // Cargar fotos y boletas del proyecto
  useEffect(() => {
    const savedPhotos = localStorage.getItem(`project_photos_${project.id}`);
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
    
    const savedReceipts = localStorage.getItem(`project_receipts_${project.id}`);
    if (savedReceipts) {
      setReceipts(JSON.parse(savedReceipts));
    }
  }, [project.id]);

  const handleOpenFolder = () => {
    const localFolder = (project as any).localFolder;
    if (localFolder) {
      // En un entorno real, esto abriría el explorador de archivos
      alert(`Abriendo carpeta: ${localFolder}`);
    } else {
      alert('No hay carpeta local configurada para este proyecto');
    }
  };

  const getStatusVariant = (status: string) => {
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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'default';
    }
  };

  const handleProjectUpdate = (updatedProjectData: Omit<Project, 'id'>) => {
    const updatedProject = { ...project, ...updatedProjectData };
    onUpdate(updatedProject);
    setShowEditModal(false);
  };

  const handleTaskSubmit = (taskData: Omit<Task, 'id'>) => {
    const updatedTasks = editingTask
      ? project.tasks.map(task => task.id === editingTask.id ? { ...taskData, id: editingTask.id } : task)
      : [...project.tasks, { ...taskData, id: Date.now().toString() }];
    
    onUpdate({ ...project, tasks: updatedTasks });
    setShowTaskModal(false);
    setEditingTask(undefined);
  };

  const handlePaymentSubmit = (paymentData: Omit<Payment, 'id'>) => {
    const updatedPayments = editingPayment
      ? project.payments.map(payment => payment.id === editingPayment.id ? { ...paymentData, id: editingPayment.id } : payment)
      : [...project.payments, { ...paymentData, id: Date.now().toString() }];
    
    // Actualizar también en el localStorage global
    const allPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    if (editingPayment) {
      const updatedAllPayments = allPayments.map((p: any) => 
        p.id === editingPayment.id ? { ...paymentData, id: editingPayment.id } : p
      );
      localStorage.setItem('payments', JSON.stringify(updatedAllPayments));
    } else {
      const newPayment = { ...paymentData, id: Date.now().toString() };
      localStorage.setItem('payments', JSON.stringify([...allPayments, newPayment]));
    }
    
    onUpdate({ ...project, payments: updatedPayments });
    setShowPaymentModal(false);
    setEditingPayment(undefined);
  };

  const handleVisitSubmit = (visitData: Omit<Visit, 'id'>) => {
    const updatedVisits = editingVisit
      ? project.visits.map(visit => visit.id === editingVisit.id ? { ...visitData, id: editingVisit.id } : visit)
      : [...project.visits, { ...visitData, id: Date.now().toString() }];
    
    onUpdate({ ...project, visits: updatedVisits });
    setShowVisitModal(false);
    setEditingVisit(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = project.tasks.filter(task => task.id !== taskId);
    onUpdate({ ...project, tasks: updatedTasks });
  };

  const handleDeletePayment = (paymentId: string) => {
    const updatedPayments = project.payments.filter(payment => payment.id !== paymentId);
    onUpdate({ ...project, payments: updatedPayments });
  };

  const handleDeleteVisit = (visitId: string) => {
    const updatedVisits = project.visits.filter(visit => visit.id !== visitId);
    
    // Actualizar también en el localStorage global
    const allVisits = JSON.parse(localStorage.getItem('visits') || '[]');
    const updatedAllVisits = allVisits.filter((v: any) => v.id !== visitId);
    localStorage.setItem('visits', JSON.stringify(updatedAllVisits));
    
    onUpdate({ ...project, visits: updatedVisits });
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = project.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const updatedProject = { ...project, tasks: updatedTasks };
    onUpdate(updatedProject);
    
    // Recalcular progreso basado en tareas completadas
    const completedCount = updatedTasks.filter(task => task.completed).length;
    const totalCount = updatedTasks.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    if (newProgress !== project.progress) {
      onUpdate({ ...updatedProject, progress: newProgress });
    }
  };

  const completedTasks = project.tasks.filter(task => task.completed).length;
  const totalTasks = project.tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const tabs = [
    { id: 'overview', label: 'Resumen', count: null },
    { id: 'tasks', label: 'Tareas', count: project.tasks.length },
    { id: 'payments', label: 'Pagos', count: project.payments.length },
    { id: 'visits', label: 'Visitas', count: project.visits.length },
    { id: 'photos', label: 'Fotos', count: photos.length },
    { id: 'receipts', label: 'Boletas', count: receipts.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <div className="flex space-x-2">
          {(project as any).localFolder && (
            <Button variant="outline" onClick={handleOpenFolder}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Abrir Carpeta
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="danger" onClick={() => onDelete(project.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Badge variant={getStatusVariant(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
              <Badge variant={getPriorityVariant(project.priority)}>
                Prioridad {project.priority}
              </Badge>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h2>
            <p className="text-gray-600 mb-4">{project.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {project.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                ${project.budget.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(project.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(project.endDate).toLocaleDateString()}
              </div>
              {(project as any).localFolder && (
                <div className="flex items-center text-sm text-gray-600 col-span-2">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  <span className="truncate">{(project as any).localFolder}</span>
                  <button
                    onClick={handleOpenFolder}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del proyecto</span>
                <span>{project.progress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tareas completadas</span>
                <span className="font-medium">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Progreso de tareas</span>
                <span className="font-medium">{taskProgress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pagos pendientes</span>
                <span className="font-medium">{project.payments.filter(p => p.status === 'pending').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Visitas programadas</span>
                <span className="font-medium">{project.visits.filter(v => !v.completed).length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumen de Tareas</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de tareas</span>
                <span>{taskProgress}%</span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completedTasks} de {totalTasks} tareas completadas
              </p>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Archivos del Proyecto</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{photos.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fotos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{receipts.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Boletas</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tasks' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tareas</h3>
            <Button size="small" onClick={() => setShowTaskModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:shadow-md">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    } transition-all duration-200`}
                  >
                    {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                  </button>
                  <div>
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <Badge variant={getPriorityVariant(task.priority)} size="small">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="small" onClick={() => {
                    setEditingTask(task);
                    setShowTaskModal(true);
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {project.tasks.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay tareas creadas</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pagos</h3>
            <Button size="small" onClick={() => setShowPaymentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pago
            </Button>
          </div>
          <div className="space-y-3">
            {project.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:shadow-md">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{payment.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">${payment.amount.toLocaleString()}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Vence: {new Date(payment.dueDate).toLocaleDateString()}
                    </span>
                    <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'error' : 'warning'}>
                      {payment.status === 'paid' ? 'Pagado' : payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="small" onClick={() => {
                    setEditingPayment(payment);
                    setShowPaymentModal(true);
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => handleDeletePayment(payment.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {project.payments.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay pagos registrados</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'visits' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Visitas</h3>
            <Button size="small" onClick={() => setShowVisitModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Visita
            </Button>
          </div>
          <div className="space-y-3">
            {project.visits.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:shadow-md">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{visit.purpose}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(visit.date).toLocaleDateString()} - {visit.time}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {visit.location}
                    </span>
                    <Badge variant={visit.completed ? 'success' : 'default'}>
                      {visit.completed ? 'Completada' : 'Programada'}
                    </Badge>
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{visit.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="small" onClick={() => {
                    setEditingVisit(visit);
                    setShowVisitModal(true);
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => handleDeleteVisit(visit.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {project.visits.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay visitas programadas</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'photos' && (
        <PhotoManager
          project={project}
          client={clients.find(c => c.name === project.client)!}
          photos={photos}
          onPhotosUpdate={setPhotos}
        />
      )}

      {activeTab === 'receipts' && (
        <ReceiptManager
          project={project}
          client={clients.find(c => c.name === project.client)!}
          receipts={receipts}
          onReceiptsUpdate={setReceipts}
        />
      )}

      {/* Modals */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Proyecto"
        size="large"
      >
        <ProjectForm
          project={project}
          clients={clients}
          onSubmit={handleProjectUpdate}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(undefined);
        }}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskModal(false);
            setEditingTask(undefined);
          }}
        />
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setEditingPayment(undefined);
        }}
        title={editingPayment ? 'Editar Pago' : 'Nuevo Pago'}
      >
        <PaymentForm
          payment={editingPayment}
          client={project.client}
          onSubmit={handlePaymentSubmit}
          onCancel={() => {
            setShowPaymentModal(false);
            setEditingPayment(undefined);
          }}
        />
      </Modal>

      <Modal
        isOpen={showVisitModal}
        onClose={() => {
          setShowVisitModal(false);
          setEditingVisit(undefined);
        }}
        title={editingVisit ? 'Editar Visita' : 'Nueva Visita'}
      >
        <VisitForm
          visit={editingVisit}
          defaultLocation={project.location}
          onSubmit={handleVisitSubmit}
          onCancel={() => {
            setShowVisitModal(false);
            setEditingVisit(undefined);
          }}
        />
      </Modal>
    </div>
  );
}