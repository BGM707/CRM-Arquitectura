import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useOptimizedNotifications } from './useOptimizedNotifications';
import { Project, Payment, Visit, CalendarEvent, Client } from '../types';

export function useRealtimeData() {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [payments, setPayments] = useLocalStorage<Payment[]>('payments', []);
  const [visits, setVisits] = useLocalStorage<Visit[]>('visits', []);
  const [calendarEvents, setCalendarEvents] = useLocalStorage<CalendarEvent[]>('calendar-events', []);
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const { addNotification } = useOptimizedNotifications();

  // Estadísticas memoizadas para el dashboard
  const dashboardStats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'in-progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    // Calcular ingresos totales de pagos pagados
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    
    // Calcular ingresos pendientes
    const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    
    // Calcular presupuesto total de proyectos activos
    const activeBudget = projects.filter(p => p.status === 'in-progress').reduce((sum, p) => sum + p.budget, 0);
    
    // Calcular presupuesto total de todos los proyectos
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const upcomingVisits = visits.filter(v => !v.completed && new Date(v.date) >= new Date()).length;
    const urgentPayments = payments.filter(p => 
      p.status === 'pending' && 
      new Date(p.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    
    // Calcular pagos vencidos
    const overduePayments = payments.filter(p => 
      p.status === 'pending' && 
      new Date(p.dueDate) < new Date()
    );
    
    // Calcular monto de pagos vencidos
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      activeProjects,
      completedProjects,
      totalRevenue,
      pendingRevenue,
      activeBudget,
      totalBudget,
      pendingPayments,
      upcomingVisits,
      urgentPayments,
      overduePayments,
      overdueAmount,
    };
  }, [projects, payments, visits]);

  // Verificación optimizada de deadlines (solo cada 5 minutos)
  const checkUpcomingDeadlines = useCallback(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Verificar pagos pendientes
    const upcomingPayments = payments.filter(payment => {
      const dueDate = new Date(payment.dueDate);
      return payment.status === 'pending' && dueDate <= tomorrow;
    });

    upcomingPayments.forEach(payment => {
      addNotification({
        title: 'Pago Pendiente',
        message: `El pago de ${payment.client} por $${payment.amount.toLocaleString()} vence pronto`,
        type: 'warning',
        actionRequired: true,
      });
    });

    // Verificar visitas programadas
    const upcomingVisits = visits.filter(visit => {
      const visitDate = new Date(visit.date);
      return !visit.completed && visitDate <= tomorrow;
    });

    upcomingVisits.forEach(visit => {
      addNotification({
        title: 'Visita Programada',
        message: `Tienes una visita programada: ${visit.purpose}`,
        type: 'info',
        actionRequired: true,
      });
    });
  }, [payments, visits, addNotification]);

  // Verificar deadlines cada 5 minutos en lugar de cada hora
  useEffect(() => {
    checkUpcomingDeadlines();
    const interval = setInterval(checkUpcomingDeadlines, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [checkUpcomingDeadlines]);

  // Funciones optimizadas para actualizaciones
  const updateProject = useCallback((updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    addNotification({
      title: 'Proyecto Actualizado',
      message: `El proyecto "${updatedProject.name}" ha sido actualizado`,
      type: 'success',
    });
  }, [setProjects, addNotification]);

  const createProject = useCallback((projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
    };
    setProjects(prev => [...prev, newProject]);
    addNotification({
      title: 'Proyecto Creado',
      message: `El proyecto "${newProject.name}" ha sido creado exitosamente`,
      type: 'success',
    });
    return newProject;
  }, [setProjects, addNotification]);

  const deleteProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      addNotification({
        title: 'Proyecto Eliminado',
        message: `El proyecto "${project.name}" ha sido eliminado`,
        type: 'info',
      });
    }
  }, [projects, setProjects, addNotification]);

  const updatePayment = useCallback((updatedPayment: Payment) => {
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  }, [setPayments]);

  const updateVisit = useCallback((updatedVisit: Visit) => {
    setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
  }, [setVisits]);

  return {
    // Data
    projects,
    payments,
    visits,
    calendarEvents,
    clients,
    dashboardStats,
    
    // Setters
    setProjects,
    setPayments,
    setVisits,
    setCalendarEvents,
    setClients,
    
    // Optimized functions
    updateProject,
    createProject,
    deleteProject,
    updatePayment,
    updateVisit,
  };
}