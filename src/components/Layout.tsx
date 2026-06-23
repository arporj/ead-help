import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Award, 
  Users, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  BookMarked,
  BrainCircuit,
  UserCheck,
  Shield,
  GraduationCap,
  CreditCard
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    loginAs, 
    logout, 
    globalError, 
    clearGlobalError,
    isImpersonating
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMockSwitcher, setShowMockSwitcher] = useState(true);

  const isAdmin = user?.role === 'admin';

  // Navigation lists
  const studentNav = [
    { name: 'Meus Estudos', path: '/student', icon: BookOpen },
    { name: 'Simulados & Quizzes', path: '/student/exams', icon: HelpCircle },
    { name: 'Banco de Questões (BDQ)', path: '/student/bdq', icon: FileText },
    { name: 'Consultor de IA', path: '/student/ai-consultant', icon: BrainCircuit },
    { name: 'Ranking Geral', path: '/student/ranking', icon: Award },
    { name: 'Planos e Valores', path: '/student/plans', icon: CreditCard },
    { name: 'Suporte', path: '/student/support', icon: MessageSquare },
  ];

  const adminNav = [
    { name: 'Visão Geral', path: '/admin', icon: LayoutDashboard },
    { name: 'Gerenciar Alunos', path: '/admin/students', icon: Users },
    { name: 'Planos e Preços', path: '/admin/plans', icon: CreditCard },
    { name: 'Cursos & Disciplinas', path: '/admin/academic', icon: GraduationCap },
    { name: 'Gerenciar Resumos', path: '/admin/content', icon: BookMarked },
    { name: 'Banco de Questões', path: '/admin/questions', icon: FileText },
    { name: 'Base de Conhecimento IA', path: '/admin/ai-knowledge', icon: BrainCircuit },
    { name: 'Usuários do Sistema', path: '/admin/users', icon: Shield },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuickLogin = async (role: 'admin' | 'basic' | 'pro' | 'premium') => {
    try {
      await loginAs(role);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
      setMobileMenuOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao alternar de conta no simulador.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-gray-100 font-sans selection:bg-brand-light selection:text-brand-dark">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-brand-medium/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-brand-light hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <Link to={user ? (isAdmin ? '/admin' : '/student') : '/'} className="flex items-center gap-2">
            <div className="bg-brand-medium text-brand-light p-1.5 rounded-lg border border-brand-light/35 shadow-inner">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              EAD <span className="text-brand-light">Help</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && isImpersonating && (
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center gap-1.5 bg-yellow-600/20 hover:bg-yellow-600/35 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-md shadow-yellow-500/5 animate-pulse cursor-pointer mr-2"
              title="Voltar para o meu Usuário Administrador"
            >
              <UserCheck size={14} />
              <span>Voltar ao Admin</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-medium text-sm text-white">{user.name}</span>
                <span className="text-xs text-brand-light capitalize">
                  {isAdmin ? 'Administrador' : 'Estudante'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-brand-medium/30 hover:bg-red-900/40 text-brand-light hover:text-red-350 border border-brand-medium px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login"
                className="bg-brand-medium/40 hover:bg-brand-medium text-white border border-brand-medium px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Entrar no Portal
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar Navigation */}
        {user && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-brand-dark border-r border-brand-medium/40 p-4 shrink-0 justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="px-3 text-xs font-semibold text-brand-light uppercase tracking-wider mb-3">
                    Navegação do {isAdmin ? 'Admin' : 'Aluno'}
                  </h3>
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                            isActive 
                              ? 'bg-brand-medium text-white border-l-4 border-brand-light' 
                              : 'text-gray-400 hover:bg-brand-medium/20 hover:text-brand-light'
                          }`}
                        >
                          <Icon size={18} className={`shrink-0 ${isActive ? 'text-brand-light' : 'text-gray-400 group-hover:text-brand-light transition-colors'}`} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Simulation Switcher trigger in desktop */}
              <div className="pt-4 border-t border-brand-medium/30">
                <button
                  onClick={() => setShowMockSwitcher(!showMockSwitcher)}
                  className="w-full flex items-center justify-between text-xs text-brand-light hover:text-white px-2 py-1.5 rounded bg-brand-medium/20 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <UserCheck size={14} /> Painel de Simulação
                  </span>
                  <span>{showMockSwitcher ? 'Fechar' : 'Abrir'}</span>
                </button>
              </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-30 lg:hidden flex">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                <div className="relative flex flex-col w-64 max-w-xs bg-brand-dark h-full border-r border-brand-medium p-4 z-40 animate-slide-in justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-white">Menu</span>
                      <button onClick={() => setMobileMenuOpen(false)} className="text-brand-light">
                        <X size={20} />
                      </button>
                    </div>
                    <nav className="space-y-1">
                      {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              isActive 
                                ? 'bg-brand-medium text-white border-l-4 border-brand-light' 
                                : 'text-gray-450 hover:bg-brand-medium/20 hover:text-brand-light'
                            }`}
                          >
                            <Icon size={18} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="pt-4 border-t border-brand-medium/30 space-y-2">
                    <span className="text-xs text-brand-light font-medium block">Simular acesso rápido:</span>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <button onClick={() => handleQuickLogin('basic')} className="p-1.5 bg-brand-medium/30 rounded text-center hover:bg-brand-medium">Aluno Básico</button>
                      <button onClick={() => handleQuickLogin('pro')} className="p-1.5 bg-brand-medium/30 rounded text-center hover:bg-brand-medium">Aluno Pro</button>
                      <button onClick={() => handleQuickLogin('premium')} className="p-1.5 bg-brand-medium/30 rounded text-center hover:bg-brand-medium">Aluno Premium</button>
                      <button onClick={() => handleQuickLogin('admin')} className="p-1.5 bg-brand-medium/30 rounded text-center hover:bg-brand-medium text-brand-light font-bold">Admin</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Simulation Switcher Panel (Only visible if user logged in & showMockSwitcher is active) */}
      {user && showMockSwitcher && (
        <div className="fixed bottom-4 right-4 z-50 bg-brand-dark/95 border-2 border-brand-light/40 p-4 rounded-xl shadow-2xl max-w-sm w-80 text-white backdrop-blur-md">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-brand-medium">
            <span className="text-xs font-bold text-brand-light flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-yellow-400" /> SIMULADOR DE MVP
            </span>
            <button 
              onClick={() => setShowMockSwitcher(false)} 
              className="text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[11px] text-gray-300 mb-3 leading-relaxed">
            Use este painel para alternar entre diferentes personas e testar restrições de planos e a área de administração.
          </p>
          <div className="space-y-1.5 text-xs">
            {isImpersonating && (
              <button
                onClick={() => handleQuickLogin('admin')}
                className="w-full mb-2 bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-500/20 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut size={12} />
                <span>Voltar ao Administrador</span>
              </button>
            )}
            <button 
              onClick={() => handleQuickLogin('basic')} 
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-brand-medium/55 ${
                user.role === 'student' && !isAdmin && location.pathname.startsWith('/student') && user.email.includes('joao')
                  ? 'bg-brand-medium border border-brand-light/50 font-bold' 
                  : 'bg-brand-medium/20 border border-brand-medium/40'
              }`}
            >
              <span>👤 Aluno Gratuito (João)</span>
              <span className="text-[10px] bg-brand-dark px-1.5 py-0.5 rounded text-gray-450">Gratuito</span>
            </button>
            
            <button 
              onClick={() => handleQuickLogin('pro')} 
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-brand-medium/55 ${
                user.role === 'student' && user.email.includes('maria')
                  ? 'bg-brand-medium border border-brand-light/50 font-bold' 
                  : 'bg-brand-medium/20 border border-brand-medium/40'
              }`}
            >
              <span>👤 Aluno Start (Maria)</span>
              <span className="text-[10px] bg-brand-medium px-1.5 py-0.5 rounded text-brand-light font-bold">Start</span>
            </button>
            
            <button 
              onClick={() => handleQuickLogin('premium')} 
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-brand-medium/55 ${
                user.role === 'student' && user.email.includes('carlos')
                  ? 'bg-brand-medium border border-brand-light/50 font-bold' 
                  : 'bg-brand-medium/20 border border-brand-medium/40'
              }`}
            >
              <span>👤 Aluno Aprovação (Carlos)</span>
              <span className="text-[10px] bg-yellow-600/30 text-yellow-350 border border-yellow-500/20 px-1.5 py-0.5 rounded font-bold">Aprovação</span>
            </button>
            
            <button 
              onClick={() => handleQuickLogin('admin')} 
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-brand-medium/55 ${
                isAdmin 
                  ? 'bg-brand-medium border border-brand-light/50 font-bold text-white' 
                  : 'bg-brand-medium/20 border border-brand-medium/40 text-brand-light font-semibold'
              }`}
            >
              <span>⚙️ Administrador</span>
              <span className="text-[10px] bg-brand-dark px-1.5 py-0.5 rounded text-brand-light border border-brand-light/20">Acesso Total</span>
            </button>
          </div>
        </div>
      )}
      {/* Global Error Modal */}
      {globalError && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-dark border-2 border-red-500/35 p-6 rounded-2xl max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} className="animate-pulse" />
            </div>
            <h4 className="font-bold text-white text-sm">Ops! Ocorreu um Erro</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {globalError}
            </p>
            <button
              onClick={clearGlobalError}
              className="w-full bg-brand-medium hover:bg-brand-medium/80 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
