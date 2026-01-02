import React, { useState, useEffect } from 'react';
import { Activity, Filter, Download, Trash2, Eye, AlertTriangle, CheckCircle, Info, XCircle, Calendar, User, Search } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { SearchBar } from '../common/SearchBar';
import { DateFilter } from '../common/DateFilter';
import { activityLogger, ActivityLog } from '../../utils/activityLogger';

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, categoryFilter, severityFilter, startDate, endDate]);

  const loadLogs = () => {
    const allLogs = activityLogger.getLogs();
    setLogs(allLogs);
    setStats(activityLogger.getStats());
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    // Filtro por severidad
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    // Filtro por fechas
    if (startDate) {
      filtered = filtered.filter(log => log.timestamp >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(log => log.timestamp <= endDate + 'T23:59:59');
    }

    setFilteredLogs(filtered);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      auth: 'Autenticación',
      project: 'Proyectos',
      client: 'Clientes',
      visitor: 'Visitantes',
      system: 'Sistema',
      file: 'Archivos',
      billing: 'Facturación'
    };
    return labels[category] || category;
  };

  const handleExport = () => {
    const exportData = activityLogger.exportLogs();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los logs? Esta acción no se puede deshacer.')) {
      activityLogger.clearAllLogs();
      loadLogs();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Actividad</h1>
          <p className="text-gray-600 mt-1">Monitoreo y auditoría del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="danger" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Logs
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total de Eventos</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.todayLogs || 0}</div>
            <div className="text-sm text-gray-600">Eventos Hoy</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.weekLogs || 0}</div>
            <div className="text-sm text-gray-600">Esta Semana</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.severities?.error || 0}</div>
            <div className="text-sm text-gray-600">Errores</div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>
          
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar en logs..."
            className="w-full"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="auth">Autenticación</option>
                <option value="project">Proyectos</option>
                <option value="client">Clientes</option>
                <option value="visitor">Visitantes</option>
                <option value="system">Sistema</option>
                <option value="file">Archivos</option>
                <option value="billing">Facturación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las severidades</option>
                <option value="info">Información</option>
                <option value="success">Éxito</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
              </select>
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

      {/* Lista de Logs */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Eventos Registrados ({filteredLogs.length})
            </h3>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => {
              const SeverityIcon = getSeverityIcon(log.severity);
              return (
                <div
                  key={log.id}
                  className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <SeverityIcon className={`h-5 w-5 ${getSeverityColor(log.severity)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {log.action}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityVariant(log.severity)} size="small">
                          {log.severity}
                        </Badge>
                        <Badge variant="default" size="small">
                          {getCategoryLabel(log.category)}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {log.userName}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {log.ipAddress && (
                        <span>IP: {log.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron eventos que coincidan con los filtros</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Distribución por Categorías */}
      {stats.categories && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Distribución por Categorías</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{count as number}</div>
                <div className="text-sm text-gray-600">{getCategoryLabel(category)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}