import React, { useState, useMemo } from 'react';
import { Plus, CreditCard as Edit, Trash2, Mail, Phone, MapPin, Building, Search, Filter, Grid3x3 as Grid3X3, List, Import as SortAsc, Dessert as SortDesc, Eye, Calendar, DollarSign, FileText, Camera, Receipt, TrendingUp, Users, Star, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ClientForm } from './ClientForm';
import { SearchBar } from '../common/SearchBar';
import { Client, Project } from '../../types';

interface ClientListProps {
  clients: Client[];
  projects: Project[];
  onClientCreate: (client: Omit<Client, 'id'>) => void;
  onClientUpdate: (client: Client) => void;
  onClientDelete: (clientId: string) => void;
}

export function ClientList({ clients, projects, onClientCreate, onClientUpdate, onClientDelete }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'projects' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');

  const clientsWithStats = useMemo(() => {
    return clients.map(client => {
      const clientProjects = projects.filter(project => project.client === client.name);
      const activeProjects = clientProjects.filter(p => p.status === 'in-progress').length;
      const completedProjects = clientProjects.filter(p => p.status === 'completed').length;
      const totalBudget = clientProjects.reduce((sum, p) => sum + p.budget, 0);
      const totalRevenue = clientProjects
        .flatMap(p => p.payments || [])
        .filter(payment => payment.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        ...client,
        projectCount: clientProjects.length,
        activeProjects,
        completedProjects,
        totalBudget,
        totalRevenue,
        projects: clientProjects,
        lastProjectDate: clientProjects.length > 0 
          ? Math.max(...clientProjects.map(p => new Date(p.startDate).getTime()))
          : 0
      };
    });
  }, [clients, projects]);

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clientsWithStats.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'active' && client.activeProjects > 0) ||
                           (filterBy === 'inactive' && client.activeProjects === 0);
      
      return matchesSearch && matchesFilter;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'projects':
          aValue = a.projectCount;
          bValue = b.projectCount;
          break;
        case 'date':
          aValue = a.lastProjectDate;
          bValue = b.lastProjectDate;
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
  }, [clientsWithStats, searchTerm, filterBy, sortBy, sortOrder]);

  const clientStats = useMemo(() => {
    const total = filteredAndSortedClients.length;
    const active = filteredAndSortedClients.filter(c => c.activeProjects > 0).length;
    const totalRevenue = filteredAndSortedClients.reduce((sum, c) => sum + c.totalRevenue, 0);
    const avgProjectsPerClient = total > 0 ? Math.round(filteredAndSortedClients.reduce((sum, c) => sum + c.projectCount, 0) / total) : 0;

    return { total, active, totalRevenue, avgProjectsPerClient };
  }, [filteredAndSortedClients]);

  const handleSubmit = (clientData: Omit<Client, 'id'>) => {
    if (editingClient) {
      onClientUpdate({ ...clientData, id: editingClient.id });
    } else {
      onClientCreate(clientData);
    }
    setShowModal(false);
    setEditingClient(undefined);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client && confirm(`¿Estás seguro de que quieres eliminar el cliente "${client.name}"?`)) {
      onClientDelete(clientId);
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

  const getClientStatus = (client: typeof clientsWithStats[0]) => {
    if (client.activeProjects > 0) return { label: 'Activo', variant: 'success' as const };
    if (client.projectCount > 0) return { label: 'Inactivo', variant: 'warning' as const };
    return { label: 'Nuevo', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra tu cartera de clientes y sus proyectos</p>
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
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{clientStats.total}</div>
            <div className="text-sm text-gray-600">Total Clientes</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{clientStats.active}</div>
            <div className="text-sm text-gray-600">Clientes Activos</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${clientStats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Ingresos Totales</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{clientStats.avgProjectsPerClient}</div>
            <div className="text-sm text-gray-600">Proyectos/Cliente</div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Filtros y Búsqueda</h3>
          </div>
          
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar clientes por nombre, email o empresa..."
            className="w-full"
          />
          
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Nombre</option>
                  <option value="projects">Proyectos</option>
                  <option value="date">Último Proyecto</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Clientes */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedClients.map((client) => {
            const status = getClientStatus(client);
            return (
              <Card key={client.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                {/* Header del cliente */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {client.name}
                      </h3>
                      {client.company && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-3 w-3 mr-1" />
                          {client.company}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="small" onClick={() => handleEdit(client)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <a href={`mailto:${client.email}`} className="hover:text-blue-600 transition-colors truncate">
                      {client.email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <a href={`tel:${client.phone}`} className="hover:text-blue-600 transition-colors">
                      {client.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>

                {/* Estadísticas del cliente */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{client.projectCount}</div>
                    <div className="text-xs text-blue-600">Proyectos</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">${client.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-green-600">Ingresos</div>
                  </div>
                </div>

                {/* Proyectos del cliente */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Proyectos Recientes</span>
                    <Badge variant="info">{client.activeProjects} activos</Badge>
                  </div>
                  {client.projects.length > 0 ? (
                    <div className="space-y-2">
                      {client.projects.slice(0, 2).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate">{project.name}</div>
                            <div className="text-xs text-gray-600">{project.status}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                            <div className="w-12 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {client.projects.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{client.projects.length - 2} proyectos más
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sin proyectos</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
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
                      <span>Cliente</span>
                      {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contacto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    <button onClick={() => toggleSort('projects')} className="flex items-center space-x-1 hover:text-blue-600">
                      <span>Proyectos</span>
                      {sortBy === 'projects' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Ingresos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.map((client) => {
                  const status = getClientStatus(client);
                  return (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{client.name}</div>
                            {client.company && (
                              <div className="text-sm text-gray-600 flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {client.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-2 text-gray-400" />
                            <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                              {client.email}
                            </a>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-2 text-gray-400" />
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{client.projectCount}</span>
                          <span className="text-sm text-gray-600">
                            ({client.activeProjects} activos)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="font-semibold text-gray-900">${client.totalRevenue.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="small" onClick={() => handleEdit(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="small" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredAndSortedClients.length === 0 && (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-4">
            {searchTerm || filterBy !== 'all' ? 
              'No se encontraron clientes que coincidan con los filtros.' :
              'No hay clientes registrados aún.'
            }
          </div>
          {(!searchTerm && filterBy === 'all') && (
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primer Cliente
            </Button>
          )}
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(undefined);
        }}
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <ClientForm
          client={editingClient}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingClient(undefined);
          }}
        />
      </Modal>
    </div>
  );
}