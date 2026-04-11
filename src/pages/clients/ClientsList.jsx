import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/shared/Modal';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Modal State (New/Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    phone: '',
    email: ''
  });
  const [formError, setFormError] = useState('');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      setError('Error al cargar la lista de clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingClient(null);
    setFormData({ name: '', dni: '', phone: '', email: '' });
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (client) => {
    setIsEditMode(true);
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      dni: client.dni || '',
      phone: client.phone || '',
      email: client.email || ''
    });
    setFormError('');
    setShowFormModal(true);
  };

  const handleSaveClient = async () => {
    if (!formData.dni.trim() || !formData.name.trim() || !formData.phone.trim()) {
      setFormError('DNI, Nombre y Teléfono son obligatorios');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');
      
      if (isEditMode && editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }

      setShowFormModal(false);
      fetchClients(); // Refresh list
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error de conexión con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteModal = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      setIsDeleting(true);
      await api.delete(`/clients/${clientToDelete.id}`);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      setShowDeleteModal(false);
    } catch (err) {
      alert('Error al eliminar el cliente');
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.dni && client.dni.includes(searchTerm)) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-indigo-950 tracking-tight">Clientes</h2>
          <p className="text-slate-500 mt-2 font-body text-lg">Gestioná la base de datos de tus pacientes y su historial.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">search</span>
            <input 
              type="text"
              placeholder="Buscar por nombre, DNI o tel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-sm flex items-center gap-5 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined text-3xl">group</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Clientes</p>
            <p className="text-3xl font-headline font-black text-indigo-950">{clients.length}</p>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-label uppercase tracking-widest text-xs font-bold">Cargando base de datos...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-red-400 text-5xl mb-4">error</span>
            <p className="text-slate-600 font-body">{error}</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-slate-200 text-7xl mb-6">person_search</span>
            <p className="text-slate-400 font-body text-lg">No se encontraron clientes que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Cliente</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Identificación (DNI)</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Contacto</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-100">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-indigo-950 text-lg mb-0.5">{client.name}</p>
                          <p className="text-slate-400 text-xs">Registrado el {new Date(client.created_at).toLocaleDateString('es-AR')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-mono font-bold">
                        {client.dni || '---'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-600 group/item">
                          <span className="material-symbols-outlined text-lg text-slate-300 group-hover/item:text-indigo-500 transition-colors">call</span>
                          <span className="text-sm font-medium">{client.phone || 'Sin teléfono'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 group/item">
                          <span className="material-symbols-outlined text-lg text-slate-300 group-hover/item:text-indigo-500 transition-colors">mail</span>
                          <span className="text-sm font-medium">{client.email || 'Sin email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditModal(client)}
                          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteModal(client)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        show={showFormModal}
        title={isEditMode ? "Editar Cliente" : "Registar Nuevo Cliente"}
        confirmText={isSaving ? "Guardando..." : (isEditMode ? "Guardar Cambios" : "Crear Cliente")}
        cancelText="Cancelar"
        onConfirm={handleSaveClient}
        onCancel={() => {
          setShowFormModal(false);
          setFormError('');
        }}
        type="warning"
        hideIcon={true}
      >
        <div className="space-y-4 mt-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold animate-pulse">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 ml-1">Identificación (DNI) *</label>
            <input 
              type="text"
              placeholder="Sin puntos ni espacios"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-slate-700"
              value={formData.dni}
              onChange={(e) => setFormData({...formData, dni: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 ml-1">Nombre Completo *</label>
            <input 
              type="text"
              placeholder="Ej: Lucía Fernández"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-slate-700"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 ml-1">Teléfono *</label>
            <input 
              type="tel"
              placeholder="+54 9 11 ..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-slate-700"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 ml-1">Correo Electrónico</label>
            <input 
              type="email"
              placeholder="email@ejemplo.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-slate-700"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        title="Eliminar Cliente"
        confirmText={isDeleting ? "Eliminando..." : "Eliminar Permanentemente"}
        cancelText="Conservar Cliente"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        type="error"
      >
        <div className="mt-2">
          <p className="text-slate-500">
            ¿Estás seguro de que deseas eliminar a <span className="font-bold text-slate-900">{clientToDelete?.name}</span>?
          </p>
          <p className="mt-2 text-xs text-red-400 font-medium">
            Esta acción no se puede deshacer y se perderá su historial de turnos asociados.
          </p>
        </div>
      </Modal>
    </div>
  );
}
