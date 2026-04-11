import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/shared/Modal';

export default function NewAppointment() {
  const navigate = useNavigate();

  // Fecha del entorno
  const actualDate = new Date();

  // Estados del Formulario
  const [clientDni, setClientDni] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState(''); 
  const [serviceId, setServiceId] = useState(''); 
  
  // Logic to auto-fill client data by DNI
  useEffect(() => {
    const fetchClientByDni = async () => {
      // Solo buscar si tiene al menos 7 caracteres (DNI argentino típico)
      if (clientDni.trim().length >= 7) {
        try {
          const res = await api.get(`/clients/dni/${clientDni}`);
          if (res.data) {
            setClientName(res.data.name || '');
            setClientPhone(res.data.phone || '');
            setClientEmail(res.data.email || '');
          }
        } catch (err) {
          // Si no se encuentra, no hacemos nada (es un cliente nuevo)
          console.log('Cliente no encontrado para este DNI');
        }
      }
    };

    const timer = setTimeout(() => {
      fetchClientByDni();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [clientDni]);

  // Estados Reales del Minicalendario
  const [currentYear, setCurrentYear] = useState(actualDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(actualDate.getMonth());
  
  // Establecer predeterminadamente hoy
  const initDateStr = `${actualDate.getFullYear()}-${(actualDate.getMonth() + 1).toString().padStart(2, '0')}-${actualDate.getDate().toString().padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(initDateStr);
  const [selectedTime, setSelectedTime] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEmailWarning, setShowEmailWarning] = useState(false);

  // Estados de Disponibilidad reales
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [fullyBookedDays, setFullyBookedDays] = useState([]);

  // Turnos ya agendados para ver
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [loadingBooked, setLoadingBooked] = useState(false);

  // Servicios reales
  const [services, setServices] = useState([]);

  // Cargar servicios del usuario al montar
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data);
      } catch (err) {
        console.error('Error cargando servicios:', err);
      }
    };
    fetchServices();
  }, []);

  // Cargar disponibilidad Mensual
  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        const res = await api.get(`/appointments/month?year=${currentYear}&month=${currentMonth + 1}`);
        const counts = {};
        
        res.data.forEach(appt => {
          const d = new Date(appt.datetime);
          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        });
        
        const fullDays = Object.keys(counts).filter(d => counts[d] >= 7);
        setFullyBookedDays(fullDays);
      } catch (err) {
        console.error("Error obteniendo mensual:", err);
      }
    };
    fetchMonthly();
  }, [currentYear, currentMonth]);

  // Cargar slots y turnos ocupados cuando cambia la fecha o el servicio
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDate) return;
      
      setLoadingSlots(true);
      setLoadingBooked(true);
      setSelectedTime('');
      
      try {
        // 1. Cargar Slots Libres
        const params = serviceId ? `?date=${selectedDate}&serviceId=${serviceId}` : `?date=${selectedDate}`;
        const resSlots = await api.get(`/availability${params}`);
        setAvailableSlots(resSlots.data.slots || []);

        // 2. Cargar Turnos ya agendados (ocupados)
        const resBooked = await api.get(`/appointments/date?date=${selectedDate}`);
        // Filtrar cancelados si se desea
        setBookedAppointments(resBooked.data.filter(a => a.status !== 'cancelled'));

      } catch (err) {
        console.error('Error obteniendo datos del día:', err);
        setAvailableSlots([]);
        setBookedAppointments([]);
      } finally {
        setLoadingSlots(false);
        setLoadingBooked(false);
      }
    };
    fetchData();
  }, [selectedDate, serviceId]);

  const handleSubmit = async () => {
    if (!clientDni.trim()) {
      setError("El DNI / Identificación es obligatorio");
      return;
    }
    if (!clientName.trim()) {
      setError("El nombre del cliente es obligatorio");
      return;
    }
    if (!clientPhone.trim()) {
      setError("El teléfono del cliente es obligatorio");
      return;
    }
    if (!selectedTime) {
      setError("Debe elegir un horario disponible");
      return;
    }

    // Tarea 2: Si no ingresa email, advertir
    if (!clientEmail.trim() && !showEmailWarning) {
      setShowEmailWarning(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const datetime = new Date(`${selectedDate}T${selectedTime}:00`);

      const payload = {
        datetime: datetime.toISOString(),
        clientDni: clientDni.trim() || undefined,
        clientName,
        clientPhone,
        clientEmail: clientEmail.trim() || undefined
      };

      if (serviceId) {
        payload.serviceId = parseInt(serviceId, 10);
      }

      await api.post('/appointments/create', payload);
      
      // Tarea 3: Mostrar confirmación de email enviado
      if (clientEmail.trim()) {
        setSuccessMessage('¡Turno agendado! Se ha enviado un correo de confirmación al cliente.');
        // Esperar un momento para que el usuario lea el mensaje antes de redirigir
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Error al agendar turno');
    } finally {
      setLoading(false);
    }
  };

  // ----- Logica Grafica del Calendario -----
  const isPastMonth = () => {
    return currentYear === actualDate.getFullYear() && currentMonth <= actualDate.getMonth();
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (isPastMonth()) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const esARMonthName = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date(currentYear, currentMonth, 1));
  const monthTitle = `${esARMonthName.charAt(0).toUpperCase() + esARMonthName.slice(1)} ${currentYear}`;

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0(Dom) a 6(Sab)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Construir grid (42 cuadros en total por lo general, math ceiling a % 7)
  const totalDaysCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Mes anterior huecos
    for (let i = 0; i < firstDayOfMonth; i++) {
       days.push(
         <div key={`prev-${i}`} className="py-3 text-slate-300">
           {daysInPrevMonth - firstDayOfMonth + i + 1}
         </div>
       );
    }

    // Dias activos
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isSelected = selectedDate === fullDateStr;
      const isFull = fullyBookedDays.includes(fullDateStr);

      // Deshabilitar días en el pasado (que sean antes de "hoy")
      const thisCellDate = new Date(currentYear, currentMonth, day);
      thisCellDate.setHours(23, 59, 59, 999);
      const isPastDay = thisCellDate < actualDate;

      if (isPastDay) {
         days.push(
           <div key={day} className="py-3 text-slate-300 line-through cursor-not-allowed">
             {day}
           </div>
         );
         continue;
      }

      if (isSelected) {
        days.push(
          <div key={day} className="py-3 text-white font-bold relative cursor-pointer shadow-md rounded-full">
            <span className="relative z-10">{day}</span>
            <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-indigo-600"></div>
          </div>
        );
        continue;
      }

      if (isFull) {
        days.push(
           <div key={day} className="py-3 text-red-500 font-bold line-through cursor-not-allowed rounded-lg bg-red-50/50">
             {day}
           </div>
        );
        continue;
      }

      // Default
      days.push(
        <div key={day} onClick={() => { setSelectedDate(fullDateStr); setSelectedTime(''); }} className="py-3 text-gray-700 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors">
          {day}
        </div>
      );
    }

    // Mes proximo huecos
    const remainingCells = totalDaysCells - (firstDayOfMonth + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="py-3 text-slate-300">
          {i}
        </div>
      )
    }

    return days;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/dashboard" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h2 className="text-4xl font-headline font-extrabold text-indigo-950 tracking-tight">Nuevo Turno</h2>
        </div>
        <p className="text-slate-500 mt-1 font-body ml-14">Seleccioná un horario disponible y completá los datos del paciente.</p>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Selector de Tiempo */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Calendar Card */}
          <section className="bg-white rounded-xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-indigo-50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline font-bold text-lg text-gray-900 capitalize">{monthTitle}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={prevMonth}
                  disabled={isPastMonth()}
                  className={`p-2 rounded-lg transition-colors ${isPastMonth() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-slate-100 cursor-pointer'}`}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button 
                  onClick={nextMonth} 
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 text-center">
              {/* Weekdays */}
              <div className="font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Dom</div>
              <div className="font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Lun</div>
              <div className="font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Mar</div>
              <div className="font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Mié</div>
              <div className="font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Jue</div>
              <div className="font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Vie</div>
              <div className="font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Sáb</div>
              
              {renderCalendarDays()}
            </div>
          </section>
          
          {/* Time Grid Card */}
          <section className="bg-white rounded-xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-indigo-50">
            <h3 className="font-headline font-bold text-lg text-gray-900 mb-6">Horarios Disponibles</h3>
            
            {loadingSlots ? (
              <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
                <p className="text-xs font-label uppercase tracking-widest">Calculando disponibilidad...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2">event_busy</span>
                <p className="text-sm font-body">No hay horarios disponibles para este día.</p>
                <p className="text-xs font-body mt-1 text-slate-300">Verificá si hay horarios de atención configurados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {availableSlots.map(time => {
                  // Determinar si el horario ya pasó en base al día seleccionado
                  const [timeHour, timeMin] = time.split(':').map(Number);
                  const isToday = selectedDate === initDateStr;
                  const isPastTime = isToday && (timeHour < actualDate.getHours() || (timeHour === actualDate.getHours() && timeMin <= actualDate.getMinutes()));

                  if (isPastTime) {
                    return (
                      <button key={time} disabled className="py-3 px-4 bg-slate-50 rounded-lg text-sm font-medium text-slate-400 line-through cursor-not-allowed shadow-inner">
                         {time}
                      </button>
                    );
                  }
                  
                  if (selectedTime === time) {
                    return (
                      <button key={time} className="py-3 px-4 bg-indigo-600 rounded-lg text-sm font-bold text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2">
                         {time}
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                      </button>
                    )
                  }
                  
                  return (
                    <button key={time} onClick={() => setSelectedTime(time)} className="py-3 px-4 border border-indigo-100 rounded-lg text-sm font-semibold text-indigo-900 hover:bg-indigo-50 transition-colors">
                       {time}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Booked Appointments Logic */}
          {bookedAppointments.length > 0 && (
            <section className="bg-white rounded-xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-indigo-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-lg text-gray-900">Agenda para este día</h3>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {bookedAppointments.length} {bookedAppointments.length === 1 ? 'Turno' : 'Turnos'}
                </span>
              </div>
              
              <div className="space-y-3">
                {bookedAppointments.map(appt => {
                  const time = new Date(appt.datetime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={appt.id} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50 group hover:border-indigo-100 hover:bg-white transition-all">
                      {/* Hora */}
                      <div className="shrink-0 w-16">
                        <span className="text-[11px] font-bold text-indigo-600 font-mono italic">{time}</span>
                      </div>
                      
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                        {appt.client?.name?.charAt(0).toUpperCase() || '?'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{appt.client?.name || 'Cliente sin nombre'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{appt.service?.name || 'Sin tratamiento'}</p>
                      </div>

                      {/* Status Badge (Mini) */}
                      <div className="shrink-0">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                          Ocupado
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
        
        {/* Columna Derecha: Formulario y Resumen */}
        <div className="lg:col-span-5 space-y-6">
          {/* Form Card */}
          <section className="bg-white rounded-xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-indigo-50">
            <h3 className="font-headline font-bold text-lg text-gray-900 mb-6">Datos del Cliente</h3>
            <div className="space-y-5">
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">DNI / Identificación <span className="text-red-500">*</span></label>
                <input 
                  value={clientDni}
                  onChange={e => setClientDni(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-gray-900" 
                  placeholder="Sin puntos ni espacios" 
                  type="text" 
                />
                <p className="mt-1 text-[10px] text-slate-400">Si el cliente ya existe, los datos se completarán automáticamente.</p>
              </div>

              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nombre Completo <span className="text-red-500">*</span></label>
                <input 
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-gray-900" 
                  placeholder="Ej: María García" 
                  type="text" 
                />
              </div>
              
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Teléfono <span className="text-red-500">*</span></label>
                <input 
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-gray-900" 
                  placeholder="+54 9 11 ..." 
                  type="tel" 
                />
              </div>

              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Correo Electrónico</label>
                <input 
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-gray-900" 
                  placeholder="ejemplo@correo.com" 
                  type="email" 
                />
                <p className="mt-1 text-[10px] text-slate-400">Se enviará una confirmación automática por email.</p>
              </div>
              
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Tratamiento (Opcional)</label>
                <select 
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all text-gray-900"
                >
                  <option value="">Sin tratamiento específico...</option>
                  {services.map(srv => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} ({srv.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-sm text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">mail</span>
                {successMessage}
              </div>
            </div>
          )}

          {/* Summary Ticket Card */}
          <section className="bg-indigo-50/50 rounded-xl p-8 border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 border-t-2 border-dashed border-indigo-200/60"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 border-b-2 border-dashed border-indigo-200/60"></div>
            
            <h3 className="font-headline font-bold text-indigo-950 mb-6">Resumen del Turno</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined">event</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium font-body">Fecha</p>
                  <p className="font-bold text-indigo-950 font-body">{selectedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium font-body">Hora</p>
                  <p className="font-bold text-indigo-950 font-body">{selectedTime || 'A definir'}</p>
                </div>
              </div>

              {clientName && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    {clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium font-body">Cliente</p>
                    <p className="font-bold text-indigo-950 font-body">{clientName}</p>
                  </div>
                </div>
               )}
            </div>
            
            <div className="mt-10">
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white py-4 px-6 rounded-xl font-headline font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                {loading ? 'Confirmando...' : 'Confirmar Turno'}
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal de Advertencia por falta de Email */}
      <Modal
        show={showEmailWarning}
        title="¿Continuar sin email?"
        onConfirm={() => {
          setShowEmailWarning(false);
          // Forzar el submit ignorando el warning esta vez
          setTimeout(() => handleSubmit(), 0);
        }}
        onCancel={() => setShowEmailWarning(false)}
        confirmText="Continuar de todos modos"
        cancelText="Agregar email"
      >
        Si no ingresas un correo electrónico, <strong>no se podrá enviar</strong> la confirmación automática del turno al cliente.
      </Modal>
    </div>
  );
}
