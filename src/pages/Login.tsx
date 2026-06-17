import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, ShieldAlert, ArrowRight, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    // Direct mapping to make email input feel working
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.includes('admin')) {
      loginAs('admin');
      navigate('/admin');
    } else if (cleanEmail.includes('maria') || cleanEmail.includes('pro')) {
      loginAs('pro');
      navigate('/student');
    } else if (cleanEmail.includes('carlos') || cleanEmail.includes('prem')) {
      loginAs('premium');
      navigate('/student');
    } else {
      // Default to basic user
      loginAs('basic');
      navigate('/student');
    }
  };

  const handleQuickLogin = (role: 'admin' | 'basic' | 'pro' | 'premium') => {
    loginAs(role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen flex items-center justify-center p-4">
      {/* Subtle backgrounds */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brand-light/5 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-brand-medium/5 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="bg-brand-medium/10 border border-brand-medium/50 p-8 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-md relative">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-brand-medium text-brand-light p-3 rounded-2xl border border-brand-light/20 mb-4 shadow-lg">
            <BrainCircuit className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Bem-vindo ao EAD Help</h2>
          <p className="text-gray-400 text-xs mt-1.5">Selecione uma conta de teste ou informe seu e-mail para acessar.</p>
        </div>

        {error && (
          <div className="bg-red-900/35 border border-red-500/35 text-red-200 px-4 py-2.5 rounded-lg text-xs mb-4 flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
              Endereço de E-mail
            </label>
            <input 
              type="email"
              placeholder="ex: joao@email.com ou admin@eadhelp.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-light hover:bg-white text-brand-dark py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-light/5 group"
          >
            Entrar no Portal
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <span className="w-full border-b border-brand-medium/40"></span>
          <span className="text-[10px] text-brand-light font-bold px-3 uppercase shrink-0">Simulador de Acesso Rápido</span>
          <span className="w-full border-b border-brand-medium/40"></span>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => handleQuickLogin('basic')}
            className="w-full bg-brand-medium/20 hover:bg-brand-medium/45 text-white p-2.5 rounded-xl border border-brand-medium/40 text-xs font-medium flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-brand-light" />
              Aluno Básico (João Silva)
            </span>
            <span className="bg-brand-dark px-2 py-0.5 rounded text-[9px] text-gray-400">Plano Grátis</span>
          </button>

          <button 
            onClick={() => handleQuickLogin('pro')}
            className="w-full bg-brand-medium/20 hover:bg-brand-medium/45 text-white p-2.5 rounded-xl border border-brand-medium/40 text-xs font-medium flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-brand-light animate-pulse" />
              Aluno Pro (Maria Santos)
            </span>
            <span className="bg-brand-medium/30 border border-brand-light/35 px-2 py-0.5 rounded text-[9px] text-brand-light font-bold">Plano Pro</span>
          </button>

          <button 
            onClick={() => handleQuickLogin('premium')}
            className="w-full bg-brand-medium/20 hover:bg-brand-medium/45 text-white p-2.5 rounded-xl border border-brand-medium/40 text-xs font-medium flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-brand-light" />
              Aluno Premium (Carlos Oliveira)
            </span>
            <span className="bg-yellow-600/25 border border-yellow-500/20 px-2 py-0.5 rounded text-[9px] text-yellow-300 font-bold">Plano Premium</span>
          </button>

          <button 
            onClick={() => handleQuickLogin('admin')}
            className="w-full bg-brand-medium/30 hover:bg-brand-medium text-brand-light p-2.5 rounded-xl border border-brand-light/25 text-xs font-bold flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              ⚙️ Painel de Administração
            </span>
            <span className="bg-brand-dark px-2 py-0.5 rounded text-[9px] border border-brand-light/10 text-white font-medium">Acesso Total</span>
          </button>
        </div>
      </div>
    </div>
  );
};
