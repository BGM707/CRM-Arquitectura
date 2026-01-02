import { ProjectPhoto, Receipt, Project, Client } from '../types';

// Utilidades para manejo de archivos locales
export class LocalFileManager {
  private static instance: LocalFileManager;
  private baseFolder: string = 'ArchiManager_Files';

  static getInstance(): LocalFileManager {
    if (!LocalFileManager.instance) {
      LocalFileManager.instance = new LocalFileManager();
    }
    return LocalFileManager.instance;
  }

  // Crear estructura de carpetas organizada
  generateFolderStructure(client: Client, project?: Project): string {
    const clientName = this.sanitizeFileName(client.name);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    if (project) {
      const projectName = this.sanitizeFileName(project.name);
      return `${this.baseFolder}/${clientName}/${year}/${month}_${projectName}`;
    }
    
    return `${this.baseFolder}/${clientName}/${year}/${month}`;
  }

  // Limpiar nombres de archivo
  private sanitizeFileName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  // Generar nombre único para archivo
  generateUniqueFileName(originalName: string, category: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const sanitizedName = this.sanitizeFileName(baseName);
    
    return `${timestamp}_${category}_${sanitizedName}.${extension}`;
  }

  // Simular guardado de archivo (en un entorno real usaría File System Access API)
  async saveFile(file: File, folderPath: string, fileName: string): Promise<string> {
    try {
      // En un entorno real, aquí se guardaría el archivo físicamente
      const fullPath = `${folderPath}/${fileName}`;
      
      // Simular el guardado
      console.log(`Archivo guardado en: ${fullPath}`);
      
      // En un entorno real, retornaría la ruta real del archivo
      return fullPath;
    } catch (error) {
      throw new Error(`Error al guardar archivo: ${error}`);
    }
  }

  // Crear estructura de carpetas para fotos de proyecto
  createProjectPhotoStructure(client: Client, project: Project): string {
    const basePath = this.generateFolderStructure(client, project);
    return `${basePath}/Fotos_Proyecto`;
  }

  // Crear estructura de carpetas para boletas
  createReceiptStructure(client: Client): string {
    const basePath = this.generateFolderStructure(client);
    return `${basePath}/Boletas_Recibos`;
  }

  // Obtener información del archivo
  getFileInfo(file: File): { size: number; type: string; lastModified: number } {
    return {
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
  }

  // Validar tipo de archivo para fotos
  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  }

  // Validar tipo de archivo para documentos
  isValidDocumentFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    return validTypes.includes(file.type);
  }

  // Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileManager = LocalFileManager.getInstance();