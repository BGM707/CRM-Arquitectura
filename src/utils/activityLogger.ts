export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  category: 'auth' | 'project' | 'client' | 'visitor' | 'system' | 'file' | 'billing';
  severity: 'info' | 'warning' | 'error' | 'success';
  ipAddress?: string;
  userAgent?: string;
}

class ActivityLogger {
  private logs: ActivityLog[] = [];
  private maxLogs = 1000; // Máximo número de logs a mantener

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem('activity_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      // Mantener solo los logs más recientes
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
      localStorage.setItem('activity_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving activity logs:', error);
    }
  }

  log(
    userId: string,
    userName: string,
    action: string,
    details: string,
    category: ActivityLog['category'] = 'system',
    severity: ActivityLog['severity'] = 'info'
  ) {
    const logEntry: ActivityLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      details,
      category,
      severity,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
    };

    this.logs.unshift(logEntry); // Agregar al inicio
    this.saveLogs();

    // Log crítico también en consola
    if (severity === 'error' || severity === 'warning') {
      console.warn(`[${severity.toUpperCase()}] ${action}: ${details}`);
    }
  }

  private getClientIP(): string {
    // En un entorno real, esto vendría del servidor
    return 'localhost';
  }

  // Métodos de conveniencia
  logAuth(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'auth', 'info');
  }

  logProject(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'project', 'info');
  }

  logClient(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'client', 'info');
  }

  logVisitor(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'visitor', 'info');
  }

  logFile(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'file', 'info');
  }

  logBilling(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'billing', 'info');
  }

  logError(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'system', 'error');
  }

  logWarning(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'system', 'warning');
  }

  logSuccess(userId: string, userName: string, action: string, details: string) {
    this.log(userId, userName, action, details, 'system', 'success');
  }

  // Obtener logs
  getLogs(limit?: number): ActivityLog[] {
    return limit ? this.logs.slice(0, limit) : this.logs;
  }

  getLogsByCategory(category: ActivityLog['category'], limit?: number): ActivityLog[] {
    const filtered = this.logs.filter(log => log.category === category);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getLogsByUser(userId: string, limit?: number): ActivityLog[] {
    const filtered = this.logs.filter(log => log.userId === userId);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getLogsByDateRange(startDate: Date, endDate: Date): ActivityLog[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // Estadísticas
  getStats() {
    const total = this.logs.length;
    const categories = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severities = this.logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = this.logs.filter(log => new Date(log.timestamp) >= today).length;

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekLogs = this.logs.filter(log => new Date(log.timestamp) >= thisWeek).length;

    return {
      total,
      categories,
      severities,
      todayLogs,
      weekLogs,
    };
  }

  // Limpiar logs antiguos
  clearOldLogs(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoffDate);
    this.saveLogs();
  }

  // Exportar logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Limpiar todos los logs
  clearAllLogs() {
    this.logs = [];
    this.saveLogs();
  }
}

export const activityLogger = new ActivityLogger();