# ArchiManager Pro

Sistema integral de gestión para estudios de arquitectura desarrollado con React, TypeScript y Tailwind CSS.

## 🏗️ Características Principales

### 📋 Gestión de Proyectos
- **CRUD completo** de proyectos arquitectónicos
- **Seguimiento de progreso** con barras visuales y porcentajes
- **Gestión de tareas** con estados y fechas de vencimiento
- **Organización por estados**: Planificación, En Progreso, Revisión, Completado
- **Prioridades**: Alta, Media, Baja con indicadores visuales
- **Integración con carpetas locales** para organización de archivos

### 👥 Administración de Clientes
- **Base de datos de clientes** con información completa
- **Historial de proyectos** por cliente
- **Estadísticas financieras** por cliente
- **Información de contacto** y empresa
- **Relación automática** con proyectos

### 📅 Sistema de Calendario
- **4 vistas diferentes**: Mes, Semana, Día, Agenda
- **Tipos de eventos**: Reuniones, Visitas, Fechas límite, Pagos, Recordatorios
- **Filtros avanzados** por tipo y prioridad
- **Notificaciones automáticas** de eventos próximos
- **Integración con proyectos**

### 💰 Facturación Profesional
- **Creación de facturas** con múltiples items
- **Cálculo automático** de subtotales, IVA y totales
- **Estados de factura**: Borrador, Enviada, Pagada, Vencida
- **Vista previa profesional** lista para imprimir
- **Gestión de pagos** y seguimiento

### 📸 Gestión de Archivos
- **Sistema de fotos** por proyecto con categorías
- **Gestión de boletas y recibos** con montos
- **Organización automática** en carpetas locales
- **Estructura inteligente**: Cliente/Año/Mes/Proyecto
- **Metadatos completos** y búsqueda

### 👁️ Portal del Cliente
- **Vista personalizada** para cada cliente
- **Configuración granular** de permisos
- **Acceso controlado** a información del proyecto
- **Galería de fotos** del progreso
- **Estado de pagos** y documentos
- **Enlaces seguros** con expiración

### 📊 Dashboard Ejecutivo
- **Métricas en tiempo real** de todos los proyectos
- **Gráficos de distribución** por estado
- **Indicadores financieros** completos
- **Acciones rápidas** para tareas comunes
- **Resumen de actividad** reciente

### 🔒 Sistema de Logs
- **Registro completo** de actividades
- **Categorización** por tipo de evento
- **Niveles de severidad**: Info, Éxito, Advertencia, Error
- **Filtros avanzados** y búsqueda
- **Exportación** de logs para auditoría

## 🚀 Tecnologías Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **Lucide React** - Iconografía
- **Vite** - Herramienta de desarrollo
- **LocalStorage** - Persistencia de datos
- **File System Access API** - Gestión de archivos locales

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🔧 Configuración Inicial

### Credenciales por Defecto
- **Usuario**: `victormonaresespinoza`
- **Contraseña**: `josesarajessica2025$$`

### Estructura de Carpetas Locales
```
ArchiManager_Files/
├── Cliente_Nombre/
│   └── 2024/
│       └── 01_Proyecto_Nombre/
│           ├── Fotos_Proyecto/
│           │   ├── 2024-01-15_progress_cimientos.jpg
│           │   └── 2024-01-20_detail_estructura.jpg
│           └── Boletas_Recibos/
│               ├── 2024-01-15_service_consultoria.pdf
│               └── 2024-01-18_material_cemento.jpg
```

## 📱 Funcionalidades por Sección

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Gráficos de distribución
- ✅ Métricas financieras
- ✅ Acciones rápidas
- ✅ Filtros temporales

### Proyectos
- ✅ Vista Grid y Lista
- ✅ Filtros avanzados
- ✅ Búsqueda inteligente
- ✅ Ordenamiento múltiple
- ✅ Gestión de tareas
- ✅ Seguimiento de pagos
- ✅ Programación de visitas

### Clientes
- ✅ CRUD completo
- ✅ Estadísticas por cliente
- ✅ Historial de proyectos
- ✅ Información financiera
- ✅ Exportación de datos

### Calendario
- ✅ Múltiples vistas
- ✅ Gestión de eventos
- ✅ Filtros por tipo
- ✅ Notificaciones
- ✅ Integración con proyectos

### Facturación
- ✅ Creación de facturas
- ✅ Gestión de items
- ✅ Cálculos automáticos
- ✅ Vista previa profesional
- ✅ Control de estados

### Portal del Cliente
- ✅ Acceso personalizado
- ✅ Configuración de permisos
- ✅ Vista de progreso
- ✅ Galería de fotos
- ✅ Documentos y pagos

## 🔐 Seguridad y Privacidad

- **Autenticación local** con credenciales encriptadas
- **Control de acceso** granular para clientes
- **Logs de auditoría** completos
- **Datos locales** sin dependencias externas
- **Enlaces seguros** con expiración

## 📊 Exportación y Respaldos

### Formatos Soportados
- **Excel (.xlsx)** - Clientes y proyectos
- **PDF** - Reportes y facturas
- **JSON** - Respaldos completos

### Tipos de Respaldo
- **Completo** - Todos los datos del sistema
- **Por módulo** - Clientes, proyectos, etc.
- **Automático** - Configuración opcional

## 🎨 Personalización

### Temas
- **Modo Claro** - Interfaz luminosa
- **Modo Oscuro** - Interfaz oscura (en desarrollo)

### Configuraciones
- **Notificaciones** - Granulares por tipo
- **Privacidad** - Controles detallados
- **Exportación** - Múltiples formatos

## 🔄 Flujo de Trabajo Típico

1. **Crear Cliente** → Registrar información básica
2. **Crear Proyecto** → Asociar con cliente y configurar carpeta local
3. **Gestionar Tareas** → Definir y seguir progreso
4. **Subir Fotos** → Documentar progreso visual
5. **Registrar Gastos** → Boletas y recibos organizados
6. **Generar Facturas** → Sistema profesional de facturación
7. **Portal Cliente** → Acceso controlado para el cliente
8. **Seguimiento** → Dashboard y reportes en tiempo real

## 🛠️ Desarrollo y Contribución

### Scripts Disponibles
```bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run preview      # Vista previa
npm run lint         # Linting
```

### Estructura del Proyecto
```
src/
├── components/      # Componentes React
├── hooks/          # Hooks personalizados
├── types/          # Definiciones TypeScript
├── utils/          # Utilidades y helpers
└── data/           # Datos mock y configuración
```

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: [email de soporte]
- **Documentación**: Este README
- **Logs**: Sistema interno de registro

## 📄 Licencia

Este proyecto está bajo licencia [tipo de licencia].

---

**ArchiManager Pro** - Sistema profesional para la gestión integral de estudios de arquitectura.

*Desarrollado con ❤️ para arquitectos profesionales*