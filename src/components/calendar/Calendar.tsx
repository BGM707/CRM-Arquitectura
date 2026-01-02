import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Calendar as CalendarIcon, Filter, Grid3x3 as Grid3X3, List, Eye, CreditCard as Edit, Trash2, AlertCircle, CheckCircle, Users, Building2, DollarSign } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CalendarEvent } from '../../types';

interface CalendarProps {
  events: CalendarEvent[];
  onEventCreate: () => void;
  onEventSelect: (event: CalendarEvent) => void;
}

export function Calendar({ events, onEventCreate, onEventSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter;
      return matchesType && matchesPriority;
    });
  }, [events, typeFilter, priorityFilter]);

  const eventStats = useMemo(() => {
    const today = new Date();
    const thisMonth = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
    });
    
    const upcoming = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    });

    const overdue = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < today && event.type === 'deadline';
    });

    return {
      total: filteredEvents.length,
      thisMonth: thisMonth.length,
      upcoming: upcoming.length,
      overdue: overdue.length
    };
  }, [filteredEvents]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (view === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'visit': return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'payment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reminder': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return Users;
      case 'visit': return MapPin;
      case 'deadline': return AlertCircle;
      case 'payment': return DollarSign;
      case 'reminder': return Clock;
      default: return CalendarIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600 mt-1">Gestiona eventos, reuniones y fechas importantes</p>
        </div>
        <Button onClick={onEventCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{eventStats.total}</div>
            <div className="text-sm text-gray-600">Total Eventos</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{eventStats.thisMonth}</div>
            <div className="text-sm text-gray-600">Este Mes</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{eventStats.upcoming}</div>
            <div className="text-sm text-gray-600">Próximos</div>
          </div>
        </Card>
        <Card padding="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{eventStats.overdue}</div>
            <div className="text-sm text-gray-600">Vencidos</div>
          </div>
        </Card>
      </div>

      {/* Controles y Filtros */}
      <Card>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          {/* Navegación */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
              {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {view === 'week' && `Semana del ${currentDate.toLocaleDateString()}`}
              {view === 'day' && currentDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {view === 'agenda' && 'Vista de Agenda'}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          {/* Vistas y Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {(['month', 'week', 'day', 'agenda'] as const).map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === viewType
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {viewType === 'month' ? 'Mes' : 
                   viewType === 'week' ? 'Semana' : 
                   viewType === 'day' ? 'Día' : 'Agenda'}
                </button>
              ))}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              <option value="meeting">Reuniones</option>
              <option value="visit">Visitas</option>
              <option value="deadline">Fechas límite</option>
              <option value="payment">Pagos</option>
              <option value="reminder">Recordatorios</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Vista del Calendario */}
      <Card>
        {view === 'month' && (
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-gray-50 p-3 text-center font-medium text-gray-700">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isToday = day.toISOString().split('T')[0] === todayStr;
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              
              return (
                <div
                  key={index}
                  className={`bg-white p-2 min-h-[120px] ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const Icon = getEventTypeIcon(event.type);
                      return (
                        <div
                          key={event.id}
                          onClick={() => onEventSelect(event)}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity border ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)}`}
                        >
                          <div className="flex items-center space-x-1">
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium truncate">{event.title}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-2 w-2" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 p-1">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'week' && (
          <div className="space-y-4">
            <div className="grid grid-cols-8 gap-4">
              <div className="font-medium text-gray-700">Hora</div>
              {getWeekDays().map((day, index) => (
                <div key={index} className="text-center">
                  <div className="font-medium text-gray-900">{daysOfWeek[day.getDay()]}</div>
                  <div className={`text-sm ${day.toISOString().split('T')[0] === todayStr ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Horas del día */}
            {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-4 border-t border-gray-100 pt-2">
                <div className="text-sm text-gray-600 font-medium">
                  {hour}:00
                </div>
                {getWeekDays().map((day, dayIndex) => {
                  const dayEvents = getEventsForDate(day).filter(event => {
                    const eventHour = parseInt(event.time.split(':')[0]);
                    return eventHour === hour;
                  });
                  
                  return (
                    <div key={dayIndex} className="min-h-[60px] relative">
                      {dayEvents.map((event) => {
                        const Icon = getEventTypeIcon(event.type);
                        return (
                          <div
                            key={event.id}
                            onClick={() => onEventSelect(event)}
                            className={`absolute inset-x-0 p-2 rounded cursor-pointer hover:shadow-md transition-all border ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)}`}
                          >
                            <div className="flex items-center space-x-1">
                              <Icon className="h-3 w-3" />
                              <span className="text-xs font-medium truncate">{event.title}</span>
                            </div>
                            <div className="text-xs opacity-75">{event.time}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {view === 'day' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="space-y-2">
              {getEventsForDate(currentDate).length > 0 ? (
                getEventsForDate(currentDate).map((event) => {
                  const Icon = getEventTypeIcon(event.type);
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventSelect(event)}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon className="h-5 w-5" />
                            <Badge variant={event.type === 'meeting' ? 'info' : 
                                          event.type === 'visit' ? 'success' : 
                                          event.type === 'deadline' ? 'error' : 'warning'}>
                              {event.type}
                            </Badge>
                            <span className="text-sm font-medium">{event.time}</span>
                            <Badge variant={event.priority === 'high' ? 'error' : 
                                          event.priority === 'medium' ? 'warning' : 'default'}>
                              {event.priority}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                          <p className="text-sm text-gray-700">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay eventos programados para este día</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'agenda' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
            <div className="space-y-4">
              {filteredEvents
                .filter(event => new Date(event.date) >= today)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 20)
                .map((event) => {
                  const Icon = getEventTypeIcon(event.type);
                  const eventDate = new Date(event.date);
                  const isToday = event.date === todayStr;
                  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventSelect(event)}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)} ${isToday ? 'ring-2 ring-blue-300' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-white rounded-lg">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <Badge variant={event.priority === 'high' ? 'error' : 
                                            event.priority === 'medium' ? 'warning' : 'default'}>
                                {event.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {eventDate.toLocaleDateString('es-ES')}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {event.time}
                              </span>
                              {daysUntil === 0 && <Badge variant="info">Hoy</Badge>}
                              {daysUntil === 1 && <Badge variant="warning">Mañana</Badge>}
                              {daysUntil > 1 && <span>En {daysUntil} días</span>}
                            </div>
                          </div>
                        </div>
                        <Badge variant={event.type === 'meeting' ? 'info' : 
                                      event.type === 'visit' ? 'success' : 
                                      event.type === 'deadline' ? 'error' : 'warning'}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              
              {filteredEvents.filter(event => new Date(event.date) >= today).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No hay eventos próximos programados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}