# Proposta Comercial e Modelagem de Negócios
## Plataforma Help EAD

Este documento descreve as opções de contratação para o desenvolvimento da plataforma **Help EAD**, contemplando os modelos de **Venda Direta (Software Proprietário)** e **SaaS (Plataforma como Serviço)**, além de diferenciar os valores com e sem a integração de Inteligência Artificial.

---

### 1. Estimativa de Desenvolvimento e Implantação

O sistema será desenvolvido utilizando tecnologias modernas de alto desempenho: **React (Frontend)**, **Tailwind CSS (Interface)**, **TypeScript (Código)** e **Supabase (Banco de Dados, Autenticação, Armazenamento Seguro e APIs)**.

#### Opção A: Sem Integração com IA
*Foco na entrega de uma plataforma robusta, rápida e gamificada para estudos.*
*   **Escopo Principal:**
    *   **Painel Administrativo:** Gestão de cursos, matérias, biblioteca de resumos (PDF), cadastro de alunos e inserção manual/importação de quizzes.
    *   **Área do Aluno:** Visualização de matérias e materiais de apoio de acordo com a assinatura contratada.
    *   **Simulados Interativos (Quizzes):** Fluxo com ciclos fixos de 10 questões, correção em tempo real e regra de conclusão rígida (a rodada deve ser finalizada por completo para registrar os pontos).
    *   **Ranking Geral Gamificado:** Tabela de classificação baseada em pontos, totalmente integrada às regras de privacidade da LGPD (opção de participação explícita do aluno).
    *   **BDQ (Banco de Questões):** Página otimizada exibindo apenas perguntas e gabarito oficial com layout de impressão física amigável (CSS `@media print`).
    *   **Biblioteca Segura de Resumos:** Downloads de PDFs controlados por regras de acesso a nível de banco de dados (Row Level Security - RLS).
    *   **Central de Suporte:** Canal simples de "Fale Conosco" ligando os alunos diretamente ao painel administrativo.
*   **Prazo de Execução:** 4 semanas (30 dias).
*   **Custo de Desenvolvimento (Venda Direta):** **R$ 18.500,00**

#### Opção B: Com Integração com IA (Tutor Virtual Inteligente)
*Engloba todas as ferramentas da Opção A + o módulo de aprendizado semântico (RAG).*
*   **Diferencial de Escopo (Módulo de IA):**
    *   **Integração pgvector (Supabase):** Configuração de banco de dados vetorial para leitura inteligente de PDFs.
    *   **Ingestão Inteligente:** Painel administrativo capaz de receber apostilas, manuais de estudo, livros ou regulamentos acadêmicos.
    *   **Tutor Acadêmico com IA:** Chat interativo onde o aluno pode tirar dúvidas técnicas. A IA responderá usando **única e exclusivamente** a base de conhecimento de arquivos que o administrador carregou na plataforma.
    *   **Controles de Alucinação:** Diretrizes de segurança na API para garantir que a IA responda que "não sabe" ou "não possui autorização" para assuntos que fujam dos PDFs fornecidos.
*   **Prazo de Execução:** 6 semanas (45 dias).
*   **Custo de Desenvolvimento (Venda Direta):** **R$ 29.800,00**

---

### 2. Modelo de Negócio 1: Plano de Venda (Licença Proprietária)

Ideal para o cliente que deseja possuir a propriedade do código-fonte do sistema, efetuando o investimento em desenvolvimento como um ativo da empresa (CAPEX).

*   **Propriedade:** O código do software e o banco de dados são transferidos integralmente para a conta do Supabase e repositório do cliente.
*   **Condições de Pagamento:** 50% de sinal no fechamento do contrato e 50% na homologação e entrega do sistema rodando.
*   **Custos Recorrentes Pós-Entrega (Sob responsabilidade do cliente):**
    *   *Servidores/Hospedagem:* Supabase Free Tier (até ~100 alunos ativos simultâneos) ou Supabase Pro Tier (U$ 15/mês, aprox. **R$ 80,00/mês** para bases maiores).
    *   *Consumo da API de IA (se aplicável):* Pago por uso diretamente ao provedor da API do Gemini (média estimada de **R$ 40,00 a R$ 90,00/mês** com tráfego médio de até 300 alunos ativos).
    *   *Suporte & Manutenção (Opcional com o desenvolvedor):* **R$ 1.200,00/mês** (inclui correção de bugs, monitoramento ativo do servidor e banco de dados, backups periódicos extras e até 8 horas mensais de ajustes/pequenas melhorias).

---

### 3. Modelo de Negócio 2: Plano de SaaS (Plataforma como Serviço)

Ideal para o cliente que prefere mitigar o risco inicial de desenvolvimento e pagar uma taxa mensal recorrente pelo uso do sistema hospedado e gerenciado pelo desenvolvedor (OPEX).

*   **Propriedade:** O código-fonte permanece sob propriedade do desenvolvedor. A cliente adquire o direito de uso de uma instância customizada com a sua identidade visual e domínio próprio.
*   **Gestão:** O desenvolvedor cuida de toda a parte técnica, hospedagem, atualizações de infraestrutura e correção de bugs sem custos adicionais.

| Modelo Escolhido | Taxa de Ativação (Setup) | Mensalidade Recorrente | Benefícios Incluídos |
| :--- | :--- | :--- | :--- |
| **SaaS Sem IA** | R$ 3.000,00 *(pagamento único)* | **R$ 590,00/mês** | Hospedagem completa inclusa, backups diários, suporte a bugs e atualizações de segurança. |
| **SaaS Com IA** | R$ 4.500,00 *(pagamento único)* | **R$ 890,00/mês** | Tudo do plano anterior + custos de API e consumo de banco de dados vetorial de IA já embutidos no valor (limite de tráfego de até 500 alunos ativos). |

*   *Fidelidade mínima do contrato:* 12 meses.

---

### 4. Plano de Venda para os Alunos (Sugestão de Monetização da Cliente)

Abaixo, apresentamos uma estrutura de preços que a cliente pode aplicar para comercializar o portal aos estudantes e obter o retorno rápido do investimento (ROI):

#### Tabela de Preços Recomendada aos Estudantes:
1.  **Plano Gratuito (Básico):** Acesso a 3 rodadas de simulados de quizzes gerais por semana. Ideal para captação de cadastros e e-mails de potenciais assinantes.
2.  **Plano Pro (Sem IA):** **R$ 24,90/mês** ou **R$ 199,00/ano** à vista. Libera acesso irrestrito aos simulados de provas oficiais passadas e download/impressão de BDQs.
3.  **Plano Premium (Com IA):** **R$ 49,90/mês** ou **R$ 399,00/ano** à vista. Libera todas as funcionalidades do portal + Chat com Tutor de Inteligência Artificial para tirar dúvidas das matérias + download de resumos exclusivos.

#### Projeção de Ponto de Equilíbrio (Break-Even):

*   **Cenário SaaS Com IA (Custo mensal de R$ 890,00):**
    *   Com apenas **18 alunos** assinantes do Plano Premium (R$ 49,90/mês), a cliente cobre integralmente o custo de manutenção da plataforma.
    *   Com **100 alunos** ativos no Plano Premium:
        *   Faturamento Mensal da Cliente: **R$ 4.990,00**
        *   Custo do SaaS: **R$ 890,00**
        *   **Lucro Líquido Mensal: R$ 4.100,00 (Margem de 82%)**
    *   Com **350 alunos** ativos:
        *   Faturamento Mensal: **R$ 17.465,00**
        *   Lucro Líquido: **R$ 16.575,00/mês**

*   **Cenário Compra do Software Com IA (Investimento de R$ 29.800,00 + Suporte de R$ 1.200,00):**
    *   Se a cliente captar **75 alunos** que paguem a assinatura anual de **R$ 399,00**, ela fatura **R$ 29.925,00** à vista. Isso quita 100% do custo de desenvolvimento no primeiro mês, operando no azul a partir do segundo mês apenas cobrindo o custo fixo de suporte.
