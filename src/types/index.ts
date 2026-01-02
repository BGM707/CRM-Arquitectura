// Tipos principales de la aplicación
export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  tasks: Task[];
  payments: Payment[];
  visits: Visit[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  client: string;
}

export interface Visit {
  id: string;
  date: string;
  time: string;
  location: string;
  purpose: string;
  notes?: string;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'visit' | 'deadline' | 'payment' | 'reminder';
  description: string;
  priority: 'low' | 'medium' | 'high';
  projectId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  actionRequired?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  projects: string[];
  photos?: ProjectPhoto[];
  receipts?: Receipt[];
}

export interface User {
  username: string;
  password: string;
  isLoggedIn: boolean;
}

export interface ProjectPhoto {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  localPath: string;
  uploadDate: string;
  description?: string;
  category: 'progress' | 'before' | 'after' | 'detail' | 'other';
  size: number;
}

export interface Receipt {
  id: string;
  clientId: string;
  projectId?: string;
  filename: string;
  originalName: string;
  localPath: string;
  uploadDate: string;
  amount: number;
  description: string;
  category: 'service' | 'material' | 'other';
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}