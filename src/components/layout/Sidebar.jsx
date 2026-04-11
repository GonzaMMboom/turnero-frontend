import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../features/auth/auth.context";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { onboardingCompleted, logout, businessName } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLinkClick = (e, to) => {
    if (!onboardingCompleted && to !== "/configuracion") {
      e.preventDefault();
      alert(
        "Debes completar la configuración inicial antes de acceder a otras secciones.",
      );
    }
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-50 flex flex-col py-8 px-6 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="mb-12 px-2">
        <h1 className="text-3xl font-bold tracking-tight text-indigo-600 font-display">
          Turnero
        </h1>
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-semibold mt-1">
          By Marbit
        </p>
      </div>
      <nav className="flex flex-col gap-y-1 flex-grow">
        <Link
          to="/dashboard"
          onClick={(e) => handleLinkClick(e, "/dashboard")}
          className={`group flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${location.pathname === "/dashboard" ? "text-indigo-700 bg-white shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm"}`}
        >
          <span
            className={`material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110 ${location.pathname === "/dashboard" ? "fill-1" : ""}`}
          >
            dashboard
          </span>
          <span className="font-headline tracking-tight">Dashboard</span>
        </Link>
        <Link
          to="/turnos"
          onClick={(e) => handleLinkClick(e, "/turnos")}
          className={`group flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${location.pathname === "/turnos" ? "text-indigo-700 bg-white shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm"}`}
        >
          <span
            className={`material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110 ${location.pathname === "/turnos" ? "fill-1" : ""}`}
          >
            calendar_month
          </span>
          <span className="font-headline tracking-tight">Mis Turnos</span>
        </Link>
        <Link
          to="/turnos/nuevo"
          onClick={(e) => handleLinkClick(e, "/turnos/nuevo")}
          className={`group flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${location.pathname === "/turnos/nuevo" ? "text-indigo-700 bg-white shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm"}`}
        >
          <span
            className={`material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110 ${location.pathname === "/turnos/nuevo" ? "fill-1" : ""}`}
          >
            calendar_add_on
          </span>
          <span className="font-headline tracking-tight">Nuevo Turno</span>
        </Link>
        <Link
          to="/clientes"
          onClick={(e) => handleLinkClick(e, "/clientes")}
          className={`group flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${location.pathname === "/clientes" ? "text-indigo-700 bg-white shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm"}`}
        >
          <span
            className={`material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110 ${location.pathname === "/clientes" ? "fill-1" : ""}`}
          >
            group
          </span>
          <span className="font-headline tracking-tight">Clientes</span>
        </Link>
        <Link
          to="/configuracion"
          className={`group flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${location.pathname === "/configuracion" ? "text-indigo-700 bg-white shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm"}`}
        >
          <span
            className={`material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110 ${location.pathname === "/configuracion" ? "fill-1" : ""}`}
          >
            settings
          </span>
          <span className="font-headline tracking-tight">Configuración</span>
        </Link>
      </nav>
      <div className="mt-auto pt-8 border-t border-slate-200/60">
        <div className="flex items-center gap-3 px-3 py-4 rounded-2xl bg-white/50 border border-white mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md uppercase">
            {businessName ? businessName.substring(0, 2) : "AD"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-slate-800 truncate">
              {businessName || "Administrador"}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Plan Premium
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 font-bold text-xs uppercase tracking-widest group"
        >
          <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">
            logout
          </span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
