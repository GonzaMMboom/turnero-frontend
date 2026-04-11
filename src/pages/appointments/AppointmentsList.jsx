import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');

const toDateStr = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatReadableDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, d));
};

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const getMondayOf = (date) => {
  const d = new Date(date);
  const dow = d.getDay(); // 0=Dom
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekDays = (monday) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

const STATUS_STYLES = {
  scheduled: {
    border: 'border-l-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700',
    dot: 'bg-indigo-500',
    label: 'Confirmado',
    avatar: 'bg-indigo-100 text-indigo-700',
  },
  completed: {
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Completado',
    avatar: 'bg-emerald-100 text-emerald-700',
  },
  cancelled: {
    border: 'border-l-red-400',
    badge: 'bg-red-50 text-red-600',
    dot: 'bg-red-400',
    label: 'Cancelado',
    avatar: 'bg-slate-100 text-slate-400',
  },
};

const getEffectiveStatus = (appt) => {
  if (appt.status !== 'scheduled') return appt.status;
  return new Date(appt.datetime) < new Date() ? 'completed' : 'scheduled';
};

// ─── Appointment Card ─────────────────────────────────────────────────────────
function ApptCard({ appt, onCancel }) {
  const status = getEffectiveStatus(appt);
  const s = STATUS_STYLES[status];
  const time = new Date(appt.datetime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const isCancelled = status === 'cancelled';

  return (
    <div className={`bg-white rounded-xl p-3 border border-slate-100 border-l-4 ${s.border} shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow ${isCancelled ? 'opacity-60' : ''}`}>
      {/* 1. Horario (Ancho fijo) */}
      <div className="shrink-0 w-16">
        <span className="text-[11px] font-bold text-indigo-700 font-mono tracking-tighter whitespace-nowrap">{time}</span>
      </div>

      {/* 2. Avatar (Círculo) */}
      <div className={`w-8 h-8 rounded-full ${s.avatar} flex items-center justify-center font-bold shrink-0 text-xs`}>
        {appt.client?.name?.charAt(0).toUpperCase() || '?'}
      </div>

      {/* 3. Info del Cliente (Flexible) */}
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-xs sm:text-sm truncate ${isCancelled ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {appt.client?.name || 'S/N'}
        </p>
        <p className="text-[10px] text-slate-400 truncate">
          {appt.service?.name || 'S/T'}
        </p>
      </div>

      {/* 4. Estado */}
      <div className="shrink-0">
        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${s.badge} whitespace-nowrap`}>
          {s.label}
        </span>
      </div>

      {/* 5. Acciones */}
      {!isCancelled && status === 'scheduled' && (
        <div className="shrink-0">
          <button
            onClick={() => onCancel(appt.id)}
            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-all flex items-center justify-center"
            title="Cancelar"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Vista Día ────────────────────────────────────────────────────────────────
function DayView({ selectedDate, onDateChange, appointments, loading, onCancel }) {
  const prev = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange(toDateStr(d));
  };
  const next = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    onDateChange(toDateStr(d));
  };

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prev} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="text-center">
          <p className="font-bold text-slate-800 capitalize">{formatReadableDate(selectedDate)}</p>
          <p className="text-xs text-slate-400">{appointments.length} turno{appointments.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={next} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {/* List */}
      {loading ? <Skeleton /> : appointments.length === 0 ? <Empty /> : (
        <div className="space-y-3">
          {appointments.map(a => <ApptCard key={a.id} appt={a} onCancel={onCancel} />)}
        </div>
      )}
    </div>
  );
}

// ─── Vista Semana ─────────────────────────────────────────────────────────────
function WeekView({ selectedDate, onDateChange, appointments, loading, onCancel }) {
  const refDate = new Date(selectedDate + 'T12:00:00');
  const monday = getMondayOf(refDate);
  const days = getWeekDays(monday);

  const prevWeek = () => { const d = new Date(monday); d.setDate(d.getDate() - 7); onDateChange(toDateStr(d)); };
  const nextWeek = () => { const d = new Date(monday); d.setDate(d.getDate() + 7); onDateChange(toDateStr(d)); };

  const sunday = days[6];
  const rangeLabel = `${pad(monday.getDate())}/${pad(monday.getMonth() + 1)} — ${pad(sunday.getDate())}/${pad(sunday.getMonth() + 1)}/${sunday.getFullYear()}`;

  const apptsByDay = days.map(d => {
    const str = toDateStr(d);
    return appointments.filter(a => toDateStr(new Date(a.datetime)) === str);
  });

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="text-center">
          <p className="font-bold text-slate-800">{rangeLabel}</p>
          <p className="text-xs text-slate-400">{appointments.length} turno{appointments.length !== 1 ? 's' : ''} esta semana</p>
        </div>
        <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {loading ? <Skeleton /> : (
        <div className="space-y-4">
          {days.map((day, i) => {
            const isToday = toDateStr(day) === toDateStr(new Date());
            return (
              <div key={i}>
                <div className={`flex items-center gap-3 mb-2`}>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isToday ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <span>{DAYS_ES[i]}</span>
                    <span>{pad(day.getDate())}</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-xs text-slate-400">{apptsByDay[i].length} turno{apptsByDay[i].length !== 1 ? 's' : ''}</span>
                </div>
                {apptsByDay[i].length === 0 ? (
                  <p className="text-xs text-slate-300 pl-4 py-1">Sin turnos</p>
                ) : (
                  <div className="space-y-2 pl-2">
                    {apptsByDay[i].map(a => <ApptCard key={a.id} appt={a} onCancel={onCancel} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Vista Mes ────────────────────────────────────────────────────────────────
function MonthView({ year, month, onMonthChange, appointments, loading, onCancel }) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrev = new Date(year, month - 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const apptsByDay = {};
  appointments.forEach(a => {
    const d = new Date(a.datetime).getDate();
    if (!apptsByDay[d]) apptsByDay[d] = [];
    apptsByDay[d].push(a);
  });

  const prevMonth = () => month === 1 ? onMonthChange(year - 1, 12) : onMonthChange(year, month - 1);
  const nextMonth = () => month === 12 ? onMonthChange(year + 1, 1) : onMonthChange(year, month + 1);

  const [selectedDay, setSelectedDay] = useState(null);
  const selectedAppts = selectedDay ? (apptsByDay[selectedDay] || []) : [];

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="text-center">
          <p className="font-bold text-slate-800">{MONTHS_ES[month - 1]} {year}</p>
          <p className="text-xs text-slate-400">{appointments.length} turno{appointments.length !== 1 ? 's' : ''} este mes</p>
        </div>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {loading ? <Skeleton /> : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_ES.map(d => (
                <div key={d} className="text-[10px] uppercase tracking-widest text-slate-400 font-bold py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Prev month */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`p${i}`} className="py-3 text-slate-300 text-sm">
                  {daysInPrev - firstDay + i + 1}
                </div>
              ))}
              {/* This month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1;
                const count = apptsByDay[d]?.length || 0;
                const isSelected = selectedDay === d;
                const today = new Date();
                const isToday = today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d;

                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(isSelected ? null : d)}
                    className={`relative py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer
                      ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' :
                        isToday ? 'ring-2 ring-indigo-400 text-indigo-700' :
                        count > 0 ? 'hover:bg-indigo-50 text-slate-700' : 'hover:bg-slate-50 text-slate-500'}`}
                  >
                    {d}
                    {count > 0 && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                          <span key={i} className="w-1 h-1 rounded-full bg-indigo-400 inline-block"></span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
              {/* Next month */}
              {Array.from({ length: totalCells - firstDay - daysInMonth }, (_, i) => (
                <div key={`n${i}`} className="py-3 text-slate-300 text-sm">{i + 1}</div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-2">
            {selectedDay ? (
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">
                  {pad(selectedDay)}/{pad(month)}/{year} · {selectedAppts.length} turno{selectedAppts.length !== 1 ? 's' : ''}
                </p>
                {selectedAppts.length === 0 ? (
                  <Empty />
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {selectedAppts.map(a => <ApptCard key={a.id} appt={a} onCancel={onCancel} />)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-300 pt-8">
                <span className="material-symbols-outlined text-5xl mb-3">touch_app</span>
                <p className="text-sm font-medium">Seleccioná un día del calendario para ver sus turnos</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeletons & Empty ────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1,2,3].map(i => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
      <span className="material-symbols-outlined text-4xl mb-3">event_busy</span>
      <p className="text-sm font-medium">Sin turnos para este período</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const today = new Date();
  const [view, setView] = useState('day'); // 'day' | 'week' | 'month'
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setAppointments([]);
    try {
      let res;
      if (view === 'day') {
        res = await api.get(`/appointments/date?date=${selectedDate}`);
      } else if (view === 'week') {
        res = await api.get(`/appointments/week?date=${selectedDate}`);
      } else {
        res = await api.get(`/appointments/month?year=${calYear}&month=${calMonth}`);
      }
      setAppointments(res.data);
    } catch (err) {
      console.error('Error cargando turnos:', err);
    } finally {
      setLoading(false);
    }
  }, [view, selectedDate, calYear, calMonth]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar este turno?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch {
      alert('No se pudo cancelar el turno.');
    }
  };

  const VIEWS = [
    { key: 'day',   label: 'Día',   icon: 'calendar_today' },
    { key: 'week',  label: 'Semana', icon: 'view_week' },
    { key: 'month', label: 'Mes',   icon: 'calendar_month' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-indigo-950 tracking-tight">Turnos</h2>
          <p className="text-slate-500 mt-1 font-body">Visualizá tu agenda por día, semana o mes.</p>
        </div>
        <Link
          to="/turnos/nuevo"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold font-headline shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 w-fit text-sm"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Nuevo Turno
        </Link>
      </header>

      {/* View Toggle */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold font-headline transition-all cursor-pointer ${
              view === v.key
                ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">{v.icon}</span>
            {v.label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_32px_rgba(0,0,0,0.04)] border border-indigo-50">
        {view === 'day' && (
          <DayView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            appointments={appointments}
            loading={loading}
            onCancel={handleCancel}
          />
        )}
        {view === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            appointments={appointments}
            loading={loading}
            onCancel={handleCancel}
          />
        )}
        {view === 'month' && (
          <MonthView
            year={calYear}
            month={calMonth}
            onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }}
            appointments={appointments}
            loading={loading}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
