import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Form Validations
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, rellene todos los campos.');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, introduce un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    // Simulate database registration delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Successful registration -> auto login
      onRegister({
        name: name,
        email: email
      });
      
      navigate('/');
    }, 1200);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-xl card-shadow">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-[3.5rem] text-primary mb-2 font-variation-settings-'FILL' 1" style={{ fontVariationSettings: '"FILL" 1' }}>
            deployed_code
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Crear Cuenta</h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">Únete a la comunidad de entusiastas de Azote Store.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
              Nombre Completo
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              disabled={isLoading}
              className="w-full bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
              Correo Electrónico
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@ejemplo.com"
              disabled={isLoading}
              className="w-full bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
              Contraseña (mín. 6 caracteres)
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
              Confirmar Contraseña
            </label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-headline-md py-3 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando cuenta...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Registrarse
              </>
            )}
          </button>
        </form>

        {/* Footer link to login */}
        <div className="mt-8 text-center border-t border-outline-variant/20 pt-6">
          <p className="text-sm text-on-surface-variant font-body-md">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
