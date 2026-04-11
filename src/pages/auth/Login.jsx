import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../features/auth/auth.context';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al iniciar sesión');
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <div className="bg-surface text-on-surface selection:bg-indigo-300 selection:text-indigo-900 overflow-hidden font-body">
      <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Branding/Message */}
        <section className="relative hidden md:flex flex-col justify-center px-16 bg-gradient-to-br from-primary to-[#100069] overflow-hidden">
          {/* Abstract Graphic Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 rounded-full bg-orange-500 opacity-10 blur-[80px]"></div>
          
          <div className="relative z-10 max-w-lg mb-32 lg:mb-48">
            <div className="mb-8 flex items-center gap-3">
              <span className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
              </span>
              <span className="text-4xl font-extrabold tracking-tight text-white font-headline">Turnero</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white font-headline leading-[1.1] mb-6 tracking-tight">
              Gestioná tus turnos de forma <span className="text-indigo-300">simple</span> y eficiente.
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed font-body max-w-md">
              El Atelier de Gestión Clínica diseñado para elevar la experiencia de tus pacientes desde el primer contacto.
            </p>
            
            {/* Status Veil Component Simulation */}
            <div className="mt-12 flex gap-4">
              <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 backdrop-blur-md border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span className="text-white text-xs font-medium uppercase tracking-widest">Servicio Activo</span>
              </div>
              <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 backdrop-blur-md border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
                <span className="text-white text-xs font-medium uppercase tracking-widest">v2.4.0</span>
              </div>
            </div>
          </div>
          
          {/* Subtle Decorative Image */}
          <div className="absolute bottom-12 right-0 left-16 opacity-40">
            <div className="w-full h-64 rounded-tl-3xl overflow-hidden shadow-2xl">
              <img className="w-full h-full object-cover" alt="Modern minimalist aesthetic medical office interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGXsOHlTJ4ebSPH7cBe2OkPe8kABi4aqWYIRd29B97oBOZbt8FoKNw7eOS7_MsoGQO2CcIEIp8QV5eud1ieTKSzjWrnpA9AbCaV1M_Ws_nqrnIPw5KWKUqiOaesIhLMeX5fO9cl_w0ZJ_qpES35dSHU2ur4vaF9j9yPTpK7KgxZh7DIAof5CT0LpyVz81VG-Q5fZ6mlUhLSr9Q6TzNixRmz8HFGMFbh3eBjc46xmNnQIO6HX7XuQeYJgNFbGo6PD_hFAbkDKjFdA"/>
            </div>
          </div>
        </section>

        {/* Right Column: Login Form */}
        <section className="bg-surface flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md space-y-8">
            {/* Login Card */}
            <div className="bg-surface-container-lowest p-10 lg:p-12 rounded-lg editorial-shadow border border-gray-200">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 font-headline tracking-tight mb-2">Iniciar sesión</h2>
                <p className="text-gray-500 font-body text-sm">Ingresá tus datos para continuar</p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 font-label" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-gray-400 text-gray-900" 
                    id="email" 
                    name="email" 
                    placeholder="tu@clinica.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 font-label" htmlFor="password">
                      Contraseña
                    </label>
                    <a className="text-xs font-semibold text-primary hover:text-indigo-500 transition-colors" href="#">¿Olvidaste tu contraseña?</a>
                  </div>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-gray-400 text-gray-900" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input 
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary transition-all cursor-pointer" 
                    id="remember" 
                    name="remember" 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="ml-2 text-sm text-gray-600 font-medium cursor-pointer" htmlFor="remember">Recordarme</label>
                </div>

                <button 
                  className={`w-full py-4 px-6 primary-gradient text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 group ${(!isFormValid || isLoading) ? 'opacity-70 cursor-not-allowed hidden-group-hover' : ''}`} 
                  type="submit"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Local Google login (consistent with register) */}
              <div className="mt-8">
                <div className="relative flex items-center mb-6">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">O continúa con</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>Google</span>
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  ¿Aún no tienes cuenta? 
                  <Link className="text-primary font-bold hover:underline transition-all ml-1" to="/register">Registrate gratis</Link>
                </p>
              </div>
            </div>

            {/* Footer-like Links */}
            <div className="flex justify-center gap-6 mt-8">
              <a className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 transition" href="#">Privacidad</a>
              <a className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 transition" href="#">Términos</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
