import React, { useState, useMemo } from 'react';
import { Plus, Filter, Calendar, DollarSign, MapPin, Search, Grid3x3 as Grid3X3, List, Import as SortAsc, Dessert as SortDesc, Eye, CreditCard as Edit, Trash2, Clock, CheckCircle, AlertCircle, Camera, Receipt, TrendingUp, Users } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ProjectForm } from './ProjectForm';
import { SearchBar } from '../common/SearchBar';
import { DateFilter } from '../common/DateFilter';
import { Project, Client } from '../../types';

interface ProjectListProps {
  projects: Project[];
  clients: Client[];
  onProjectSelect: (project: Project) => void;
  onCreateProject: (project: Omit<Project, 'id'>) => void;
}

export function ProjectList({ projects, clients, onProjectSelect, onCreateProject }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'budget' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      const matchesDate = (!startDate || project.startDate >= startDate) &&
                         (!endDate || project.endDate <= endDate);
      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'budget':
          aValue = a.budget;
          bValue = b.budget;
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [projects, searchTerm, statusFilter, priorityFilter, startDate, endDate, sortBy, sortOrder]);

  const projectStats = useMemo(() => {
    const total = filteredAndSortedProjects.length;
    const completed = filteredAndSortedProjects.filter(p => p.status === 'completed').length;
    const inProgress = filteredAndSortedProjects.filter(p => p.status === 'in-progress').length;
    const totalBudget = filteredAndSortedProjects.reduce((sum, p) => sum + p.budget, 0);
    const avgProgress = total > 0 ? Math.round(filteredAndSortedProjects.reduce((sum, p) => sum + p.progress, 0) / total) : 0;

    return { total, completed, inProgress, totalBudget, avgProgress };
  }, [filteredAndSortedProjects]);

  const handleSubmit = (projectData: Omit<Project, 'id'>) => {
    onCreateProject(projectData);
    setShowModal(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Proyectos</h1>
          <p className="text-gray-600 mt-1">Administra y supervisa todos tus proyectos arquitectónicos</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{projectStats.total}</div>
            <div className="text-sm text-gray-600">Total Proyectos</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{projectStats.completed}</div>
            <div className="text-sm text-gray-600">Completados</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{projectStats.inProgress}</div>
            <div className="text-sm text-gray-600">En Progreso</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${projectStats.totalBudget.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Presupuesto Total</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{projectStats.avgProgress}%</div>
            <div className="text-sm text-gray-600">Progreso Promedio</div>
          </div>
        </Card>
      </div>

      {/* Filtros Avanzados */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Filtros y Búsqueda</h3>
          </div>
          
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, cliente o ubicación..."
            className="w-full"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="planning">Planificación</option>
                <option value="in-progress">En Progreso</option>
                <option value="review">Revisión</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Fecha</option>
                  <option value="name">Nombre</option>
                  <option value="budget">Presupuesto</option>
                  <option value="progress">Progreso</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DateFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
        </div>
      </Card>

      {/* Lista/Grid de Proyectos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group">
              <div onClick={() => onProjectSelect(project)}>
                {/* Header del proyecto */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{project.progress}%</span>
                </div>
                
                {/* Título y cliente */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {project.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{project.client}</span>
                  </div>
                </div>
                
                {/* Información del proyecto */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="font-semibold">${project.budget.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progreso</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Estadísticas del proyecto */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {project.tasks?.filter(t => t.completed).length || 0} tareas
                    </span>
                    <span className="flex items-center">
                      <Camera className="h-3 w-3 mr-1" />
                      {Math.floor(Math.random() * 20)} fotos
                    </span>
                    <span className="flex items-center">
                      <Receipt className="h-3 w-3 mr-1" />
                      {Math.floor(Math.random() * 10)} boletas
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {project.status === 'in-progress' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                    <Clock className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Vista de Lista */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    <button onClick={() => toggleSort('name')} className="flex items-center space-x-1 hover:text-blue-600">
                      <span>Proyecto</span>
                      {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    <button onClick={() => toggleSort('progress')} className="flex items-center space-x-1 hover:text-blue-600">
                      <span>Progreso</span>
                      {sortBy === 'progress' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    <button onClick={() => toggleSort('budget')} className="flex items-center space-x-1 hover:text-blue-600">
                      <span>Presupuesto</span>
                      {sortBy === 'budget' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    <button onClick={() => toggleSort('date')} className="flex items-center space-x-1 hover:text-blue-600">
                      <span>Fecha Fin</span>
                      {sortBy === 'date' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {project.location}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{project.client}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusVariant(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-semibold text-gray-900">${project.budget.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => onProjectSelect(project)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredAndSortedProjects.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 
              'No se encontraron proyectos que coincidan con los filtros aplicados.' :
              'No hay proyectos creados aún. ¡Crea tu primer proyecto!'
            }
          </div>
          {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
            <Button onClick={() => setShowModal(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Proyecto
            </Button>
          )}
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Proyecto"
        size="large"
      >
        <ProjectForm
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          onClientCreate={(clientName) => {
            // Esta funcionalidad se maneja en el componente padre
          }}
        />
      </Modal>
    </div>
  );
}