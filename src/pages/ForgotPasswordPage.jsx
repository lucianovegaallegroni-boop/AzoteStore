import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.webp';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' }); // type: 'error' | 'success'
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!email) {
      setStatus({ type: 'error', message: 'Por favor, introduce tu correo electrónico.' });
      return;
    }

    if (!email.includes('@')) {
      setStatus({ type: 'error', message: 'Por favor, introduce un correo electrónico válido.' });
      return;
    }

    setIsLoading(true);

    try {
      const { supabase } = await import('../supabaseClient');

      // Check if user exists first (since we manage custom users table)
      // Call the Edge Function to send the password email
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('send-password-email', {
        body: { email }
      });

      if (invokeError) {
        throw new Error('Hubo un problema al enviar el correo. Por favor, inténtalo de nuevo.');
      }

      setStatus({ 
        type: 'success', 
        message: 'Si el correo existe, se han enviado las instrucciones para restablecer tu contraseña.' 
      });
      setEmail('');
    } catch (err) {
      console.error('Error al recuperar contraseña:', err);
      // For security, it's often better to show the generic success message anyway to prevent email enumeration,
      // but keeping the explicit error for demo purposes.
      setStatus({ type: 'error', message: err.message || 'Error al procesar la solicitud.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-xl card-shadow">
        
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Azote Store" className="mx-auto h-32 md:h-36 w-auto object-contain rounded-2xl border border-outline-variant/10 shadow-xl mb-6" />
          <h2 className="font-headline-lg text-headline-lg text-on-background">Recuperar Contraseña</h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-2">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
          </p>
        </div>

        {/* Status Alert */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-start gap-2 border ${
            status.type === 'error' 
              ? 'bg-error-container text-on-error-container border-error/20' 
              : 'bg-primary-container/20 text-primary-container border-primary/20'
          }`}>
            <span className="material-symbols-outlined text-[18px] mt-0.5">
              {status.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <p className="leading-tight">{status.message}</p>
          </div>
        )}

        {/* Form */}
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
              disabled={isLoading || status.type === 'success'}
              className="w-full bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm disabled:opacity-60"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading || status.type === 'success'}
            className="w-full bg-primary text-on-primary font-headline-md py-3 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 mt-8"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">send</span>
                Enviar Instrucciones
              </>
            )}
          </button>
        </form>

        {/* Footer link back to login */}
        <div className="mt-8 text-center border-t border-outline-variant/20 pt-6">
          <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline group">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Volver a Iniciar Sesión
          </Link>
        </div>

      </div>
    </div>
  );
}
