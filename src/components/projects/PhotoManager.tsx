import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Eye, Download, Trash2, FolderOpen } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { FormField, Input, Textarea, Select } from '../common/FormField';
import { ProjectPhoto, Project, Client } from '../../types';
import { fileManager } from '../../utils/fileManager';

interface PhotoManagerProps {
  project: Project;
  client: Client;
  photos: ProjectPhoto[];
  onPhotosUpdate: (photos: ProjectPhoto[]) => void;
}

export function PhotoManager({ project, client, photos, onPhotosUpdate }: PhotoManagerProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    description: '',
    category: 'progress' as ProjectPhoto['category'],
  });

  const categoryOptions = [
    { value: 'progress', label: 'Progreso de Obra' },
    { value: 'before', label: 'Estado Inicial' },
    { value: 'after', label: 'Estado Final' },
    { value: 'detail', label: 'Detalle Técnico' },
    { value: 'other', label: 'Otros' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'progress': return 'info';
      case 'before': return 'warning';
      case 'after': return 'success';
      case 'detail': return 'default';
      default: return 'default';
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newPhotos: ProjectPhoto[] = [];

      for (const file of Array.from(files)) {
        if (!fileManager.isValidImageFile(file)) {
          alert(`${file.name} no es un tipo de imagen válido`);
          continue;
        }

        const folderPath = fileManager.createProjectPhotoStructure(client, project);
        const fileName = fileManager.generateUniqueFileName(file.name, uploadForm.category);
        const localPath = await fileManager.saveFile(file, folderPath, fileName);
        const fileInfo = fileManager.getFileInfo(file);

        const newPhoto: ProjectPhoto = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          projectId: project.id,
          filename: fileName,
          originalName: file.name,
          localPath,
          uploadDate: new Date().toISOString(),
          description: uploadForm.description,
          category: uploadForm.category,
          size: fileInfo.size,
        };

        newPhotos.push(newPhoto);
      }

      const updatedPhotos = [...photos, ...newPhotos];
      onPhotosUpdate(updatedPhotos);

      // Guardar en localStorage
      localStorage.setItem(`project_photos_${project.id}`, JSON.stringify(updatedPhotos));

      setShowUploadModal(false);
      setUploadForm({ description: '', category: 'progress' });
    } catch (error) {
      alert('Error al subir las fotos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      onPhotosUpdate(updatedPhotos);
      localStorage.setItem(`project_photos_${project.id}`, JSON.stringify(updatedPhotos));
    }
  };

  const handleOpenFolder = () => {
    const folderPath = fileManager.createProjectPhotoStructure(client, project);
    alert(`Carpeta de fotos: ${folderPath}`);
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.category]) {
      acc[photo.category] = [];
    }
    acc[photo.category].push(photo);
    return acc;
  }, {} as Record<string, ProjectPhoto[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Fotos del Proyecto ({photos.length})
        </h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleOpenFolder}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Abrir Carpeta
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Camera className="h-4 w-4 mr-2" />
            Subir Fotos
          </Button>
        </div>
      </div>

      {photos.length === 0 ? (
        <Card className="text-center py-12">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay fotos del proyecto aún
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            Subir Primera Foto
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPhotos).map(([category, categoryPhotos]) => (
            <Card key={category}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {categoryOptions.find(opt => opt.value === category)?.label || category}
                </h4>
                <Badge variant={getCategoryColor(category)}>
                  {categoryPhotos.length} fotos
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200">
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setShowPhotoModal(true);
                          }}
                          className="text-white hover:bg-white hover:bg-opacity-20"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-white hover:bg-red-500 hover:bg-opacity-20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {photo.originalName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {fileManager.formatFileSize(photo.size)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(photo.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Subir Fotos del Proyecto"
        size="medium"
      >
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Selecciona las fotos del proyecto
            </p>
            <Button onClick={handleFileSelect} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Subiendo...' : 'Seleccionar Fotos'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Categoría">
              <Select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as ProjectPhoto['category'] })}
                options={categoryOptions}
              />
            </FormField>
          </div>

          <FormField label="Descripción (opcional)">
            <Textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Descripción de las fotos..."
              rows={3}
            />
          </FormField>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Detail Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="Detalle de Foto"
        size="large"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Camera className="h-16 w-16 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Nombre:</span>
                <p className="text-gray-600 dark:text-gray-400">{selectedPhoto.originalName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Categoría:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {categoryOptions.find(opt => opt.value === selectedPhoto.category)?.label}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Tamaño:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {fileManager.formatFileSize(selectedPhoto.size)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Fecha:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedPhoto.uploadDate).toLocaleString()}
                </p>
              </div>
            </div>
            
            {selectedPhoto.description && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Descripción:</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedPhoto.description}</p>
              </div>
            )}
            
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Ubicación:</span>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-mono mt-1">
                {selectedPhoto.localPath}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}