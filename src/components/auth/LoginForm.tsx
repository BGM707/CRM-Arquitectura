import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Building2, Compass, Ruler } from 'lucide-react';
import { Button } from '../common/Button';
import { FormField, Input } from '../common/FormField';

interface LoginFormProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = onLogin(formData.username, formData.password);
      if (!success) {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rotate-45"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-white rotate-12"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 border border-white -rotate-12"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-white rotate-45"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Building2 className="absolute top-1/4 left-1/4 w-8 h-8 text-white opacity-20 animate-pulse" />
        <Compass className="absolute top-1/3 right-1/4 w-6 h-6 text-white opacity-20 animate-pulse delay-1000" />
        <Ruler className="absolute bottom-1/3 left-1/3 w-7 h-7 text-white opacity-20 animate-pulse delay-500" />
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            ArchiManager
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Gestión Profesional para Arquitectos</p>
          <div className="flex items-center justify-center space-x-2 mt-3 text-sm text-gray-500">
            <Compass className="h-4 w-4" />
            <span>Proyectos • Clientes • Calendario</span>
            <Ruler className="h-4 w-4" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Usuario" error={error && !formData.username ? 'El usuario es requerido' : ''}>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ingresa tu usuario"
                className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200"
                required
              />
            </div>
          </FormField>

          <FormField label="Contraseña" error={error && !formData.password ? 'La contraseña es requerida' : ''}>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
                className="pl-12 pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </FormField>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 animate-shake">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            loading={loading}
            disabled={!formData.username || !formData.password}
          >
            {loading ? 'Iniciando Sesión...' : 'Acceder al Sistema'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>ArchiManager Pro</strong><br />
              Sistema integral de gestión para estudios de arquitectura<br />
              Proyectos • Clientes • Calendario • Pagos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}