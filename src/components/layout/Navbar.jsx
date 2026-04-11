import React, { useContext } from 'react';
import { AuthContext } from '../../features/auth/auth.context';

export default function Navbar() {
  const { businessName } = useContext(AuthContext);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/70 backdrop-blur-xl flex justify-between items-center h-20 px-8 ml-64 editorial-shadow">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-slate-900 font-headline">
          {businessName || 'Cargando...'}
        </span>
      </div>
      <div className="flex items-center gap-6">
        {/* Botones eliminados */}
      </div>
    </header>
  );
}
