import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, ShieldAlert, ArrowRight, User, Lock, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isSignUp && !fullName) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Fluxo de Cadastro Real (Sign Up) com Supabase Auth
        const { error: signUpErr } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            }
          }
        });

        if (signUpErr) throw signUpErr;

        setSuccessMessage('Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu e-mail. Por favor, verifique a sua caixa de entrada e clique no link para ativar sua conta e entrar no sistema.');
        // Limpar todos os campos e voltar para a tela de login
        setEmail('');
        setFullName('');
        setPassword('');
        setIsSignUp(false);
      } else {
        // Fluxo de Login Real (Sign In) com e-mail e senha informados
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (signInErr) {
          if (signInErr.message.includes('Email not confirmed') || signInErr.message.includes('email_not_confirmed')) {
            throw new Error('Confirmação de e-mail pendente. Por favor, verifique a sua caixa de entrada e clique no link enviado para ativar a sua conta antes de fazer login.');
          }
          throw signInErr;
        }

        // Buscar a role do usuário no profiles para redirecionamento dinâmico
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/student');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro no processamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'basic' | 'pro' | 'premium') => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await loginAs(role);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login rápido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen flex items-center justify-center p-4">
      {/* Subtle backgrounds */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brand-light/5 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-brand-medium/5 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="bg-brand-medium/10 border border-brand-medium/50 p-8 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-md relative">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="bg-brand-medium text-brand-light p-3 rounded-2xl border border-brand-light/20 mb-4 shadow-lg">
            <BrainCircuit className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Help EAD</h2>
          <p className="text-gray-400 text-xs mt-1.5">
            {isSignUp ? 'Crie sua conta de estudante para começar' : 'Entre com e-mail e senha para acessar o portal'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-brand-dark border border-brand-medium/60 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setIsSignUp(false); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              !isSignUp 
                ? 'bg-brand-light text-brand-dark shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              isSignUp 
                ? 'bg-brand-light text-brand-dark shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cadastrar-se
          </button>
        </div>

        {error && (
          <div className="bg-red-900/35 border border-red-500/35 text-red-200 px-4 py-2.5 rounded-lg text-xs mb-4 flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-950/40 border border-emerald-500/35 text-emerald-255 px-4 py-3 rounded-lg text-xs mb-4 flex gap-2">
            <CheckCircle size={18} className="text-emerald-450 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={13} /> Nome Completo
              </label>
              <input 
                type="text"
                disabled={loading}
                placeholder="Ex: João da Silva"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(''); }}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-500 disabled:opacity-50"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={13} /> Endereço de E-mail
            </label>
            <input 
              type="email"
              disabled={loading}
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock size={13} /> Senha
            </label>
            <input 
              type="password"
              disabled={loading}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-500 disabled:opacity-50"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-light hover:bg-white text-brand-dark py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-light/5 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (isSignUp ? 'Efetuando cadastro...' : 'Entrando no Portal...') 
              : (isSignUp ? 'Finalizar Cadastro' : 'Entrar no Portal')
            }
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
            disabled={loading}
            className="w-full bg-brand-medium/20 hover:bg-brand-medium/45 text-white p-2.5 rounded-xl border border-brand-medium/40 text-xs font-medium flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-brand-light" />
              Aluno Básico (João Silva)
            </span>
            <span className="bg-brand-dark px-2 py-0.5 rounded text-[9px] text-gray-400">Plano Grátis</span>
          </button>

          <button 
            onClick={() => handleQuickLogin('pro')}
            disabled={loading}
            className="w-full bg-brand-medium/20 hover:bg-brand-medium/45 text-white p-2.5 rounded-xl border border-brand-medium/40 text-xs font-medium flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-brand-light animate-pulse" />
              Aluno Pro (Maria Santos)
            </span>
            <span className="bg-brand-medium/30 border border-brand-light/35 px-2 py-0.5 rounded text-[9px] text-brand-light font-bold">Plano Pro</span>
          </button>

          <button 
            onClick={() => handleQuickLogin('premium')}
            disabled={loading}
            className="w-full bg-brand-medium/20 hover:bg-brand-medium/45 text-white p-2.5 rounded-xl border border-brand-medium/40 text-xs font-medium flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-brand-light" />
              Aluno Premium (Carlos Oliveira)
            </span>
            <span className="bg-yellow-600/25 border border-yellow-500/20 px-2 py-0.5 rounded text-[9px] text-yellow-300 font-bold">Plano Premium</span>
          </button>

          <button 
            onClick={() => handleQuickLogin('admin')}
            disabled={loading}
            className="w-full bg-brand-medium/30 hover:bg-brand-medium text-brand-light p-2.5 rounded-xl border border-brand-light/25 text-xs font-bold flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
