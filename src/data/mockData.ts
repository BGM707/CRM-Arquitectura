import { Project, Payment, Visit, CalendarEvent, Client } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Casa Moderna Los Altos',
    client: 'María González',
    status: 'in-progress',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 150000,
    progress: 65,
    description: 'Diseño y construcción de casa moderna de 250m²',
    location: 'Los Altos, Santiago',
    priority: 'high',
    tasks: [
      {
        id: '1',
        title: 'Finalizar planos arquitectónicos',
        description: 'Completar detalles constructivos',
        completed: true,
        dueDate: '2024-02-01',
        priority: 'high',
      },
      {
        id: '2',
        title: 'Obtener permisos de construcción',
        description: 'Tramitar permisos municipales',
        completed: false,
        dueDate: '2024-02-15',
        priority: 'medium',
      },
    ],
    payments: [
      {
        id: '1',
        amount: 30000,
        dueDate: '2024-02-01',
        status: 'paid',
        description: 'Pago inicial - Diseño',
        client: 'María González',
      },
      {
        id: '2',
        amount: 50000,
        dueDate: '2024-03-01',
        status: 'pending',
        description: 'Pago intermedio - Construcción',
        client: 'María González',
      },
    ],
    visits: [
      {
        id: '1',
        date: '2024-01-20',
        time: '10:00',
        location: 'Los Altos, Santiago',
        purpose: 'Revisión inicial del terreno',
        completed: true,
      },
      {
        id: '2',
        date: '2024-02-10',
        time: '14:00',
        location: 'Los Altos, Santiago',
        purpose: 'Supervisión de cimientos',
        completed: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Oficinas Corporativas',
    client: 'Empresa ABC',
    status: 'review',
    startDate: '2024-03-01',
    endDate: '2024-08-15',
    budget: 300000,
    progress: 30,
    description: 'Diseño de oficinas corporativas 500m²',
    location: 'Las Condes, Santiago',
    priority: 'medium',
    tasks: [],
    payments: [],
    visits: [],
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    amount: 30000,
    dueDate: '2024-02-01',
    status: 'paid',
    description: 'Pago inicial - Casa Los Altos',
    client: 'María González',
  },
  {
    id: '2',
    amount: 50000,
    dueDate: '2024-03-01',
    status: 'pending',
    description: 'Pago intermedio - Casa Los Altos',
    client: 'María González',
  },
  {
    id: '3',
    amount: 75000,
    dueDate: '2024-02-28',
    status: 'pending',
    description: 'Pago inicial - Oficinas ABC',
    client: 'Empresa ABC',
  },
];

export const mockVisits: Visit[] = [
  {
    id: '1',
    date: '2024-01-20',
    time: '10:00',
    location: 'Los Altos, Santiago',
    purpose: 'Revisión inicial del terreno',
    completed: true,
  },
  {
    id: '2',
    date: '2024-02-10',
    time: '14:00',
    location: 'Los Altos, Santiago',
    purpose: 'Supervisión de cimientos',
    completed: false,
  },
  {
    id: '3',
    date: '2024-02-15',
    time: '09:00',
    location: 'Las Condes, Santiago',
    purpose: 'Presentación inicial oficinas',
    completed: false,
  },
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Reunión con María González',
    date: '2024-01-25',
    time: '10:00',
    type: 'meeting',
    description: 'Revisión de avances del proyecto',
    priority: 'high',
    projectId: '1',
  },
  {
    id: '2',
    title: 'Visita obra Los Altos',
    date: '2024-02-10',
    time: '14:00',
    type: 'visit',
    description: 'Supervisión de cimientos',
    priority: 'medium',
    projectId: '1',
  },
  {
    id: '3',
    title: 'Entrega de planos',
    date: '2024-02-15',
    time: '16:00',
    type: 'deadline',
    description: 'Deadline para entrega de planos finales',
    priority: 'high',
    projectId: '2',
  },
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+56 9 8765 4321',
    address: 'Los Altos, Santiago',
    projects: ['1'],
  },
  {
    id: '2',
    name: 'Empresa ABC',
    email: 'contacto@empresaabc.com',
    phone: '+56 2 2345 6789',
    address: 'Las Condes, Santiago',
    company: 'ABC Corporación',
    projects: ['2'],
  },
];