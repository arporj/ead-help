import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  HelpCircle, 
  FileText, 
  BrainCircuit, 
  BookOpen, 
  ArrowRight,
  Star
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, loginAs, plansConfig } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    }
  }, [user, navigate]);

  const handleQuickAccess = async (plan: 'basic' | 'pro' | 'premium') => {
    try {
      await loginAs(plan);
      navigate('/student');
    } catch (err: any) {
      alert(err.message || 'Erro ao acessar o plano de simulação.');
    }
  };

  const basicPlan = plansConfig?.find(p => p.planType === 'basic') || {
    name: 'Gratuito',
    priceMonthly: 0,
    priceQuarterly: 0
  };
  const proPlan = plansConfig?.find(p => p.planType === 'pro') || {
    name: 'Start',
    priceMonthly: 39.90,
    priceQuarterly: 99.90,
    maxSubjects: 3,
    includedPremiumSummaries: 1
  };
  const premiumPlan = plansConfig?.find(p => p.planType === 'premium') || {
    name: 'Aprovação',
    priceMonthly: 69.90,
    priceQuarterly: 179.90,
    maxSubjects: 5,
    includedPremiumSummaries: 2
  };

  return (
    <div className="bg-brand-dark min-h-screen text-gray-250 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-4 py-16 sm:py-24 text-center flex flex-col items-center relative overflow-hidden">
        {/* Decorative subtle background gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-light/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-medium/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-medium/30 border border-brand-medium/55 text-brand-light text-xs font-semibold mb-6 tracking-wide animate-pulse">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          Preparação Máxima para Provas Universitárias
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
          Estude de forma inteligente. Treine com <span className="text-brand-light">Simulados Interativos</span>.
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
          A plataforma completa com resumos dirigidos, banco de questões com gabarito para impressão e consultor de Inteligência Artificial para tirar dúvidas das disciplinas.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin' : '/student'}
              className="bg-brand-light hover:bg-white text-brand-dark px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 shadow-lg shadow-brand-light/10 transition-all duration-300 group"
            >
              Ir para o Painel de Estudos
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-brand-light hover:bg-white text-brand-dark px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 shadow-lg shadow-brand-light/10 transition-all duration-300 group"
              >
                Entrar no Portal
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => handleQuickAccess('basic')}
                className="bg-brand-medium/40 hover:bg-brand-medium/60 text-white border border-brand-medium/65 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300"
              >
                Experimentar Versão Grátis
              </button>
            </>
          )}
        </div>
      </section>

      {/* Core Features Section */}
      <section className="w-full max-w-7xl px-4 py-16 border-t border-brand-medium/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Tudo o que você precisa para gabaritar</h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto">Recursos desenvolvidos sob medida para otimizar suas horas de estudo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: Simulados */}
          <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl hover:border-brand-light/45 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-brand-medium/45 flex items-center justify-center text-brand-light mb-5 border border-brand-medium">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Simulados em Ciclos</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Responda a rodadas de 10 questões rápidas de múltipla escolha com feedback imediato de acertos e erros.
            </p>
          </div>

          {/* Card 2: BDQ */}
          <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl hover:border-brand-light/45 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-brand-medium/45 flex items-center justify-center text-brand-light mb-5 border border-brand-medium">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Banco de Questões (BDQ)</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Lista limpa mostrando apenas o enunciado e a resposta correta. Perfeito para imprimir e revisar de forma tradicional.
            </p>
          </div>

          {/* Card 3: Consultor de IA */}
          <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl hover:border-brand-light/45 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-brand-medium/45 flex items-center justify-center text-brand-light mb-5 border border-brand-medium">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tutor Jurídico de IA</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tire dúvidas instantaneamente no chat de IA que responde estritamente com base nos regulamentos e leis fornecidos.
            </p>
          </div>

          {/* Card 4: Resumos */}
          <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl hover:border-brand-light/45 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-brand-medium/45 flex items-center justify-center text-brand-light mb-5 border border-brand-medium">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resumos Autorizados</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Acesse PDFs focados nas principais disciplinas acadêmicas, liberados de acordo com sua necessidade e plano.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Section */}
      <section className="w-full max-w-7xl px-4 py-16 border-t border-brand-medium/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Compare nossos Planos</h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto">Escolha o nível de suporte que você precisa para progredir.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plano Básico */}
          <div className="bg-brand-medium/10 border border-brand-medium/40 p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
            <div>
              <span className="text-sm font-bold text-brand-light uppercase tracking-widest block mb-2">{basicPlan.name}</span>
              <div className="flex items-baseline text-white">
                <span className="text-4xl font-extrabold">Grátis</span>
              </div>
              <p className="mt-4 text-xs text-gray-400 leading-relaxed">Experimente a plataforma antes de assinar.</p>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>1 Quiz de Simulado por dia</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Ranking de desempenho</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Estatísticas básicas</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Histórico dos simulados realizados</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => handleQuickAccess('basic')}
              className="mt-8 w-full bg-brand-medium/30 hover:bg-brand-medium/60 text-white font-semibold py-2.5 rounded-xl border border-brand-medium transition-all"
            >
              Começar Agora
            </button>
          </div>

          {/* Plano Pro */}
          <div className="bg-brand-medium/25 border-2 border-brand-light/50 p-8 rounded-2xl flex flex-col justify-between relative hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-brand-light/5">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-light text-brand-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Popular
            </div>
            <div>
              <span className="text-sm font-bold text-brand-light uppercase tracking-widest block mb-2">{proPlan.name}</span>
              <div className="flex flex-col text-white">
                <div>
                  <span className="text-2xl font-semibold">R$</span>
                  <span className="text-4xl font-extrabold">{proPlan.priceMonthly?.toFixed(2).replace('.', ',')}</span>
                  <span className="text-xs text-gray-400">/mês</span>
                </div>
                <div className="text-[10px] text-brand-light font-bold mt-1">
                  ou R$ {proPlan.priceQuarterly?.toFixed(2).replace('.', ',')}/trimestre
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-300 leading-relaxed">Ideal para alunos que desejam reforçar disciplinas específicas.</p>
              
              <ul className="mt-6 space-y-2.5">
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Quiz de Simulados ilimitados</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Quiz de AV & BDQs das matérias contratadas</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Histórico completo & Estatísticas detalhadas</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>{proPlan.includedPremiumSummaries} Resumo Premium incluso</span>
                </li>
                <li className="flex items-start gap-2 text-xs font-bold text-brand-light border-t border-brand-medium/35 pt-2 mt-2">
                  <span>Limite: Até {proPlan.maxSubjects} disciplinas</span>
                </li>
                <li className="text-[9px] text-gray-400 leading-relaxed">
                  * Disciplinas escolhidas na assinatura. Sem trocas durante a vigência.
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => handleQuickAccess('pro')}
              className="mt-8 w-full bg-brand-light hover:bg-white text-brand-dark font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Assinar Plano Start
            </button>
          </div>

          {/* Plano Premium */}
          <div className="bg-brand-medium/10 border border-brand-medium/40 p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
            <div>
              <span className="text-sm font-bold text-brand-light uppercase tracking-widest block mb-2">{premiumPlan.name}</span>
              <div className="flex flex-col text-white">
                <div>
                  <span className="text-2xl font-semibold">R$</span>
                  <span className="text-4xl font-extrabold">{premiumPlan.priceMonthly?.toFixed(2).replace('.', ',')}</span>
                  <span className="text-xs text-gray-400">/mês</span>
                </div>
                <div className="text-[10px] text-brand-light font-bold mt-1">
                  ou R$ {premiumPlan.priceQuarterly?.toFixed(2).replace('.', ',')}/trimestre
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400 leading-relaxed">Plano recomendado para alunos que buscam maior cobertura durante o semestre.</p>
              
              <ul className="mt-6 space-y-2.5">
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Quiz de Simulados ilimitados</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Quiz de AV & BDQs das matérias contratadas</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>Histórico completo & Estatísticas detalhadas</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <CheckCircle className="text-brand-light w-4 h-4 shrink-0 mt-0.5" />
                  <span>{premiumPlan.includedPremiumSummaries} Resumos Premium inclusos</span>
                </li>
                <li className="flex items-start gap-2 text-xs font-bold text-brand-light border-t border-brand-medium/35 pt-2 mt-2">
                  <span>Limite: Até {premiumPlan.maxSubjects} disciplinas</span>
                </li>
                <li className="text-[9px] text-gray-400 leading-relaxed">
                  * Disciplinas escolhidas na assinatura. Sem trocas durante a vigência.
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => handleQuickAccess('premium')}
              className="mt-8 w-full bg-brand-medium/30 hover:bg-brand-medium/60 text-white font-semibold py-2.5 rounded-xl border border-brand-medium transition-all"
            >
              Obter Plano Aprovação
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-brand-dark border-t border-brand-medium/30 py-8 px-4 text-center text-xs text-gray-400 mt-auto">
        <p>&copy; {new Date().getFullYear()} Help EAD - Todos os direitos reservados.</p>
        <p className="mt-2 text-brand-light/75">Desenvolvido com foco em alta performance e gamificação de estudos.</p>
      </footer>
    </div>
  );
};
