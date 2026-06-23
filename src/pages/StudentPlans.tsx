import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, HelpCircle, MessageSquare } from 'lucide-react';

export const StudentPlans: React.FC = () => {
  const { studentProfile, plansConfig } = useAuth();
  const navigate = useNavigate();

  const currentPlan = studentProfile?.plan || 'basic';

  const basicPlan = plansConfig?.find(p => p.planType === 'basic') || {
    name: 'Gratuito',
    priceMonthly: 0,
    priceQuarterly: 0,
    maxSubjects: 0,
    includedPremiumSummaries: 0,
    additionalSubjectPrice: 0,
    additionalSummaryPrice: 0
  };
  const proPlan = plansConfig?.find(p => p.planType === 'pro') || {
    name: 'Start',
    priceMonthly: 39.90,
    priceQuarterly: 99.90,
    maxSubjects: 3,
    includedPremiumSummaries: 1,
    additionalSubjectPrice: 19.90,
    additionalSummaryPrice: 29.90
  };
  const premiumPlan = plansConfig?.find(p => p.planType === 'premium') || {
    name: 'Aprovação',
    priceMonthly: 69.90,
    priceQuarterly: 179.90,
    maxSubjects: 5,
    includedPremiumSummaries: 2,
    additionalSubjectPrice: 19.90,
    additionalSummaryPrice: 29.90
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-brand-light" size={24} />
          Planos e Valores
        </h2>
        <p className="text-gray-400 text-xs mt-1">
          Compare as vantagens dos nossos planos e escolha a melhor opção para acelerar seus estudos.
        </p>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Plano Gratuito */}
        <div className={`bg-brand-medium/10 border p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 ${
          currentPlan === 'basic' 
            ? 'border-brand-light shadow-lg shadow-brand-light/5 relative' 
            : 'border-brand-medium/40'
        }`}>
          {currentPlan === 'basic' && (
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-light text-brand-dark px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              Seu Plano Atual
            </div>
          )}
          <div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-2">{basicPlan.name}</span>
            <div className="flex items-baseline text-white">
              <span className="text-4xl font-extrabold">Grátis</span>
            </div>
            <p className="mt-4 text-xs text-gray-400 leading-relaxed">Experimente a plataforma antes de assinar.</p>
            
            <ul className="mt-6 space-y-2.5">
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
              <li className="flex items-start gap-2 text-xs font-bold text-brand-light border-t border-brand-medium/35 pt-2 mt-2">
                <span>Grade: Apenas simulado aberto</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-gray-400">
                <span>Matéria extra semestral: R$ {basicPlan.additionalSubjectPrice?.toFixed(2).replace('.', ',')}</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-gray-400">
                <span>Resumo avulso: R$ {basicPlan.additionalSummaryPrice?.toFixed(2).replace('.', ',')}</span>
              </li>
            </ul>
          </div>
          
          <button
            disabled
            className="mt-8 w-full bg-brand-medium/20 text-gray-450 font-semibold py-2.5 rounded-xl border border-brand-medium/30 transition-all text-xs cursor-default"
          >
            {currentPlan === 'basic' ? 'Ativo' : 'Plano Gratuito'}
          </button>
        </div>

        {/* Plano Start / Pro */}
        <div className={`bg-brand-medium/10 border p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative ${
          currentPlan === 'pro' 
            ? 'border-brand-light/70 shadow-lg shadow-brand-light/5' 
            : 'border-brand-medium/40'
        }`}>
          {currentPlan === 'pro' && (
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-light text-brand-dark px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              Seu Plano Atual
            </div>
          )}
          <div>
            <span className="text-sm font-bold text-brand-light uppercase tracking-widest block mb-2">{proPlan.name}</span>
            <div className="flex flex-col text-white">
              <div>
                <span className="text-2xl font-semibold">R$ </span>
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
                <span>Grade: Até {proPlan.maxSubjects} disciplinas</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-gray-400">
                <span>Matéria extra semestral: R$ {proPlan.additionalSubjectPrice?.toFixed(2).replace('.', ',')}</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-gray-400">
                <span>Resumo avulso: R$ {proPlan.additionalSummaryPrice?.toFixed(2).replace('.', ',')}</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={() => navigate('/student/support', {
              state: { message: `Olá! Gostaria de realizar a assinatura do Plano Start. Por favor, me envie as instruções de pagamento.` }
            })}
            className={`mt-8 w-full font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              currentPlan === 'pro'
                ? 'bg-brand-medium/30 border border-brand-medium text-white hover:bg-brand-medium/55'
                : 'bg-brand-light hover:bg-white text-brand-dark shadow-md shadow-brand-light/5'
            }`}
          >
            {currentPlan === 'pro' ? 'Solicitar Renovação' : 'Assinar Plano Start'}
          </button>
        </div>

        {/* Plano Aprovação / Premium */}
        <div className={`bg-brand-medium/10 border p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative ${
          currentPlan === 'premium' 
            ? 'border-brand-light/70 shadow-lg shadow-brand-light/5' 
            : 'border-brand-medium/40'
        }`}>
          {currentPlan === 'premium' && (
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-light text-brand-dark px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              Seu Plano Atual
            </div>
          )}
          <div>
            <span className="text-sm font-bold text-yellow-400 uppercase tracking-widest block mb-2">{premiumPlan.name}</span>
            <div className="flex flex-col text-white">
              <div>
                <span className="text-2xl font-semibold">R$ </span>
                <span className="text-4xl font-extrabold">{premiumPlan.priceMonthly?.toFixed(2).replace('.', ',')}</span>
                <span className="text-xs text-gray-400">/mês</span>
              </div>
              <div className="text-[10px] text-yellow-400 font-bold mt-1">
                ou R$ {premiumPlan.priceQuarterly?.toFixed(2).replace('.', ',')}/trimestre
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-300 leading-relaxed">Plano recomendado para alunos que buscam maior cobertura durante o semestre.</p>
            
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
                <span>Grade: Até {premiumPlan.maxSubjects} disciplinas</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-gray-400">
                <span>Matéria extra semestral: R$ {premiumPlan.additionalSubjectPrice?.toFixed(2).replace('.', ',')}</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-gray-400">
                <span>Resumo avulso: R$ {premiumPlan.additionalSummaryPrice?.toFixed(2).replace('.', ',')}</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={() => navigate('/student/support', {
              state: { message: `Olá! Gostaria de realizar a assinatura do Plano Aprovação. Por favor, me envie as instruções de pagamento.` }
            })}
            className={`mt-8 w-full font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              currentPlan === 'premium'
                ? 'bg-brand-medium/30 border border-brand-medium text-white hover:bg-brand-medium/55'
                : 'bg-brand-light hover:bg-white text-brand-dark shadow-md shadow-brand-light/5'
            }`}
          >
            {currentPlan === 'premium' ? 'Solicitar Renovação' : 'Assinar Plano Aprovação'}
          </button>
        </div>
      </div>

      {/* Como funciona o upgrade (fluxo manual) */}
      <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-brand-light" />
          <h3 className="font-bold text-sm text-white">Como realizar a assinatura ou upgrade?</h3>
        </div>
        <div className="text-xs text-gray-300 leading-relaxed space-y-2">
          <p>
            O Help EAD opera atualmente com liberação manual de assinaturas para maior comodidade e segurança:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-gray-400">
            <li>
              Escolha o plano ideal e entre em contato com a nossa administração ou clique no botão de suporte abaixo.
            </li>
            <li>
              Realize o pagamento por Pix ou outro meio acordado diretamente com a administração.
            </li>
            <li>
              O administrador ativará a liberação no painel do sistema Help EAD de forma imediata.
            </li>
            <li>
              Na próxima vez que você acessar a plataforma, seu novo plano já estará ativo com todos os benefícios desbloqueados!
            </li>
          </ol>
        </div>

        <div className="pt-2 flex justify-start">
          <button
            onClick={() => navigate('/student/support')}
            className="bg-brand-light hover:bg-white text-brand-dark px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare size={14} /> Falar com o Suporte / Administração
          </button>
        </div>
      </div>
    </div>
  );
};
