import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Plus,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle2,
  Camera,
  Receipt,
  FileText
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Project } from '../../types';

interface DashboardProps {
  dashboardStats: {
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    pendingRevenue: number;
    activeBudget: number;
    totalBudget: number;
    pendingPayments: number;
    upcomingVisits: number;
    urgentPayments: any[];
    overduePayments: any[];
    overdueAmount: number;
  };
  recentProjects: Project[];
  onNavigate: (page: string) => void;
  onCreateProject: () => void;
}

export function Dashboard({ dashboardStats, recentProjects, onNavigate, onCreateProject }: DashboardProps) {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'quarter'>('month');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { 
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
    overdueAmount
  } = dashboardStats;

  // Cálculos avanzados
  const completionRate = useMemo(() => {
    const total = activeProjects + completedProjects;
    return total > 0 ? Math.round((completedProjects / total) * 100) : 0;
  }, [activeProjects, completedProjects]);

  const revenueGrowth = useMemo(() => {
    // Simulación de crecimiento (en una app real vendría de datos históricos)
    return Math.round(Math.random() * 20 - 5); // -5% a +15%
  }, [totalRevenue]);

  const projectsByStatus = useMemo(() => {
    const statusCount = recentProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: 'En Progreso', value: statusCount['in-progress'] || 0, color: 'bg-blue-500' },
      { name: 'Revisión', value: statusCount['review'] || 0, color: 'bg-yellow-500' },
      { name: 'Completados', value: statusCount['completed'] || 0, color: 'bg-green-500' },
      { name: 'Planificación', value: statusCount['planning'] || 0, color: 'bg-gray-500' },
    ];
  }, [recentProjects]);

  const quickActions = [
    { 
      title: 'Nuevo Proyecto', 
      icon: Building2, 
      action: onCreateProject,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Crear proyecto'
    },
    { 
      title: 'Ver Calendario', 
      icon: Calendar, 
      action: () => onNavigate('calendar'),
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Gestionar eventos'
    },
    { 
      title: 'Gestionar Clientes', 
      icon: Users, 
      action: () => onNavigate('clients'),
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Ver clientes'
    },
    { 
      title: 'Facturación', 
      icon: FileText, 
      action: () => onNavigate('billing'),
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Crear facturas'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header con filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Resumen ejecutivo de tu estudio de arquitectura</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
            </select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Ocultar' : 'Mostrar'} Análisis
          </Button>
          
          <Button onClick={onCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Stats Grid Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Proyectos Activos"
          value={activeProjects}
          icon={Building2}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Tasa Completación"
          value={`${completionRate}%`}
          icon={Target}
          color="green"
          trend={{ value: completionRate > 80 ? 5 : -2, isPositive: completionRate > 80 }}
        />
        <StatsCard
          title="Ingresos Totales"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend={{ value: revenueGrowth, isPositive: revenueGrowth > 0 }}
        />
        <StatsCard
          title="Pendiente Cobro"
          value={`$${pendingRevenue.toLocaleString()}`}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Pagos Vencidos"
          value={overduePayments.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Visitas Próximas"
          value={upcomingVisits}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Análisis Avanzado (Condicional) */}
      {showAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Distribución de Proyectos</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {projectsByStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <span className="text-sm font-medium text-gray-700">{status.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{status.value}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${status.color}`}
                        style={{ width: `${(status.value / Math.max(...projectsByStatus.map(s => s.value))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Métricas Financieras</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-600 font-medium">Ingresos Confirmados</p>
                  <p className="text-2xl font-bold text-green-700">${totalRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pendiente de Cobro</p>
                  <p className="text-2xl font-bold text-yellow-700">${pendingRevenue.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              
              {overdueAmount > 0 && (
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Pagos Vencidos</p>
                    <p className="text-2xl font-bold text-red-700">${overdueAmount.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Acciones Rápidas */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
            >
              <action.icon className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold mb-1">{action.title}</h4>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proyectos Recientes Mejorado */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Proyectos Recientes</h3>
              <Button variant="ghost" size="small" onClick={() => onNavigate('projects')}>
                <Eye className="h-4 w-4 mr-2" />
                Ver todos
              </Button>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="group p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-md hover:bg-white border border-transparent hover:border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{project.name}</p>
                        <p className="text-sm text-gray-600">{project.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        project.status === 'completed' ? 'success' :
                        project.status === 'in-progress' ? 'info' :
                        project.status === 'review' ? 'warning' : 'default'
                      }>
                        {project.status}
                      </Badge>
                      <span className="text-sm font-medium text-gray-500">{project.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Panel de Alertas y Notificaciones */}
        <div className="space-y-6">
          {/* Pagos Urgentes */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pagos Urgentes</h3>
              <Button variant="ghost" size="small" onClick={() => onNavigate('calendar')}>
                Ver calendario
              </Button>
            </div>
            <div className="space-y-3">
              {urgentPayments.length > 0 ? (
                urgentPayments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{payment.client}</p>
                        <p className="text-xs text-gray-600">{payment.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">${payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-red-500">{new Date(payment.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No hay pagos urgentes</p>
                </div>
              )}
            </div>
          </Card>

          {/* Resumen de Archivos */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Archivos del Sistema</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Fotos de Proyectos</span>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {/* Aquí iría el conteo real de fotos */}
                  {Math.floor(Math.random() * 50) + 10}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Receipt className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Boletas y Recibos</span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {Math.floor(Math.random() * 30) + 5}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Facturas Generadas</span>
                </div>
                <span className="text-sm font-bold text-purple-600">
                  {Math.floor(Math.random() * 20) + 3}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}