import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, ShieldAlert, ArrowRight, User, Lock, Mail, CheckCircle, Check, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  // Sign Up States
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpShowPassword, setSignUpShowPassword] = useState(false);

  // Common Feedback States
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation checks for Sign Up
  const meetsMinLength = signUpPassword.length >= 6;
  const meetsUppercase = /[A-Z]/.test(signUpPassword);
  const meetsLowercase = /[a-z]/.test(signUpPassword);
  const meetsNumber = /[0-9]/.test(signUpPassword);
  const meetsSpecialChar = /[^A-Za-z0-9]/.test(signUpPassword);
  const isSignUpPasswordValid = meetsMinLength && meetsUppercase && meetsLowercase && meetsNumber && meetsSpecialChar;

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!loginEmail || !loginPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword
      });

      if (signInErr) {
        if (signInErr.message.includes('Email not confirmed') || signInErr.message.includes('email_not_confirmed')) {
          throw new Error('Confirmação de e-mail pendente. Por favor, verifique a sua caixa de entrada para ativar a sua conta. Se não recebeu o e-mail, entre em contato em suporte@helpead.com.br.');
        }
        throw signInErr;
      }

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
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.');
      } else if (errMsg.includes('User not found') || errMsg.includes('User does not exist')) {
        setError('Usuário não encontrado. Cadastre-se ou verifique o e-mail digitado.');
      } else {
        setError(errMsg || 'Ocorreu um erro ao realizar o login.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!signUpEmail || !signUpPassword || !signUpFullName) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isSignUpPasswordValid) {
      setError('Por favor, defina uma senha que atenda a todos os requisitos de segurança obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpErr } = await supabase.auth.signUp({
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        options: {
          data: {
            full_name: signUpFullName.trim(),
          }
        }
      });

      if (signUpErr) throw signUpErr;

      setSuccessMessage('Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu e-mail. Por favor, verifique a sua caixa de entrada e clique no link para ativar sua conta e entrar no sistema.');
      setSignUpEmail('');
      setSignUpFullName('');
      setSignUpPassword('');
    } catch (err: any) {
      const errMsg = err.message || '';
      if (
        errMsg.toLowerCase().includes('error sending confirmation email') ||
        errMsg.toLowerCase().includes('smtp') ||
        errMsg.toLowerCase().includes('fail')
      ) {
        setError('O e-mail de confirmação de cadastro não pôde ser enviado. Por favor, entre em contato conosco em suporte@helpead.com.br para que possamos ativar a sua conta manualmente.');
      } else {
        let friendlyMessage = 'Ocorreu um erro no processamento. Por favor, tente novamente.';
        
        if (errMsg.includes('Invalid email') || errMsg.includes('invalid_email') || errMsg.includes('Email address is invalid')) {
          friendlyMessage = 'E-mail em formato inválido. Por favor, digite um endereço de e-mail válido.';
        } else if (errMsg.includes('Password should be') || errMsg.includes('at least 6 characters')) {
          friendlyMessage = 'A senha deve conter pelo menos 6 caracteres.';
        } else if (errMsg.includes('Password is too weak') || errMsg.includes('weak_password')) {
          friendlyMessage = 'Sua senha é muito fraca. Digite uma combinação de senha mais forte.';
        } else if (errMsg.includes('User already registered') || errMsg.includes('already exists') || errMsg.includes('already_registered')) {
          friendlyMessage = 'Este endereço de e-mail já está cadastrado. Tente fazer login ou recupere sua senha.';
        } else if (errMsg.toLowerCase().includes('signup_disabled')) {
          friendlyMessage = 'O cadastro de novos usuários está temporariamente desativado no sistema.';
        } else if (errMsg.toLowerCase().includes('fetch') || errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('connection')) {
          friendlyMessage = 'Erro de rede. Verifique sua conexão com a internet e tente novamente.';
        } else if (errMsg) {
          friendlyMessage = errMsg;
        }
        
        setError(friendlyMessage);
      }
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

  const handleTabChange = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setError('');
    setSuccessMessage('');
    setLoginShowPassword(false);
    setSignUpShowPassword(false);
  };

  return (
    <div className="bg-brand-dark min-h-screen flex items-center justify-center p-4">
      {/* Subtle backgrounds */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brand-light/5 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-brand-medium/5 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="bg-brand-medium/10 border border-brand-medium/50 p-8 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-md relative animate-in fade-in zoom-in-95 duration-355">
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
            onClick={() => handleTabChange(false)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              !isSignUp 
                ? 'bg-brand-light text-brand-dark shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => handleTabChange(true)}
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

        {/* Conditional Rendering of Forms */}
        {!isSignUp ? (
          /* FORMULÁRIO DE LOGIN (SIGN IN) */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail size={13} /> Endereço de E-mail
              </label>
              <input 
                type="email"
                disabled={loading}
                placeholder="seuemail@exemplo.com"
                value={loginEmail}
                onChange={(e) => { setLoginEmail(e.target.value); setError(''); }}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock size={13} /> Senha
              </label>
              <div className="relative">
                <input 
                  type={loginShowPassword ? 'text' : 'password'}
                  disabled={loading}
                  placeholder="Digite sua senha"
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setError(''); }}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-550 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  title={loginShowPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {loginShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-light/5 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando no Portal...' : 'Entrar no Portal'}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        ) : (
          /* FORMULÁRIO DE CADASTRO (SIGN UP) */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={13} /> Nome Completo
              </label>
              <input 
                type="text"
                disabled={loading}
                placeholder="Ex: João da Silva"
                value={signUpFullName}
                onChange={(e) => { setSignUpFullName(e.target.value); setError(''); }}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail size={13} /> Endereço de E-mail
              </label>
              <input 
                type="email"
                disabled={loading}
                placeholder="seuemail@exemplo.com"
                value={signUpEmail}
                onChange={(e) => { setSignUpEmail(e.target.value); setError(''); }}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-550 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock size={13} /> Senha
              </label>
              <div className="relative">
                <input 
                  type={signUpShowPassword ? 'text' : 'password'}
                  disabled={loading}
                  placeholder="Defina sua senha"
                  value={signUpPassword}
                  onChange={(e) => { setSignUpPassword(e.target.value); setError(''); }}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-brand-light focus:outline-none transition-all placeholder:text-gray-550 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setSignUpShowPassword(!signUpShowPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  title={signUpShowPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {signUpShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password checklist is always visible for Sign Up */}
              <div className="mt-2.5 p-3 bg-brand-dark/50 border border-brand-medium/40 rounded-xl space-y-1.5 text-[11px] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                <span className="block font-bold text-brand-light uppercase tracking-wider mb-1">Requisitos da Senha:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-2 transition-all">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${meetsMinLength ? 'bg-green-500/20 border-green-500 text-green-400 scale-110 shadow-[0_0_8px_rgba(34,197,94,0.2)]' : 'border-brand-medium/40 text-gray-500 bg-brand-dark/30'}`}>
                      <Check size={10} className={`transition-opacity duration-200 ${meetsMinLength ? 'opacity-100' : 'opacity-0'}`} />
                    </span>
                    <span className={`transition-colors duration-200 ${meetsMinLength ? 'text-white font-medium' : 'text-gray-400'}`}>No mínimo 6 caracteres</span>
                  </div>

                  <div className="flex items-center gap-2 transition-all">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${meetsUppercase ? 'bg-green-500/20 border-green-500 text-green-400 scale-110 shadow-[0_0_8px_rgba(34,197,94,0.2)]' : 'border-brand-medium/40 text-gray-500 bg-brand-dark/30'}`}>
                      <Check size={10} className={`transition-opacity duration-200 ${meetsUppercase ? 'opacity-100' : 'opacity-0'}`} />
                    </span>
                    <span className={`transition-colors duration-200 ${meetsUppercase ? 'text-white font-medium' : 'text-gray-400'}`}>Uma letra maiúscula</span>
                  </div>

                  <div className="flex items-center gap-2 transition-all">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${meetsLowercase ? 'bg-green-500/20 border-green-500 text-green-400 scale-110 shadow-[0_0_8px_rgba(34,197,94,0.2)]' : 'border-brand-medium/40 text-gray-500 bg-brand-dark/30'}`}>
                      <Check size={10} className={`transition-opacity duration-200 ${meetsLowercase ? 'opacity-100' : 'opacity-0'}`} />
                    </span>
                    <span className={`transition-colors duration-200 ${meetsLowercase ? 'text-white font-medium' : 'text-gray-400'}`}>Uma letra minúscula</span>
                  </div>

                  <div className="flex items-center gap-2 transition-all">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${meetsNumber ? 'bg-green-500/20 border-green-500 text-green-400 scale-110 shadow-[0_0_8px_rgba(34,197,94,0.2)]' : 'border-brand-medium/40 text-gray-500 bg-brand-dark/30'}`}>
                      <Check size={10} className={`transition-opacity duration-200 ${meetsNumber ? 'opacity-100' : 'opacity-0'}`} />
                    </span>
                    <span className={`transition-colors duration-200 ${meetsNumber ? 'text-white font-medium' : 'text-gray-400'}`}>Pelo menos um número</span>
                  </div>

                  <div className="flex items-center gap-2 transition-all">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${meetsSpecialChar ? 'bg-green-500/20 border-green-500 text-green-400 scale-110 shadow-[0_0_8px_rgba(34,197,94,0.2)]' : 'border-brand-medium/40 text-gray-500 bg-brand-dark/30'}`}>
                      <Check size={10} className={`transition-opacity duration-200 ${meetsSpecialChar ? 'opacity-100' : 'opacity-0'}`} />
                    </span>
                    <span className={`transition-colors duration-200 ${meetsSpecialChar ? 'text-white font-medium' : 'text-gray-400'}`}>Um caractere especial</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-light/5 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Efetuando cadastro...' : 'Finalizar Cadastro'}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        )}

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
