import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../features/auth/auth.context';

export default function Register() {
  const [centerName, setCenterName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Debes aceptar los términos y condiciones');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    const result = await register(email, password, centerName);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al crear la cuenta');
      setIsLoading(false);
    }
  };

  const isFormValid = centerName.trim() !== '' && email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '' && termsAccepted;

  return (
    <div className="bg-surface text-on-surface selection:bg-indigo-300 selection:text-indigo-900 overflow-hidden font-body">
      <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Branding & Environment (Matching Login structure but with Register image) */}
        <section className="hidden lg:flex relative flex-col justify-center p-16 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover" 
              alt="Interior of a ultra-modern minimalist dental clinic" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAteHRM4W4Qa746lBw7E9qg7XtiTrfrY06fDN0Bb3QSOOvVteQSzuvRCeKXsVQF8NqjTOR3_bPirNiUfdByCm8KoJmI1V6AV_I639le3QBCyYtBjz011m2pcdyZBd9mGHe3aI40WQxCN-Omv24oJA9Zn9gmmF1a5gomB9i5WTsuEeLwFesYnBMtHc-yyFhhoWhQ45hgve_p4Alelh24gn08xxR0x9ga24C0SEuuSrWbZj1lJyMgW6F3aIl5-aIw-m-b4orpsLlPqg"
            />
            <div className="absolute inset-0 bg-primary/25 backdrop-blur-[1px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-primary/40"></div>
          </div>
          
          {/* Content Overlay */}
          <div className="relative z-10 max-w-lg mb-24 lg:mb-32 text-left">
            <div className="mb-8 inline-flex items-center gap-3">
              <span className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
              </span>
              <span className="text-4xl font-extrabold tracking-tight text-white font-headline">Turnero</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 font-headline">
              Excelencia médica <br/>a un <span className="text-indigo-200">clic</span> de distancia.
            </h1>
            
            <p className="text-white/70 text-lg leading-relaxed font-body max-w-md">
              Únete a la plataforma que redefine la gestión de citas de lujo. Precisión clínica combinada con una experiencia digital sin fricciones.
            </p>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="professional female doctor portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtGL-RsZHAzFojbVo2AwZqlA7NVCCKCfmjWyuFWIlQJeubNOkkOAb9ZgmGvwzWCoQB4JbnssUcTZgtUYqVClopUAUhIEwuFj5IHLIlhZ3lnu8VG4RISpWN0r9zZPNHdjMgvIgo-dax3ZcQN0zlvR5TG75rh7Kn-8IdKkxEoTMyUv6xRV6QJb6EGYKjYxNox5SxmZPWiBIi6fJ-nYMi_1PiUPKxYAGDum0-mzwpK4ykutMIWCfTSkljI90dCQxUSIJA03ItkwqpMQ"/>
                <img className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="professional male surgeon portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKZFm5-tZdOwXmQO9JQPAccAzf76s6sZch_kktgX_tjSIPLtaK17YYf3IQU3trYACvzMx6HRMEbz7UB-_VO4F0KGXsd-2YU7AOeNdix5ExrZb5KXhLke7Gknz37YBGKeUFsyiN3UX6pxevvJRYECFpb_W4fcYlPkNVUKqtnfpmqtLIWdXd2YO_bURmJfp62lrJvlQQB6AGyNK-tOln5oFJBRsiPHSMN8QqRgudNaWF0RABqjnt0ReARyepvcJa2hAfhn2agiKyoQ"/>
                <img className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="friendly female medical practitioner portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtXTd3ZFOsbfxE6KUO1v0Ad00LbKk2CLl71BBOP-W-ENGUO6poFYifbzpEy_qz4FiqZF6Q3qyL5-JFOJGWK8J0MzLhWxt4kjgEPZVJ7df82D_TOzOieLnhVJlVTqkQjNuoRxhHA4srLo8TxxCN2Df_LlLFPV7YZRiAeFSDpqjL07BitTMPivWogEMYn3MYWKqm0XeuJz_r7ouydFtR0rTCVdfCSD2AlzmvyrPxlCgMM5_6GJdI3qC9Inbqiwv-bWg_ho6VlV51Fw"/>
              </div>
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">+500 Especialistas</span>
            </div>
          </div>
        </section>

        {/* Right Column: Registration Form (Identical style to Login) */}
        <section className="bg-surface flex items-center justify-center p-8 lg:p-16 overflow-y-auto">
          <div className="w-full max-w-md space-y-8 my-auto">
            {/* Mobile Branding */}
            <div className="lg:hidden mb-8">
              <span className="text-2xl font-extrabold tracking-tighter text-primary font-headline">Turnero</span>
            </div>
            
            {/* Registration Card (Matches Login card structure) */}
            <div className="bg-surface-container-lowest p-10 lg:p-12 rounded-lg editorial-shadow border border-gray-200">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 font-headline tracking-tight mb-2">Crear nueva cuenta</h2>
                <p className="text-gray-500 font-body text-sm">Regístrate para comenzar a gestionar tus citas.</p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Professional Center Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 font-label" htmlFor="center-name">
                    Nombre del centro profesional
                  </label>
                  <input 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-gray-400 text-gray-900" 
                    id="center-name" 
                    placeholder="Ej. Clínica Santa María" 
                    required 
                    type="text"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 font-label" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input 
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-gray-400 text-gray-900" 
                    id="email" 
                    placeholder="nombre@ejemplo.com" 
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Passwords Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 font-label" htmlFor="password">
                      Contraseña
                    </label>
                    <input 
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-gray-400 text-gray-900" 
                      id="password" 
                      placeholder="••••••••" 
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 font-label" htmlFor="confirm-password">
                      Confirmar
                    </label>
                    <input 
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-gray-400 text-gray-900" 
                      id="confirm-password" 
                      placeholder="••••••••" 
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input 
                    className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary transition-all cursor-pointer" 
                    id="terms" 
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label className="text-sm text-gray-600 leading-snug cursor-pointer font-medium" htmlFor="terms">
                    Acepto los <a className="text-primary font-bold hover:underline" href="#">Términos</a> y la <a className="text-primary font-bold hover:underline" href="#">Privacidad</a>.
                  </label>
                </div>

                {/* Action Button */}
                <button 
                  disabled={!isFormValid || isLoading}
                  className={`w-full py-4 px-6 primary-gradient text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 group ${(!isFormValid || isLoading) ? 'opacity-70 cursor-not-allowed hidden-group-hover' : ''}`} 
                  type="submit"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>Crear cuenta</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Social Login (Google Only) */}
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
                  ¿Ya tienes cuenta? 
                  <Link className="text-primary font-bold hover:underline ml-1 transition-colors" to="/login">Inicia sesión</Link>
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
