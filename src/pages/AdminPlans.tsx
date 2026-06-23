import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Shield, Zap, Award, Check, RefreshCw } from 'lucide-react';
import type { PlanConfig } from '../types';

export const AdminPlans: React.FC = () => {
  const { plansConfig, updatePlansConfig } = useAuth();
  const [localConfigs, setLocalConfigs] = useState<PlanConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (plansConfig && plansConfig.length > 0) {
      // Ordenar para garantir a ordem: basic (Gratuito), pro (Start), premium (Aprovação)
      const sorted = [...plansConfig].sort((a, b) => {
        const order: { [key: string]: number } = { basic: 1, pro: 2, premium: 3 };
        return (order[a.planType] || 0) - (order[b.planType] || 0);
      });
      setLocalConfigs(sorted);
    }
  }, [plansConfig]);

  const formatCurrencyInput = (valStr: string): number => {
    const cleanValue = valStr.replace(/\D/g, '');
    if (!cleanValue) return 0;
    return parseInt(cleanValue, 10) / 100;
  };

  const handleInputChange = (
    index: number,
    field: keyof PlanConfig,
    value: string | number
  ) => {
    const updated = [...localConfigs];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setLocalConfigs(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      await updatePlansConfig(localConfigs);
      setSuccessMsg('Configurações de planos salvas com sucesso!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      // Erro tratado globalmente pelo AuthContext
    } finally {
      setIsSaving(false);
    }
  };

  if (localConfigs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-xs">
        <RefreshCw className="animate-spin mr-2" size={16} /> Carregando configurações dos planos...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="text-brand-light" size={24} />
          Configurações de Planos e Preços
        </h2>
        <p className="text-gray-400 text-xs mt-1">
          Gerencie os valores de assinatura, limites de disciplinas e preços de recursos avulsos.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-950/20 border border-green-500/35 text-green-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <Check size={16} className="text-green-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {localConfigs.map((config, idx) => {
            const isBasic = config.planType === 'basic';
            const Icon = isBasic ? Shield : config.planType === 'pro' ? Zap : Award;
            const iconColor = isBasic ? 'text-gray-400' : config.planType === 'pro' ? 'text-brand-light' : 'text-yellow-400';
            const borderColor = isBasic ? 'border-brand-medium/30' : config.planType === 'pro' ? 'border-brand-light/30' : 'border-yellow-500/20';
            const bgHeader = isBasic ? 'bg-gray-950/20' : config.planType === 'pro' ? 'bg-brand-medium/20' : 'bg-yellow-950/10';

            return (
              <div
                key={config.id}
                className={`bg-brand-medium/10 border ${borderColor} rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between`}
              >
                {/* Header */}
                <div className={`p-4 ${bgHeader} border-b ${borderColor} flex items-center gap-3`}>
                  <div className={`w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center ${iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => handleInputChange(idx, 'name', e.target.value)}
                      className="font-bold text-sm bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-white w-full"
                      placeholder="Nome do Plano"
                      required
                    />
                    <span className="text-[9px] text-gray-450 uppercase block">Tipo: {config.planType}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 text-xs">
                  {/* Preços */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-brand-light text-[10px] uppercase tracking-wider">Assinatura</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1 text-[10px]">Preço Mensal</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-450 text-[10px]">R$</span>
                          <input
                            type="text"
                            disabled={isBasic}
                            value={config.priceMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onChange={(e) => handleInputChange(idx, 'priceMonthly', formatCurrencyInput(e.target.value))}
                            className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none disabled:opacity-50"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 text-[10px]">Preço Trimestral</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-450 text-[10px]">R$</span>
                          <input
                            type="text"
                            disabled={isBasic}
                            value={config.priceQuarterly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onChange={(e) => handleInputChange(idx, 'priceQuarterly', formatCurrencyInput(e.target.value))}
                            className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none disabled:opacity-50"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-brand-medium/20" />

                  {/* Limites */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-brand-light text-[10px] uppercase tracking-wider">Limites & Benefícios</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1 text-[10px]">Disciplinas Inclusas</label>
                        <input
                          type="number"
                          min="0"
                          disabled={isBasic}
                          value={config.maxSubjects}
                          onChange={(e) => handleInputChange(idx, 'maxSubjects', parseInt(e.target.value) || 0)}
                          className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none disabled:opacity-50"
                          required
                        />
                        <span className="text-[9px] text-gray-500 block mt-0.5">0 = simulado aberto</span>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 text-[10px]">Resumos Inclusos</label>
                        <input
                          type="number"
                          min="0"
                          disabled={isBasic}
                          value={config.includedPremiumSummaries}
                          onChange={(e) => handleInputChange(idx, 'includedPremiumSummaries', parseInt(e.target.value) || 0)}
                          className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none disabled:opacity-50"
                          required
                        />
                        <span className="text-[9px] text-gray-500 block mt-0.5">Qtd. de resumos liberados</span>
                      </div>
                    </div>
                  </div>

                  {!isBasic && (
                    <>
                      <hr className="border-brand-medium/20" />

                      {/* Adicionais */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-brand-light text-[10px] uppercase tracking-wider">Valores Adicionais</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-400 mb-1 text-[10px]">Matéria Extra (Semestral)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-450 text-[10px]">R$</span>
                              <input
                                type="text"
                                value={config.additionalSubjectPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                onChange={(e) => handleInputChange(idx, 'additionalSubjectPrice', formatCurrencyInput(e.target.value))}
                                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-400 mb-1 text-[10px]">Resumo Avulso (Unid.)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-450 text-[10px]">R$</span>
                              <input
                                type="text"
                                value={config.additionalSummaryPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                onChange={(e) => handleInputChange(idx, 'additionalSummaryPrice', formatCurrencyInput(e.target.value))}
                                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-brand-light hover:bg-white text-brand-dark px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? 'Gravando Alterações...' : 'Salvar Alterações de Planos'}
          </button>
        </div>
      </form>
    </div>
  );
};
