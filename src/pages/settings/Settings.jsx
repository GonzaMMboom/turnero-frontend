import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../features/auth/auth.context';

const DAYS = [
  { key: 1, label: 'Lunes' },
  { key: 2, label: 'Martes' },
  { key: 3, label: 'Miércoles' },
  { key: 4, label: 'Jueves' },
  { key: 5, label: 'Viernes' },
  { key: 6, label: 'Sábado' },
  { key: 0, label: 'Domingo' },
];

const INITIAL_HOURS = {
  1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: []
};

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-indigo-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { onboardingCompleted, completeOnboarding, updateBusinessName } = useContext(AuthContext);

  // Business Data
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Work Hours
  const [hours, setHours] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] });
  const [deletedIds, setDeletedIds] = useState([]);
  const [deletedServiceIds, setDeletedServiceIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Duration
  const [duration, setDuration] = useState('30');

  // Booking Prefs
  const [allowCancellation, setAllowCancellation] = useState(true);
  const [leadTime, setLeadTime] = useState('24');
  const [buffer, setBuffer] = useState('15');

  // Services (empty list)
  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Parallel
        const [hoursRes, profileRes, servicesRes] = await Promise.all([
          api.get('/business-hours'),
          api.get('/auth/me'),
          api.get('/services')
        ]);
        
        // 1. Hours
        const newHours = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] };
        hoursRes.data.forEach(h => {
          if (newHours[h.day_of_week]) {
            newHours[h.day_of_week].push({
              id: h.id,
              from: h.start_time,
              to: h.end_time,
              active: h.is_active
            });
          }
        });
        setHours(newHours);

        // 2. Profile
        if (profileRes.data) {
          setBusinessName(profileRes.data.business_name || '');
          setDuration(profileRes.data.default_duration_minutes?.toString() || '30');
          setBuffer(profileRes.data.buffer_minutes?.toString() || '0');
          setLeadTime(profileRes.data.lead_time_hours?.toString() || '24');
          setAllowCancellation(profileRes.data.allow_client_cancellation ?? false);
        }

        // 3. Services
        if (servicesRes.data) {
          const mappedServices = servicesRes.data.map(s => ({
            id: s.id,
            name: s.name,
            duration: s.duration_minutes.toString(),
            price: s.price
          }));
          setServices(mappedServices);
        }

      } catch (error) {
        console.error("Error fetching initial settings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddSlot = (dayKey) => {
    setHours(h => ({
      ...h,
      [dayKey]: [...h[dayKey], { from: '09:00', to: '18:00', active: true }]
    }));
  };

  const handleRemoveSlot = (dayKey, index) => {
    const slot = hours[dayKey][index];
    if (slot.id) {
      setDeletedIds(prev => [...prev, slot.id]);
    }
    setHours(h => ({
      ...h,
      [dayKey]: h[dayKey].filter((_, i) => i !== index)
    }));
  };

  const handleHourChange = (dayKey, index, field, val) => {
    setHours(h => ({
      ...h,
      [dayKey]: h[dayKey].map((slot, i) => i === index ? { ...slot, [field]: val } : slot)
    }));
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setServices(s => [
      ...s,
      { id: Date.now(), name: newServiceName, duration: newServiceDuration, price: newServicePrice },
    ]);
    setNewServiceName('');
    setNewServiceDuration('30');
    setNewServicePrice('');
    setShowServiceModal(false);
  };

  const handleDeleteService = (id) => {
    // If it's a numeric ID (from backend), track for deletion
    if (typeof id === 'number') {
      setDeletedServiceIds(prev => [...prev, id]);
    }
    setServices(s => s.filter(srv => srv.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const requests = [];

      // 1. Profile / Settings update
      requests.push(api.put('/auth/me', {
        businessName,
        defaultDurationMinutes: parseInt(duration, 10),
        bufferMinutes: parseInt(buffer, 10),
        leadTimeHours: parseInt(leadTime, 10),
        allowClientCancellation: allowCancellation
      }));

      // 2. Business Hours Deletions
      if (deletedIds.length > 0) {
        deletedIds.forEach(id => requests.push(api.delete(`/business-hours/${id}`)));
      }

      // 3. Business Hours Creates/Updates
      Object.entries(hours).forEach(([dayKey, slots]) => {
        slots.forEach(slot => {
          const payload = {
            day_of_week: parseInt(dayKey, 10),
            start_time: slot.from,
            end_time: slot.to,
            is_active: true
          };

          if (slot.id) {
            requests.push(api.put(`/business-hours/${slot.id}`, payload));
          } else {
            requests.push(api.post('/business-hours', payload));
          }
        });
      });

      // 4. Services Deletions
      if (deletedServiceIds.length > 0) {
        deletedServiceIds.forEach(id => requests.push(api.delete(`/services/${id}`)));
      }

      // 5. Services Creates/Updates
      services.forEach(srv => {
        const payload = {
          name: srv.name,
          duration_minutes: parseInt(srv.duration, 10),
          price: parseFloat(srv.price) || 0
        };

        // If ID is a number and looks like a DB ID (not a large Date.now() timestamp)
        if (typeof srv.id === 'number' && srv.id < 10000000000) {
          requests.push(api.put(`/services/${srv.id}`, payload));
        } else {
          requests.push(api.post('/services', payload));
        }
      });

      await Promise.all(requests);
      
      // Clear deletion tracking
      setDeletedIds([]);
      setDeletedServiceIds([]);
      
      // Flash success
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Re-fetch everything to ensure IDs are synced
      // This is safer than manually updating state with mixed IDs
      const [hoursRes, profileRes, servicesRes] = await Promise.all([
        api.get('/business-hours'),
        api.get('/auth/me'),
        api.get('/services')
      ]);

      // Update Hours
      const newHours = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] };
      hoursRes.data.forEach(h => {
        if (newHours[h.day_of_week]) {
          newHours[h.day_of_week].push({
            id: h.id,
            from: h.start_time,
            to: h.end_time,
            active: h.is_active
          });
        }
      });
      setHours(newHours);

      // Update Services
      if (servicesRes.data) {
        setServices(servicesRes.data.map(s => ({
          id: s.id,
          name: s.name,
          duration: s.duration_minutes.toString(),
          price: s.price
        })));
      }

      if (profileRes.data) {
        setBusinessName(profileRes.data.business_name || '');
        setDuration(profileRes.data.default_duration_minutes?.toString() || '30');
        updateBusinessName(profileRes.data.business_name || '');
      }

      // 6. Complete onboarding state if necessary
      if (!onboardingCompleted) {
        completeOnboarding();
        navigate('/dashboard');
      }

    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar los cambios: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white border border-[#c7c4d8]/30 rounded-lg text-sm text-[#191c1e] font-body placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all';

  const labelClass =
    'block text-[10px] uppercase tracking-widest text-slate-400 font-bold font-label mb-2';

  return (
    <div className="max-w-4xl mx-auto">
      {!onboardingCompleted && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <span className="material-symbols-outlined">priority_high</span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-amber-900">Acceso restringido</h4>
            <p className="text-sm text-amber-700 font-body mt-1">
              Para habilitar todas las secciones del sistema, primero debes completar la información básica y los horarios de tu negocio.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <header className="mb-12">
        <h2 className="text-[3rem] font-extrabold font-headline text-[#191c1e] tracking-tight leading-none mb-2">
          {onboardingCompleted ? 'Configuración' : 'Configuración Inicial'}
        </h2>
        <p className="text-slate-500 font-body">
          {onboardingCompleted 
            ? 'Gestiona la identidad de tu clínica, horarios de atención y preferencias de reserva para ofrecer una experiencia premium.' 
            : '¡Bienvenida! Por favor, completá los datos básicos de tu negocio y horarios para comenzar a usar el turnero.'}
        </p>
      </header>

      <div className="space-y-8">

        {/* ── 1. DATOS DEL NEGOCIO ── */}
        <section className="bg-white rounded-2xl p-8 shadow-[0px_10px_40px_-10px_rgba(25,28,30,0.06)]">
          <h3 className="font-headline font-bold text-lg text-[#191c1e] mb-1">Datos del Negocio</h3>
          <p className="text-xs text-slate-400 font-body mb-6">Información pública de tu clínica.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Nombre del Negocio</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className={inputClass}
                placeholder="Ej: Aura Aesthetics"
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                value={businessPhone}
                onChange={e => setBusinessPhone(e.target.value)}
                className={inputClass}
                placeholder="+54 9 11 ..."
              />
            </div>
            <div>
              <label className={labelClass}>Dirección (opcional)</label>
              <input
                type="text"
                value={businessAddress}
                onChange={e => setBusinessAddress(e.target.value)}
                className={inputClass}
                placeholder="Calle y número"
              />
            </div>
          </div>
        </section>

        {/* ── 2. HORARIO LABORAL ── */}
        <section className="bg-white rounded-2xl p-8 shadow-[0px_10px_40px_-10px_rgba(25,28,30,0.06)]">
          <h3 className="font-headline font-bold text-lg text-[#191c1e] mb-1">Horario Laboral</h3>
          <p className="text-xs text-slate-400 font-body mb-6">Definí los días y horarios en que abrís tu clínica. Podés agregar varios turnos por día.</p>
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
               <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
               <p className="text-xs font-label uppercase tracking-widest">Cargando horarios...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${hours[key].length > 0 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                      <span className={`text-sm font-bold font-headline ${hours[key].length > 0 ? 'text-[#191c1e]' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddSlot(key)}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Añadir Rango
                    </button>
                  </div>

                  {hours[key].length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-body italic ml-5">Cerrado</p>
                  ) : (
                    <div className="space-y-3 ml-5">
                      {hours[key].map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 animate-fade-in"
                        >
                          <div className="flex items-center gap-3 flex-grow max-w-sm">
                            <input
                              type="time"
                              value={slot.from}
                              onChange={e => handleHourChange(key, index, 'from', e.target.value)}
                              className="px-3 py-2 bg-white border border-[#c7c4d8]/30 rounded-lg text-sm font-body focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-slate-400 text-sm">hasta</span>
                            <input
                              type="time"
                              value={slot.to}
                              onChange={e => handleHourChange(key, index, 'to', e.target.value)}
                              className="px-3 py-2 bg-white border border-[#c7c4d8]/30 rounded-lg text-sm font-body focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          
                          <button
                            onClick={() => handleRemoveSlot(key, index)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar rango"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 3. DURACIÓN ESTÁNDAR ── */}
        <section className="bg-white rounded-2xl p-8 shadow-[0px_10px_40px_-10px_rgba(25,28,30,0.06)]">
          <h3 className="font-headline font-bold text-lg text-[#191c1e] mb-1">Duración Estándar</h3>
          <p className="text-xs text-slate-400 font-body mb-6">Tiempo promedio por tratamiento.</p>
          <div className="flex flex-wrap gap-3">
            {['15', '30', '45', '60', '90'].map(min => (
              <button
                key={min}
                onClick={() => setDuration(min)}
                className={`px-6 py-3 rounded-xl text-sm font-bold font-headline transition-all ${
                  duration === min
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </section>

        {/* ── 4. PREFERENCIAS DE RESERVA ── */}
        <section className="bg-white rounded-2xl p-8 shadow-[0px_10px_40px_-10px_rgba(25,28,30,0.06)]">
          <h3 className="font-headline font-bold text-lg text-[#191c1e] mb-1">Preferencias de Reserva</h3>
          <p className="text-xs text-slate-400 font-body mb-6">Controlá cómo se agenda en tu clínica.</p>
          <div className="space-y-6">
            {/* Tiempo entre citas */}
            <div>
              <label className={labelClass}>Tiempo entre citas</label>
              <select
                value={buffer}
                onChange={e => setBuffer(e.target.value)}
                className={inputClass}
              >
                <option value="0">Sin tiempo extra</option>
                <option value="5">5 minutos</option>
                <option value="10">10 minutos</option>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── 5. SERVICIOS DISPONIBLES ── */}
        <section className="bg-white rounded-2xl p-8 shadow-[0px_10px_40px_-10px_rgba(25,28,30,0.06)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-bold text-lg text-[#191c1e] mb-1">Servicios Disponibles</h3>
              <p className="text-xs text-slate-400 font-body">Los tratamientos que ofrece tu clínica.</p>
            </div>
            <button
              onClick={() => setShowServiceModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold font-headline hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Agregar Servicio
            </button>
          </div>

          {services.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-indigo-400 text-3xl">spa</span>
              </div>
              <h4 className="font-headline font-bold text-[#191c1e] mb-1">No hay servicios registrados</h4>
              <p className="text-sm text-slate-400 font-body max-w-xs">
                Comienza agregando los tratamientos que ofreces a tus clientes para habilitar la agenda online.
              </p>
              <button
                onClick={() => setShowServiceModal(true)}
                className="mt-6 text-indigo-600 text-sm font-bold font-headline hover:underline"
              >
                + Agregar primer servicio
              </button>
            </div>
          ) : (
            /* Services Table */
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold font-label">Servicio</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold font-label">Duración</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold font-label">Precio</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {services.map(srv => (
                    <tr key={srv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-[#191c1e] font-body">{srv.name}</td>
                      <td className="px-5 py-4 text-slate-500 font-body">{srv.duration} min</td>
                      <td className="px-5 py-4 text-slate-500 font-body">{srv.price ? `$${srv.price}` : '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="text-xs text-slate-400 hover:text-red-500 font-bold uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── GUARDAR ── */}
        <div className="flex items-center justify-end gap-4 pb-12">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold font-body animate-fade-in">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Cambios guardados correctamente
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-xl font-headline font-bold shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-600 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">save</span>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── MODAL: AGREGAR SERVICIO ── */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowServiceModal(false)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-[0px_20px_60px_-10px_rgba(25,28,30,0.18)]">
            <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-1">Nuevo Servicio</h3>
            <p className="text-xs text-slate-400 font-body mb-6">Completá los datos del tratamiento.</p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nombre del Servicio</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  className={inputClass}
                  placeholder="Ej: Limpieza Facial Profunda"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Duración (min)</label>
                  <select
                    value={newServiceDuration}
                    onChange={e => setNewServiceDuration(e.target.value)}
                    className={inputClass}
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Precio (opcional)</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={e => setNewServicePrice(e.target.value)}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowServiceModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold font-headline text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddService}
                className="flex-1 py-3 rounded-xl text-sm font-bold font-headline text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/15"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
