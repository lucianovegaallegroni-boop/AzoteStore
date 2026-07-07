import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!email || !password) {
      setError('Por favor, rellene todos los campos.');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, introduce un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    // Query Supabase for authentication check
    (async () => {
      try {
        const { supabase } = await import('../supabaseClient');

        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (fetchError || !user) {
          throw new Error('El correo electrónico no está registrado.');
        }

        // Mock password matching (comparing plaintext password for local convenience)
        if (user.password !== password) {
          throw new Error('La contraseña es incorrecta.');
        }

        setIsLoading(false);
        onLogin({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role || 'cliente'
        });

        navigate('/');
      } catch (err) {
        console.error('Error al iniciar sesión:', err);
        setError(err.message || 'Error al conectar con la base de datos.');
        setIsLoading(false);
      }
    })();
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-xl card-shadow">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-[3.5rem] text-primary mb-2 font-variation-settings-'FILL' 1" style={{ fontVariationSettings: '"FILL" 1' }}>
            deployed_code
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Ingresar a la Bóveda</h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">Accede a tu colección y favoritos.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-2">
              Correo Electrónico
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              disabled={isLoading}
              className="w-full bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline">
                Contraseña
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Enlace de recuperación enviado. (Simulación)'); }} className="text-xs font-semibold text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-headline-md py-3 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 mt-8"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">login</span>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Footer link to register */}
        <div className="mt-8 text-center border-t border-outline-variant/20 pt-6">
          <p className="text-sm text-on-surface-variant font-body-md">
            ¿Nuevo en Azote Store?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Crea una cuenta aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
