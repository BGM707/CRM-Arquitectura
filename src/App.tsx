import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { Layout } from './components/common/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { Calendar } from './components/calendar/Calendar';
import { EventForm } from './components/calendar/EventForm';
import { ClientList } from './components/clients/ClientList';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { ActivityLogs } from './components/admin/ActivityLogs';
import { VisitorSettings } from './components/admin/VisitorSettings';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { InvoiceManager } from './components/billing/InvoiceManager';
import { Modal } from './components/common/Modal';
import { ProjectForm } from './components/projects/ProjectForm';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useRealtimeData } from './hooks/useRealtimeData';
import { useOptimizedNotifications } from './hooks/useOptimizedNotifications';
import { useAuth } from './hooks/useAuth';
import { useLocalStorage } from './hooks/useLocalStorage';
import { activityLogger } from './utils/activityLogger';
import { mockProjects, mockPayments, mockVisits, mockCalendarEvents, mockClients } from './data/mockData';
import { Project, CalendarEvent, Invoice, Client } from './types';

function App() {
  const { isLoggedIn, login, logout, changePassword } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Usar hooks optimizados
  const {
    projects,
    payments,
    visits,
    calendarEvents,
    clients,
    dashboardStats,
    setCalendarEvents,
    setClients,
    updateProject,
    createProject,
    deleteProject,
  } = useRealtimeData();
  
  const { addNotification } = useOptimizedNotifications();
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

  // Logging de actividades
  const logActivity = (action: string, details: string, category: any = 'system') => {
    activityLogger.log('admin', 'Administrator', action, details, category);
  };

  // Datos memoizados para el dashboard
  const recentProjects = projects.slice(0, 5);

  // Inicializar aplicación
  useEffect(() => {
    // Inicializar con datos mock si no existen
    if (projects.length === 0) {
      localStorage.setItem('projects', JSON.stringify(mockProjects));
    }
    if (payments.length === 0) {
      localStorage.setItem('payments', JSON.stringify(mockPayments));
    }
    if (visits.length === 0) {
      localStorage.setItem('visits', JSON.stringify(mockVisits));
    }
    if (calendarEvents.length === 0) {
      localStorage.setItem('calendar-events', JSON.stringify(mockCalendarEvents));
    }
    if (clients.length === 0) {
      localStorage.setItem('clients', JSON.stringify(mockClients));
    }
    setInitialized(true);
  }, [projects.length, payments.length, visits.length, calendarEvents.length, clients.length]);


  // Si no está loggeado, mostrar formulario de login
  if (!isLoggedIn) {
    return <LoginForm onLogin={login} />;
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    logActivity('Proyecto Seleccionado', `Acceso al proyecto: ${project.name}`, 'project');
    setCurrentPage('project-detail');
  };

  const handleCreateProjectModal = () => {
    setShowProjectModal(true);
  };
  
  const handleProjectCreate = (projectData: Omit<Project, 'id'>) => {
    const newProject = createProject(projectData);
    logActivity('Proyecto Creado', `Nuevo proyecto: ${newProject.name} para cliente: ${projectData.client}`, 'project');
    
    // Si el cliente no existe, crearlo
    const clientExists = clients.some(c => c.name === projectData.client);
    if (!clientExists) {
      const newClient: Client = {
        id: Date.now().toString() + '_client',
        name: projectData.client,
        email: '',
        phone: '',
        address: projectData.location || '',
        projects: [newProject.id],
      };
      setClients(prev => [...prev, newClient]);
    } else {
      // Actualizar cliente existente para incluir el nuevo proyecto
      setClients(prev => prev.map(client => 
        client.name === projectData.client 
          ? { ...client, projects: [...client.projects, newProject.id] }
          : client
      ));
    }
    
    setShowProjectModal(false);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    updateProject(updatedProject);
    logActivity('Proyecto Actualizado', `Proyecto modificado: ${updatedProject.name}`, 'project');
    setSelectedProject(updatedProject);
  };

  const handleProjectDelete = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?`)) {
      deleteProject(projectId);
      logActivity('Proyecto Eliminado', `Proyecto eliminado: ${project.name}`, 'project');
      setCurrentPage('projects');
    }
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleEventSubmit = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (editingEvent) {
      logActivity('Evento Actualizado', `Evento modificado: ${eventData.title}`, 'system');
      const updatedEvents = calendarEvents.map(event =>
        event.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : event
      );
      setCalendarEvents(updatedEvents);
      addNotification({
        title: 'Evento Actualizado',
        message: `El evento "${eventData.title}" ha sido actualizado`,
        type: 'success',
      });
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Date.now().toString(),
      };
      logActivity('Evento Creado', `Nuevo evento: ${newEvent.title}`, 'system');
      setCalendarEvents(prev => [...prev, newEvent]);
      addNotification({
        title: 'Evento Creado',
        message: `El evento "${newEvent.title}" ha sido creado`,
        type: 'success',
      });
    }
    setShowEventModal(false);
    setEditingEvent(undefined);
  };

  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setShowEventModal(true);
  };

  const handleClientCreate = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
    };
    setClients(prev => [...prev, newClient]);
    logActivity('Cliente Creado', `Nuevo cliente: ${newClient.name}`, 'client');
    addNotification({
      title: 'Cliente Creado',
      message: `El cliente "${newClient.name}" ha sido registrado`,
      type: 'success',
    });
  };

  const handleClientUpdate = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    logActivity('Cliente Actualizado', `Cliente modificado: ${updatedClient.name}`, 'client');
    addNotification({
      title: 'Cliente Actualizado',
      message: `Los datos de "${updatedClient.name}" han sido actualizados`,
      type: 'success',
    });
  };

  const handleClientDelete = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      logActivity('Cliente Eliminado', `Cliente eliminado: ${client.name}`, 'client');
      addNotification({
        title: 'Cliente Eliminado',
        message: `El cliente "${client.name}" ha sido eliminado`,
        type: 'info',
      });
    }
  };
  
  const handleInvoiceCreate = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
    };
    setInvoices(prev => [...prev, newInvoice]);
    logActivity('Factura Creada', `Nueva factura: ${newInvoice.invoiceNumber} para ${clients.find(c => c.id === newInvoice.clientId)?.name}`, 'billing');
    addNotification({
      title: 'Factura Creada',
      message: `La factura #${newInvoice.invoiceNumber} ha sido creada`,
      type: 'success',
    });
  };

  const handleInvoiceUpdate = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    logActivity('Factura Actualizada', `Factura modificada: ${updatedInvoice.invoiceNumber}`, 'billing');
    addNotification({
      title: 'Factura Actualizada',
      message: `La factura #${updatedInvoice.invoiceNumber} ha sido actualizada`,
      type: 'success',
    });
  };

  const handleInvoiceDelete = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      logActivity('Factura Eliminada', `Factura eliminada: ${invoice.invoiceNumber}`, 'billing');
      addNotification({
        title: 'Factura Eliminada',
        message: `La factura #${invoice.invoiceNumber} ha sido eliminada`,
        type: 'info',
      });
    }
  };

  const handleVisitorSettingsSave = (settings: any) => {
    logActivity('Configuración de Visitante', `Configuración guardada para proyecto: ${selectedProject?.name}`, 'visitor');
  };

  const handleGenerateVisitorLink = (settings: any) => {
    return `${window.location.origin}/visitor/${selectedProject?.id}?token=${Date.now()}`;
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            dashboardStats={dashboardStats}
            recentProjects={recentProjects}
            onNavigate={setCurrentPage}
            onCreateProject={handleCreateProjectModal}
          />
        );
      case 'projects':
        return (
          <ProjectList
            projects={projects}
            clients={clients}
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleProjectCreate}
          />
        );
      case 'project-detail':
        return selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            clients={clients}
            onBack={() => setCurrentPage('projects')}
            onUpdate={handleProjectUpdate}
            onDelete={handleProjectDelete}
          />
        ) : (
          <div>Proyecto no encontrado</div>
        );
      case 'calendar':
        return (
          <Calendar
            events={calendarEvents}
            onEventCreate={handleCreateEvent}
            onEventSelect={handleEventSelect}
          />
        );
      case 'clients':
        return (
          <ClientList
            clients={clients}
            projects={projects}
            onClientCreate={handleClientCreate}
            onClientUpdate={handleClientUpdate}
            onClientDelete={handleClientDelete}
          />
        );
      case 'billing':
        return (
          <InvoiceManager
            invoices={invoices}
            clients={clients}
            projects={projects}
            onInvoiceCreate={handleInvoiceCreate}
            onInvoiceUpdate={handleInvoiceUpdate}
            onInvoiceDelete={handleInvoiceDelete}
          />
        );
      case 'logs':
        return <ActivityLogs />;
      case 'visitor-settings':
        return selectedProject ? (
          <VisitorSettings
            project={selectedProject}
            client={clients.find(c => c.name === selectedProject.client)!}
            onSaveSettings={handleVisitorSettingsSave}
            onGenerateLink={handleGenerateVisitorLink}
          />
        ) : null;
      case 'settings':
        return (
          <SettingsPanel
            projects={projects}
            clients={clients}
            onChangePassword={changePassword}
            onClose={() => setCurrentPage('dashboard')}
          />
        );
      case 'notifications':
        return <NotificationCenter onClose={() => setCurrentPage('dashboard')} />;
      default:
        return (
          <Dashboard
            dashboardStats={dashboardStats}
            recentProjects={recentProjects}
            onNavigate={setCurrentPage}
            onCreateProject={handleCreateProjectModal}
          />
        );
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Layout 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onLogout={logout}
      >
        {renderCurrentPage()}
      </Layout>
      
      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEvent(undefined);
        }}
        title={editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
        size="large"
      >
        <EventForm
          event={editingEvent}
          projects={projects}
          onSubmit={handleEventSubmit}
          onCancel={() => {
            setShowEventModal(false);
            setEditingEvent(undefined);
          }}
        />
      </Modal>

      {/* Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title="Nuevo Proyecto"
        size="large"
      >
        <ProjectForm
          clients={clients}
          onSubmit={handleProjectCreate}
          onCancel={() => setShowProjectModal(false)}
        />
      </Modal>
    </div>
  );
}

export default App;