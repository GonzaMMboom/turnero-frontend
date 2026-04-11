import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fecha del entorno
  const today = new Date();
  const options = { day: 'numeric', month: 'long' };
  const strDate = new Intl.DateTimeFormat('es-ES', options).format(today);
  
  // Convertimos a string de formato YYYY-MM-DD para la API local
  const apiDateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/appointments/date?date=${apiDateStr}`);
      setAppointments(res.data);
    } catch (error) {
      console.error("Error al traer los turnos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
    // eslint-disable-next-line
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar permanentemente este turno?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      // Refrescar al cancelar para que salte a los KPIs y la pastilla roja
      fetchTodayAppointments();
    } catch (err) {
      alert("No se pudo cancelar el turno. Intenta denuevo.");
    }
  };

  // Helper to determine effective status
  const getEffectiveStatus = (appt) => {
    if (appt.status !== 'scheduled') return appt.status;
    // Asumimos que si ya pasó la hora de inicio, está completado
    const isPast = new Date(appt.datetime) < new Date();
    return isPast ? 'completed' : 'scheduled';
  };

  // Metrics using effective status
  const activeAppointmentsCount = appointments.filter(a => getEffectiveStatus(a) === 'scheduled').length;
  const completedCount = appointments.filter(a => getEffectiveStatus(a) === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <>
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h2 className="text-[3.5rem] font-extrabold font-headline text-on-surface tracking-tight leading-none mb-2 capitalize">
            Hoy, {strDate}
          </h2>
          <p className="text-secondary font-medium tracking-wide">
            {loading ? 'Sincronizando...' : `Tenés ${activeAppointmentsCount} turnos activos para el día de hoy`}
          </p>
        </div>
        <a 
          href="/turnos/nuevo" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold font-headline shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Nuevo Turno
        </a>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow">
          <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-4">Turnos activos</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold font-headline text-primary">{activeAppointmentsCount}</span>
            <span className="material-symbols-outlined text-primary/20 text-4xl">event_available</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow">
          <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-4">Completados</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold font-headline text-on-surface">{completedCount}</span>
            <span className="material-symbols-outlined text-on-surface/10 text-4xl">check_circle</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow">
          <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-4">Cancelados</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold font-headline text-error">{cancelledCount}</span>
            <span className="material-symbols-outlined text-error/20 text-4xl">cancel</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow">
          <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-4">Clientes atendidos</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold font-headline text-on-surface">{completedCount + activeAppointmentsCount}</span>
            <span className="material-symbols-outlined text-on-surface/10 text-4xl">diversity_3</span>
          </div>
        </div>
      </section>

      {/* Daily Agenda Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold font-headline tracking-tight">Agenda del día</h3>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                 <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                 <div className="h-4 bg-slate-200 w-48 rounded"></div>
              </div>
            </div>
          )}

          {!loading && appointments.length === 0 && (
            <div className="bg-surface-container border border-dashed border-outline-variant/30 p-8 rounded-xl text-center text-secondary font-medium">
              No hay turnos registrados para el día de hoy.
            </div>
          )}

          {!loading && appointments.map(appt => {
             const timeStr = new Date(appt.datetime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
             const status = getEffectiveStatus(appt);
             const isCancelled = status === 'cancelled';
             const isCompleted = status === 'completed';

             if (isCancelled) {
               return (
                <div key={appt.id} className="bg-surface-dim/30 p-6 rounded-xl flex items-center justify-between border-l-4 border-error/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 w-full">
                    <div className="sm:w-20"><span className="text-lg font-bold font-headline text-slate-400 line-through">{timeStr}</span></div>
                    <div className="flex items-center gap-4 sm:w-64">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
                        {appt.client?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-400 line-through truncate">{appt.client?.name}</h4>
                        <p className="text-xs text-slate-400">ID: #{appt.client?.id}</p>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <span className="text-sm font-medium text-slate-400 line-through">
                        {appt.service ? appt.service.name : 'Sin tratamiento asignado'}
                      </span>
                    </div>
                    <div className="sm:w-40 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      <span className="text-xs font-bold text-error uppercase tracking-wider">Cancelado</span>
                    </div>
                  </div>
                </div>
               );
             }

             if (isCompleted) {
              return (
               <div key={appt.id} className="bg-surface-container p-6 rounded-xl flex items-center justify-between border-l-4 border-emerald-500/50 opacity-80">
                 <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 w-full">
                   <div className="sm:w-20"><span className="text-lg font-bold font-headline text-slate-500">{timeStr}</span></div>
                   <div className="flex items-center gap-4 sm:w-64">
                     <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                       {appt.client?.name?.charAt(0).toUpperCase()}
                     </div>
                     <div className="overflow-hidden">
                       <h4 className="font-bold text-slate-600 truncate">{appt.client?.name}</h4>
                       <p className="text-xs text-slate-400">ID: #{appt.client?.id}</p>
                     </div>
                   </div>
                   <div className="flex-grow">
                     <span className="text-sm font-medium text-slate-500 bg-emerald-50 px-3 py-1 rounded-full">
                       {appt.service ? appt.service.name : 'Sin tratamiento asignado'}
                     </span>
                   </div>
                   <div className="sm:w-40 flex items-center gap-2">
                     <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                     <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completado</span>
                   </div>
                 </div>
               </div>
              );
            }

             // Vista de turno Confirmado (Activo)
             return (
              <div key={appt.id} className="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between editorial-shadow hover:scale-[1.01] transition-transform duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 w-full">
                  <div className="sm:w-20"><span className="text-lg font-bold font-headline text-primary">{timeStr}</span></div>
                  <div className="flex items-center gap-4 sm:w-64">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                      {appt.client?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-on-surface truncate">{appt.client?.name}</h4>
                      <p className="text-xs text-secondary">ID: #{appt.client?.id}</p>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <span className="text-sm font-medium text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                      {appt.service ? appt.service.name : 'Sin tratamiento asignado'}
                    </span>
                  </div>
                  <div className="sm:w-40 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Confirmado</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center transition-all ml-4">
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all flex items-center justify-center"
                    title="Cancelar"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>
             );
          })}

        </div>
      </section>

      {/* Aesthetic Bento Addition: Recent Activity / Notes */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white/50 backdrop-blur-md p-8 rounded-3xl editorial-shadow relative overflow-hidden h-64 flex flex-col justify-end">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-[8rem]">spa</span>
          </div>
          <h4 className="text-2xl font-bold font-headline mb-2">Recordatorio del Atelier</h4>
          <p className="text-secondary max-w-md">Recordá solicitar la reposición de insumos para los tratamientos de Peeling antes del viernes.</p>
          <div className="mt-6 flex gap-4">
            <button className="bg-on-surface text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Revisar Stock</button>
          </div>
        </div>

        <div className="bg-indigo-900 p-8 rounded-3xl editorial-shadow text-white flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <h4 className="text-xl font-bold font-headline">Meta Mensual</h4>
            <p className="text-indigo-300 text-sm mt-2">Estás al 82% de tu objetivo de ventas de tratamientos este mes.</p>
          </div>
          <div className="mt-8">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 w-[82%]"></div>
            </div>
            <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">Ver reporte completo</p>
          </div>
        </div>
      </section>
    </>
  );
}
