import React, { useState, useRef } from 'react';
import { Receipt as ReceiptIcon, Upload, Eye, Trash2, FolderOpen, FileText } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { FormField, Input, Textarea, Select } from '../common/FormField';
import { Receipt, Project, Client } from '../../types';
import { fileManager } from '../../utils/fileManager';

interface ReceiptManagerProps {
  project: Project;
  client: Client;
  receipts: Receipt[];
  onReceiptsUpdate: (receipts: Receipt[]) => void;
}

export function ReceiptManager({ project, client, receipts, onReceiptsUpdate }: ReceiptManagerProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    description: '',
    amount: '',
    category: 'service' as Receipt['category'],
  });

  const categoryOptions = [
    { value: 'service', label: 'Servicios Profesionales' },
    { value: 'material', label: 'Materiales' },
    { value: 'other', label: 'Otros Gastos' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'service': return 'info';
      case 'material': return 'warning';
      default: return 'default';
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!uploadForm.description.trim() || !uploadForm.amount) {
      alert('Por favor completa la descripción y el monto');
      return;
    }

    setUploading(true);
    try {
      const newReceipts: Receipt[] = [];

      for (const file of Array.from(files)) {
        if (!fileManager.isValidDocumentFile(file)) {
          alert(`${file.name} no es un tipo de archivo válido`);
          continue;
        }

        const folderPath = fileManager.createReceiptStructure(client);
        const fileName = fileManager.generateUniqueFileName(file.name, uploadForm.category);
        const localPath = await fileManager.saveFile(file, folderPath, fileName);

        const newReceipt: Receipt = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          clientId: client.id,
          projectId: project.id,
          filename: fileName,
          originalName: file.name,
          localPath,
          uploadDate: new Date().toISOString(),
          amount: Number(uploadForm.amount),
          description: uploadForm.description,
          category: uploadForm.category,
        };

        newReceipts.push(newReceipt);
      }

      const updatedReceipts = [...receipts, ...newReceipts];
      onReceiptsUpdate(updatedReceipts);

      // Guardar en localStorage
      localStorage.setItem(`project_receipts_${project.id}`, JSON.stringify(updatedReceipts));

      setShowUploadModal(false);
      setUploadForm({ description: '', amount: '', category: 'service' });
    } catch (error) {
      alert('Error al subir las boletas');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteReceipt = (receiptId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta boleta?')) {
      const updatedReceipts = receipts.filter(receipt => receipt.id !== receiptId);
      onReceiptsUpdate(updatedReceipts);
      localStorage.setItem(`project_receipts_${project.id}`, JSON.stringify(updatedReceipts));
    }
  };

  const handleOpenFolder = () => {
    const folderPath = fileManager.createReceiptStructure(client);
    alert(`Carpeta de boletas: ${folderPath}`);
  };

  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const groupedReceipts = receipts.reduce((acc, receipt) => {
    if (!acc[receipt.category]) {
      acc[receipt.category] = [];
    }
    acc[receipt.category].push(receipt);
    return acc;
  }, {} as Record<string, Receipt[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Boletas y Recibos ({receipts.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: ${totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleOpenFolder}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Abrir Carpeta
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <ReceiptIcon className="h-4 w-4 mr-2" />
            Subir Boleta
          </Button>
        </div>
      </div>

      {receipts.length === 0 ? (
        <Card className="text-center py-12">
          <ReceiptIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay boletas registradas aún
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            Subir Primera Boleta
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedReceipts).map(([category, categoryReceipts]) => (
            <Card key={category}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {categoryOptions.find(opt => opt.value === category)?.label || category}
                </h4>
                <div className="flex items-center space-x-2">
                  <Badge variant={getCategoryColor(category)}>
                    {categoryReceipts.length} boletas
                  </Badge>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ${categoryReceipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {categoryReceipts.map((receipt) => (
                  <div key={receipt.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {receipt.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {receipt.originalName}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(receipt.uploadDate).toLocaleDateString()}
                          </span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            ${receipt.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => {
                          setSelectedReceipt(receipt);
                          setShowReceiptModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDeleteReceipt(receipt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        title="Subir Boleta o Recibo"
        size="medium"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Monto" required>
              <Input
                type="number"
                value={uploadForm.amount}
                onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                placeholder="50000"
                min="0"
              />
            </FormField>

            <FormField label="Categoría">
              <Select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as Receipt['category'] })}
                options={categoryOptions}
              />
            </FormField>
          </div>

          <FormField label="Descripción" required>
            <Textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Descripción del gasto o servicio..."
              rows={3}
            />
          </FormField>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <ReceiptIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Selecciona las boletas o recibos (PDF, JPG, PNG)
            </p>
            <Button onClick={handleFileSelect} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Subiendo...' : 'Seleccionar Archivos'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receipt Detail Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Detalle de Boleta"
        size="large"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Descripción:</span>
                <p className="text-gray-600 dark:text-gray-400">{selectedReceipt.description}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Monto:</span>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${selectedReceipt.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Categoría:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {categoryOptions.find(opt => opt.value === selectedReceipt.category)?.label}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Fecha:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedReceipt.uploadDate).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Archivo:</span>
                <p className="text-gray-600 dark:text-gray-400">{selectedReceipt.originalName}</p>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Ubicación:</span>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-mono mt-1">
                {selectedReceipt.localPath}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}