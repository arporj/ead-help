import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, StudentProfile, Course, Subject, Summary, Question, SupportMessage, AIKnowledgeFile, SystemUser } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  students: { user: User; profile: StudentProfile }[];
  courses: Course[];
  subjects: Subject[];
  summaries: Summary[];
  questions: Question[];
  supportMessages: SupportMessage[];
  aiKnowledgeFiles: AIKnowledgeFile[];
  systemUsers: SystemUser[];
  globalError: string | null;
  loading: boolean;
  clearGlobalError: () => void;
  loginAs: (roleOrEmail: string) => Promise<void>;
  logout: () => Promise<void>;
  updateStudentPlan: (studentId: string, plan: 'basic' | 'pro' | 'premium') => Promise<void>;
  toggleSummaryAccess: (studentId: string, summaryId: string) => Promise<void>;
  updateStudentSummaryAccess: (studentId: string, summaryIds: string[]) => Promise<void>;
  toggleAiAccess: (studentId: string) => Promise<void>;
  addQuestion: (question: Omit<Question, 'id'>) => Promise<void>;
  addSummary: (summary: Omit<Summary, 'id' | 'pdfUrl'>, file?: File) => Promise<void>;
  deleteSummary: (id: string) => Promise<void>;
  updateSummary: (id: string, summary: Partial<Omit<Summary, 'id' | 'pdfUrl'>>, file?: File) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  updateQuestion: (id: string, question: Omit<Question, 'id'>) => Promise<void>;
  addCourse: (name: string) => Promise<void>;
  addSubject: (name: string, courseId: string, semester: number) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  updateCourse: (id: string, name: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  updateSubject: (id: string, name: string, semester: number) => Promise<void>;
  deleteSummariesBySubject: (subjectId: string) => Promise<void>;
  deleteQuestionsBySubject: (subjectId: string) => Promise<void>;
  clearCourseContent: (courseId: string) => Promise<void>;
  addAiFile: (fileName: string, fileSize: string) => Promise<void>;
  removeAiFile: (id: string) => Promise<void>;
  sendSupportMessage: (message: string) => Promise<void>;
  respondSupportMessage: (id: string, response: string) => Promise<void>;
  addStudentPoints: (points: number) => void;
  addExamCycle: (subjectId: string, correctAnswers: number, totalQuestions: number) => Promise<void>;
  toggleLgpdConsent: () => Promise<void>;
  addSystemUser: (email: string, fullName: string) => Promise<void>;
  removeSystemUser: (email: string) => Promise<void>;
  transferSupraStatus: (newSupraEmail: string) => Promise<void>;
  isImpersonating: boolean;
  impersonatorEmail: string | null;
  stopImpersonating: () => void;
  plansConfig: PlanConfig[];
  updatePlansConfig: (configs: PlanConfig[]) => Promise<void>;
  saveStudentSubjects: (subjectIds: string[]) => Promise<void>;
  saveStudentSubjectsByAdmin: (studentId: string, subjectIds: string[], additionalSubjectIds: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [realUser, setRealUser] = useState<User | null>(null);
  const [realStudentProfile, setRealStudentProfile] = useState<StudentProfile | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [impersonatedStudentProfile, setImpersonatedStudentProfile] = useState<StudentProfile | null>(null);
  const [impersonatorEmail, setImpersonatorEmail] = useState<string | null>(null);

  const user = impersonatedUser || realUser;
  const studentProfile = impersonatedStudentProfile || realStudentProfile;
  const isImpersonating = impersonatedUser !== null;

  const [plansConfig, setPlansConfig] = useState<PlanConfig[]>([]);
  const [students, setStudents] = useState<{ user: User; profile: StudentProfile }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [aiKnowledgeFiles, setAiKnowledgeFiles] = useState<AIKnowledgeFile[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearGlobalError = () => setGlobalError(null);

  const handleError = (actionName: string, error: any) => {
    console.error(`Erro em ${actionName}:`, error);
    const message = error?.message || 'Ocorreu uma falha inesperada.';
    let friendlyMessage = `Erro ao realizar a operação (${actionName}): ${message}`;
    
    if (message.includes('row-level security') || message.includes('policy') || message.includes('violates')) {
      friendlyMessage = `Você não tem permissão para realizar esta ação (${actionName}). Por favor, verifique seu nível de acesso ou entre em contato com suporte@helpead.com.br.`;
    } else if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      friendlyMessage = `Erro de conexão. Verifique sua conexão de internet e tente novamente. Se o problema persistir, fale com suporte@helpead.com.br.`;
    }
    
    setGlobalError(friendlyMessage);
  };

  // Carrega todos os dados do Supabase
  const loadData = async (userId: string, userRole: 'admin' | 'student') => {
    try {
      // Configuração de Planos
      const { data: plansData } = await supabase.from('plans_config').select('*');
      if (plansData) {
        setPlansConfig(plansData.map(p => ({
          id: p.id,
          planType: p.plan_type as 'basic' | 'pro' | 'premium',
          name: p.name,
          priceMonthly: Number(p.price_monthly),
          priceQuarterly: Number(p.price_quarterly),
          maxSubjects: p.max_subjects,
          includedPremiumSummaries: p.included_premium_summaries,
          additionalSubjectPrice: Number(p.additional_subject_price),
          additionalSummaryPrice: Number(p.additional_summary_price),
        })));
      }

      // Cursos e Disciplinas
      const { data: coursesData } = await supabase.from('courses').select('*');
      const { data: subjectsData } = await supabase.from('subjects').select('*');
      if (coursesData) setCourses(coursesData);
      if (subjectsData) {
        const sortedSubjects = subjectsData.map(s => ({
          id: s.id,
          courseId: s.course_id,
          name: s.name,
          semester: s.semester
        })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        setSubjects(sortedSubjects);
      }

      // Resumos
      const { data: summariesData } = await supabase.from('summaries').select('*');
      if (summariesData) {
        setSummaries(summariesData.map(s => ({
          id: s.id,
          subjectId: s.subject_id,
          title: s.title,
          description: s.description || '',
          pdfUrl: s.pdf_url,
          isPremium: s.is_premium
        })));
      }

      // Questões
      const { data: questionsData } = await supabase.from('questions').select('*');
      if (questionsData) {
        setQuestions(questionsData.map(q => ({
          id: q.id,
          subjectId: q.subject_id,
          prompt: q.prompt,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswerIndex: q.correct_answer_index,
          isProOrPremium: q.is_pro_or_premium,
          type: q.type
        })));
      }

      // Arquivos de Conhecimento da IA
      const { data: aiFilesData } = await supabase.from('ai_knowledge_files').select('*');
      if (aiFilesData) {
        setAiKnowledgeFiles(aiFilesData.map(f => ({
          id: f.id,
          fileName: f.name,
          fileSize: 'N/A',
          uploadedAt: f.created_at
        })));
      }

      // Mensagens de Suporte
      if (userRole === 'admin') {
        const { data: msgs } = await supabase
          .from('support_messages')
          .select('*, students(profiles(full_name))')
          .order('created_at', { ascending: false });

        if (msgs) {
          setSupportMessages(msgs.map(m => ({
            id: m.id,
            studentId: m.student_id,
            studentName: m.students?.profiles?.full_name || 'Estudante',
            message: m.message,
            response: m.response,
            createdAt: m.created_at
          })));
        }
      } else {
        const { data: msgs } = await supabase
          .from('support_messages')
          .select('*, students(profiles(full_name))')
          .eq('student_id', userId)
          .order('created_at', { ascending: false });

        if (msgs) {
          setSupportMessages(msgs.map(m => ({
            id: m.id,
            studentId: m.student_id,
            studentName: m.students?.profiles?.full_name || 'Estudante',
            message: m.message,
            response: m.response,
            createdAt: m.created_at
          })));
        }
      }

      // Se for Admin, carregar todos os estudantes cadastrados e usuários de sistema
      if (userRole === 'admin') {
        const { data: systemUsersData } = await supabase
          .from('system_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (systemUsersData) {
          setSystemUsers(systemUsersData.map(su => ({
            email: su.email,
            id: su.id,
            fullName: su.full_name,
            permissions: typeof su.permissions === 'object' && su.permissions !== null ? su.permissions as { [key: string]: boolean } : { all: true },
            isSurpa: su.is_supra,
            isSupra: su.is_supra,
            createdAt: su.created_at
          })));
        }

        const { data: allStudents } = await supabase
          .from('students')
          .select('*, profiles(email, full_name)');
        
        if (allStudents) {
          const { data: allSessions } = await supabase
            .from('quiz_sessions')
            .select('*, subjects(name)')
            .eq('is_completed', true);
          
          const { data: allAccess } = await supabase
            .from('summary_access')
            .select('*');

          const { data: allAiAccess } = await supabase
            .from('ai_consultant_access')
            .select('*');

          const { data: allStudentSubjects } = await supabase
            .from('student_subjects')
            .select('*');

          setStudents(allStudents.map(s => {
            const studentSessions = (allSessions || []).filter(se => se.student_id === s.id);
            const examCycles = studentSessions.map(se => ({
              id: se.id,
              subjectName: se.subjects?.name || 'Simulado Geral',
              correctAnswers: se.score || 0,
              totalQuestions: 10,
              percentage: (se.score || 0) * 10,
              completedAt: se.completed_at || se.started_at
            }));
            const rankingPoints = examCycles.reduce((acc, curr) => acc + (curr.correctAnswers * 10), 0);
            const summaryAccess = (allAccess || []).filter(a => a.student_id === s.id).map(a => a.summary_id);
            const summaryAccessDetails = (allAccess || []).filter(a => a.student_id === s.id).map(a => ({
              summaryId: a.summary_id,
              accessType: (a.access_type || 'admin') as 'admin' | 'benefit' | 'purchased'
            }));
            const aiConsultantAccess = (allAiAccess || []).some(a => a.student_id === s.id);
            const studentSubjects = (allStudentSubjects || []).filter(ss => ss.student_id === s.id).map(ss => ({
              id: ss.id,
              studentId: ss.student_id,
              subjectId: ss.subject_id,
              isAdditional: ss.is_additional,
              createdAt: ss.created_at
            }));

            return {
              user: {
                id: s.id,
                email: s.profiles?.email || '',
                name: s.profiles?.full_name || 'Estudante',
                role: 'student'
              },
              profile: {
                id: s.id,
                userId: s.id,
                plan: s.plan as 'basic' | 'pro' | 'premium',
                lgpdRankingConsent: s.lgpd_ranking_consent,
                rankingPoints,
                summaryAccess,
                summaryAccessDetails,
                aiConsultantAccess,
                examCycles,
                studentSubjects
              }
            };
          }));
        }
      }
    } catch (e) {
      handleError('Carregar Dados', e);
    }
  };

  const handleSessionChange = async (session: any) => {
    if (!session) {
      setRealUser(null);
      setRealStudentProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const suUser = session.user;

      // Buscar perfil
      let profile = null;
      let profileErr = null;

      // Primeira tentativa de busca
      const res1 = await supabase
        .from('profiles')
        .select('*')
        .eq('id', suUser.id)
        .maybeSingle();

      profile = res1.data;
      profileErr = res1.error;

      // Se falhar ou não encontrar e a sessão for válida, tentar novamente após 150ms (latência Supabase Client/RLS)
      if ((profileErr || !profile) && session) {
        console.warn('Perfil não encontrado na primeira tentativa, tentando novamente em 150ms...');
        await new Promise(resolve => setTimeout(resolve, 150));
        const res2 = await supabase
          .from('profiles')
          .select('*')
          .eq('id', suUser.id)
          .maybeSingle();
        profile = res2.data;
        profileErr = res2.error;
      }

      if (profileErr || !profile) {
        console.error('Perfil não encontrado para o usuário:', suUser.id);
        setRealUser(null);
        setRealStudentProfile(null);
        return;
      }

      let isSupra = false;
      if (profile.role === 'admin') {
        const { data: adminInfo } = await supabase
          .from('system_users')
          .select('is_supra')
          .eq('id', suUser.id)
          .maybeSingle();
        if (adminInfo) {
          isSupra = adminInfo.is_supra;
        }
      }

      const appUser: User = {
        id: suUser.id,
        email: suUser.email || '',
        name: profile.full_name || suUser.email || '',
        role: profile.role as 'admin' | 'student',
        isSupra
      };

      setRealUser(appUser);

      // Se for estudante, buscar dados adicionais do plano e LGPD
      if (profile.role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', suUser.id)
          .single();

        if (student) {
          const { data: sessions } = await supabase
            .from('quiz_sessions')
            .select('*, subjects(name)')
            .eq('student_id', suUser.id)
            .eq('is_completed', true);

          const examCycles = (sessions || []).map(s => ({
            id: s.id,
            subjectName: s.subjects?.name || 'Simulado Geral',
            correctAnswers: s.score || 0,
            totalQuestions: 10,
            percentage: (s.score || 0) * 10,
            completedAt: s.completed_at || s.started_at
          }));

          const rankingPoints = examCycles.reduce((acc, curr) => acc + (curr.correctAnswers * 10), 0);

          const { data: access } = await supabase
            .from('summary_access')
            .select('*')
            .eq('student_id', suUser.id);
          const summaryAccess = (access || []).map(a => a.summary_id);
          const summaryAccessDetails = (access || []).map(a => ({
            summaryId: a.summary_id,
            accessType: (a.access_type || 'admin') as 'admin' | 'benefit' | 'purchased'
          }));

          const { data: aiAccess } = await supabase
            .from('ai_consultant_access')
            .select('*')
            .eq('student_id', suUser.id)
            .maybeSingle();
          const aiConsultantAccess = !!aiAccess;

          const { data: subjs } = await supabase
            .from('student_subjects')
            .select('*')
            .eq('student_id', suUser.id);
          const studentSubjects = (subjs || []).map(ss => ({
            id: ss.id,
            studentId: ss.student_id,
            subjectId: ss.subject_id,
            isAdditional: ss.is_additional,
            createdAt: ss.created_at
          }));

          setRealStudentProfile({
            id: suUser.id,
            userId: suUser.id,
            plan: student.plan as 'basic' | 'pro' | 'premium',
            lgpdRankingConsent: student.lgpd_ranking_consent,
            rankingPoints,
            summaryAccess,
            summaryAccessDetails,
            aiConsultantAccess,
            examCycles,
            studentSubjects
          });
        }
      } else {
        setRealStudentProfile(null);
      }

      // Carregar as outras listas
      await loadData(suUser.id, profile.role);
    } catch (e) {
      console.error('Erro no processamento da sessão:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obter sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session);
    });

    // Escutar alterações
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Monitoramento de inatividade do usuário (Expiração em 2 horas)
  useEffect(() => {
    if (!realUser) {
      localStorage.removeItem('eadhelp_last_activity');
      return;
    }

    // Registrar atividade inicial
    localStorage.setItem('eadhelp_last_activity', Date.now().toString());

    const updateActivity = () => {
      localStorage.setItem('eadhelp_last_activity', Date.now().toString());
    };

    // Eventos de interação humana a serem monitorados
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Verificação periódica a cada 10 segundos
    const intervalId = setInterval(() => {
      const lastActivityStr = localStorage.getItem('eadhelp_last_activity');
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        const now = Date.now();
        const diffMs = now - lastActivity;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours >= 2) {
          console.log('Sessão expirada por inatividade de 2 horas.');
          logout();
        }
      }
    }, 10000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(intervalId);
    };
  }, [realUser]);

  const getMockStudent = (emailStr: string): { user: User; profile: StudentProfile } | null => {
    const lowerEmail = emailStr.toLowerCase();
    let nameStr = '';
    let planStr: 'basic' | 'pro' | 'premium' = 'basic';
    let mockId = '';

    if (lowerEmail.includes('joao')) {
      mockId = 'mock-joao-id';
      nameStr = 'João Silva (Simulação)';
      planStr = 'basic';
    } else if (lowerEmail.includes('maria')) {
      mockId = 'mock-maria-id';
      nameStr = 'Maria Santos (Simulação)';
      planStr = 'pro';
    } else if (lowerEmail.includes('carlos')) {
      mockId = 'mock-carlos-id';
      nameStr = 'Carlos Oliveira (Simulação)';
      planStr = 'premium';
    } else {
      return null;
    }

    return {
      user: {
        id: mockId,
        email: lowerEmail,
        name: nameStr,
        role: 'student'
      },
      profile: {
        id: mockId,
        userId: mockId,
        plan: planStr,
        lgpdRankingConsent: true,
        rankingPoints: 150,
        summaryAccess: [],
        aiConsultantAccess: planStr === 'premium' || planStr === 'pro',
        examCycles: [
          {
            id: 'mock-cycle-1',
            subjectName: 'Direito Constitucional',
            correctAnswers: 8,
            totalQuestions: 10,
            percentage: 80,
            completedAt: new Date().toISOString()
          }
        ]
      }
    };
  };

  const stopImpersonating = () => {
    setImpersonatedUser(null);
    setImpersonatedStudentProfile(null);
    setImpersonatorEmail(null);
    localStorage.removeItem('eadhelp_impersonated_email');
    localStorage.removeItem('eadhelp_impersonator_email');
  };

  // Reatividade para atualizar o perfil impersonado caso a base de estudantes mude
  useEffect(() => {
    if (realUser?.role === 'admin' && impersonatedUser) {
      const found = students.find(s => s.user.id === impersonatedUser.id);
      if (found) {
        let expectedPlan: 'basic' | 'pro' | 'premium' = 'basic';
        if (found.user.email.toLowerCase().includes('maria')) expectedPlan = 'pro';
        else if (found.user.email.toLowerCase().includes('carlos')) expectedPlan = 'premium';
        else expectedPlan = found.profile.plan;

        const adjustedProfile = {
          ...found.profile,
          plan: expectedPlan,
          aiConsultantAccess: expectedPlan === 'premium' ? true : found.profile.aiConsultantAccess
        };

        setImpersonatedStudentProfile(adjustedProfile);
        setImpersonatedUser(found.user);
      }
    }
  }, [students, impersonatedUser, realUser]);

  // Restaurar impersonação do localStorage no carregamento inicial
  useEffect(() => {
    if (realUser?.role === 'admin' && students.length > 0 && !impersonatedUser) {
      const impEmail = localStorage.getItem('eadhelp_impersonated_email');
      if (impEmail) {
        const found = students.find(s => s.user.email.toLowerCase() === impEmail.toLowerCase());
        
        let expectedPlan: 'basic' | 'pro' | 'premium' = 'basic';
        if (impEmail.toLowerCase().includes('maria')) expectedPlan = 'pro';
        else if (impEmail.toLowerCase().includes('carlos')) expectedPlan = 'premium';

        if (found) {
          const adjustedProfile = {
            ...found.profile,
            plan: expectedPlan,
            aiConsultantAccess: expectedPlan === 'premium' ? true : found.profile.aiConsultantAccess
          };
          setImpersonatedUser(found.user);
          setImpersonatedStudentProfile(adjustedProfile);
          setImpersonatorEmail(realUser.email);
        } else {
          const mock = getMockStudent(impEmail);
          if (mock) {
            setImpersonatedUser(mock.user);
            setImpersonatedStudentProfile(mock.profile);
            setImpersonatorEmail(realUser.email);
          }
        }
      }
    }
  }, [realUser, students]);

  // Login de simulação adaptado ao Supabase com impersonação local
  const loginAs = async (roleOrEmail: string) => {
    let email = '';
    let name = '';
    let isPredefinedRole = true;

    if (roleOrEmail === 'admin') {
      email = 'admin@eadhelp.com';
      name = 'Administrador EAD Help';
    } else if (roleOrEmail === 'basic') {
      email = 'joao@email.com';
      name = 'João Silva';
    } else if (roleOrEmail === 'pro') {
      email = 'maria@email.com';
      name = 'Maria Santos';
    } else if (roleOrEmail === 'premium') {
      email = 'carlos@email.com';
      name = 'Carlos Oliveira';
    } else {
      // E-mail real arbitrário digitado
      email = roleOrEmail.trim().toLowerCase();
      name = email.split('@')[0];
      isPredefinedRole = false;
    }

    // Se já estiver logado como Admin e a solicitação for outro usuário (Impersonation)
    if (realUser?.role === 'admin' && roleOrEmail !== 'admin') {
      const found = students.find(s => s.user.email.toLowerCase() === email.toLowerCase());
      
      let expectedPlan: 'basic' | 'pro' | 'premium' = 'basic';
      if (email.toLowerCase().includes('maria')) expectedPlan = 'pro';
      else if (email.toLowerCase().includes('carlos')) expectedPlan = 'premium';

      if (found) {
        // Atualizar o plano no banco em segundo plano para consistência
        if (found.profile.plan !== expectedPlan) {
          supabase
            .from('students')
            .update({ plan: expectedPlan })
            .eq('id', found.user.id)
            .then(() => {
              loadData(realUser.id, realUser.role);
            });
        }

        const adjustedProfile = {
          ...found.profile,
          plan: expectedPlan,
          aiConsultantAccess: expectedPlan === 'premium' ? true : found.profile.aiConsultantAccess
        };

        setImpersonatedUser(found.user);
        setImpersonatedStudentProfile(adjustedProfile);
        setImpersonatorEmail(realUser.email);
        localStorage.setItem('eadhelp_impersonated_email', found.user.email);
        localStorage.setItem('eadhelp_impersonator_email', realUser.email);
      } else {
        const mock = getMockStudent(email);
        if (mock) {
          setImpersonatedUser(mock.user);
          setImpersonatedStudentProfile(mock.profile);
          setImpersonatorEmail(realUser.email);
          localStorage.setItem('eadhelp_impersonated_email', mock.user.email);
          localStorage.setItem('eadhelp_impersonator_email', realUser.email);
        } else {
          // Se for e-mail arbitrário e não for João/Maria/Carlos, criar mock genérico
          const genId = 'mock-gen-' + Math.random().toString(36).substring(2, 9);
          const genMock = {
            user: { id: genId, email, name, role: 'student' as const },
            profile: { id: genId, userId: genId, plan: 'basic' as const, lgpdRankingConsent: true, rankingPoints: 0, summaryAccess: [], aiConsultantAccess: false, examCycles: [] }
          };
          setImpersonatedUser(genMock.user);
          setImpersonatedStudentProfile(genMock.profile);
          setImpersonatorEmail(realUser.email);
          localStorage.setItem('eadhelp_impersonated_email', genMock.user.email);
          localStorage.setItem('eadhelp_impersonator_email', realUser.email);
        }
      }
      return;
    }

    // Se a solicitação for retornar para admin e já estamos impersonando
    if (roleOrEmail === 'admin' && impersonatedUser) {
      stopImpersonating();
      return;
    }

    const password = 'TestPassword123!';

    // Tentar login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          throw new Error('Confirmação de e-mail pendente no Supabase. Para corrigir: no painel do Supabase, acesse "Authentication" -> "Providers" -> "Email" e desmarque a opção "Confirm email" para permitir login sem confirmação real.');
        }

        // Se não existir, cadastramos
        if (error.message.includes('Invalid login credentials') || error.message.includes('User not found')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              }
            }
          });

          if (signUpError) {
            if (signUpError.message.includes('Email not confirmed') || signUpError.message.includes('email_not_confirmed')) {
              throw new Error('Confirmação de e-mail pendente no Supabase. Para corrigir: no painel do Supabase, acesse "Authentication" -> "Providers" -> "Email" e desmarque a opção "Confirm email" para permitir login sem confirmação real.');
            }
            throw signUpError;
          }

          // Fazer login logo em seguida
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            if (signInErr.message.includes('Email not confirmed') || signInErr.message.includes('email_not_confirmed')) {
              throw new Error('Confirmação de e-mail pendente no Supabase. Para corrigir: no painel do Supabase, acesse "Authentication" -> "Providers" -> "Email" e desmarque a opção "Confirm email" para permitir login sem confirmação real.');
            }
            throw signInErr;
          }

          // Se for estudante e role predefinida de plano, atualizar o plano
          if (isPredefinedRole && roleOrEmail !== 'admin' && roleOrEmail !== 'basic' && signInData.user) {
            await supabase
              .from('students')
              .update({ plan: roleOrEmail })
              .eq('id', signInData.user.id);
          }
        } else {
          throw error;
        }
      } else if (data.user && isPredefinedRole && roleOrEmail !== 'admin') {
        // Se já existia, garantir que o plano no banco bata com a simulação do botão
        await supabase
          .from('students')
          .update({ plan: roleOrEmail })
          .eq('id', data.user.id);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Email not confirmed') || err.message.includes('email_not_confirmed'))) {
        throw new Error('Confirmação de e-mail pendente no Supabase. Para corrigir: no painel do Supabase, acesse "Authentication" -> "Providers" -> "Email" e desmarque a opção "Confirm email" para permitir login sem confirmação real.');
      }
      throw err;
    }
  };

  const logout = async () => {
    stopImpersonating();
    await supabase.auth.signOut();
  };

  // Funções Administrativas
  const updateStudentPlan = async (studentId: string, plan: 'basic' | 'pro' | 'premium') => {
    const { error } = await supabase
      .from('students')
      .update({ plan })
      .eq('id', studentId);
    if (error) {
      handleError('Atualizar Plano do Estudante', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const updatePlansConfig = async (configs: PlanConfig[]) => {
    try {
      for (const config of configs) {
        const { error } = await supabase
          .from('plans_config')
          .update({
            name: config.name,
            price_monthly: config.priceMonthly,
            price_quarterly: config.priceQuarterly,
            max_subjects: config.maxSubjects,
            included_premium_summaries: config.includedPremiumSummaries,
            additional_subject_price: config.additionalSubjectPrice,
            additional_summary_price: config.additionalSummaryPrice,
            updated_at: new Date().toISOString()
          })
          .eq('plan_type', config.planType);
        
        if (error) throw error;
      }
      if (user) await loadData(user.id, user.role);
    } catch (error) {
      handleError('Atualizar Preços dos Planos', error);
      throw error;
    }
  };

  const saveStudentSubjects = async (subjectIds: string[]) => {
    if (!user) return;
    try {
      const { error: deleteErr } = await supabase
        .from('student_subjects')
        .delete()
        .eq('student_id', user.id)
        .eq('is_additional', false);
      
      if (deleteErr) throw deleteErr;

      if (subjectIds.length > 0) {
        const inserts = subjectIds.map(sid => ({
          student_id: user.id,
          subject_id: sid,
          is_additional: false
        }));
        
        const { error: insertErr } = await supabase
          .from('student_subjects')
          .insert(inserts);
        
        if (insertErr) throw insertErr;
      }
      
      await loadData(user.id, user.role);
    } catch (error) {
      handleError('Salvar Grade de Disciplinas', error);
      throw error;
    }
  };

  const saveStudentSubjectsByAdmin = async (studentId: string, subjectIds: string[], additionalSubjectIds: string[]) => {
    try {
      const { error: deleteErr } = await supabase
        .from('student_subjects')
        .delete()
        .eq('student_id', studentId);
      
      if (deleteErr) throw deleteErr;

      const inserts: any[] = [];
      
      subjectIds.forEach(sid => {
        inserts.push({
          student_id: studentId,
          subject_id: sid,
          is_additional: false
        });
      });

      additionalSubjectIds.forEach(sid => {
        inserts.push({
          student_id: studentId,
          subject_id: sid,
          is_additional: true
        });
      });

      if (inserts.length > 0) {
        const { error: insertErr } = await supabase
          .from('student_subjects')
          .insert(inserts);
        
        if (insertErr) throw insertErr;
      }

      if (user) await loadData(user.id, user.role);
    } catch (error) {
      handleError('Salvar Grade de Disciplinas (Admin)', error);
      throw error;
    }
  };

  const toggleSummaryAccess = async (studentId: string, summaryId: string) => {
    const { data: existing } = await supabase
      .from('summary_access')
      .select('*')
      .eq('student_id', studentId)
      .eq('summary_id', summaryId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('summary_access')
        .delete()
        .eq('student_id', studentId)
        .eq('summary_id', summaryId);
      if (error) {
        handleError('Revogar Acesso ao Resumo', error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('summary_access')
        .insert({
          student_id: studentId,
          summary_id: summaryId,
          granted_by: user?.id
        });
      if (error) {
        handleError('Conceder Acesso ao Resumo', error);
        throw error;
      }
    }
    if (user) await loadData(user.id, user.role);
  };

  const updateStudentSummaryAccess = async (studentId: string, summaryIds: string[]) => {
    const { error: deleteErr } = await supabase
      .from('summary_access')
      .delete()
      .eq('student_id', studentId);
    
    if (deleteErr) {
      handleError('Limpar Acessos a Resumos', deleteErr);
      throw deleteErr;
    }

    if (summaryIds.length > 0) {
      const inserts = summaryIds.map(sid => ({
        student_id: studentId,
        summary_id: sid,
        granted_by: user?.id
      }));
      const { error: insertErr } = await supabase.from('summary_access').insert(inserts);
      if (insertErr) {
        handleError('Gravar Acessos a Resumos', insertErr);
        throw insertErr;
      }
    }
    if (user) await loadData(user.id, user.role);
  };

  const toggleAiAccess = async (studentId: string) => {
    const { data: existing } = await supabase
      .from('ai_consultant_access')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('ai_consultant_access')
        .delete()
        .eq('student_id', studentId);
      if (error) {
        handleError('Revogar Acesso à IA', error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('ai_consultant_access')
        .insert({
          student_id: studentId,
          granted_by: user?.id
        });
      if (error) {
        handleError('Conceder Acesso à IA', error);
        throw error;
      }
    }
    if (user) await loadData(user.id, user.role);
  };

  const addQuestion = async (questionData: Omit<Question, 'id'>) => {
    const trimmedPrompt = questionData.prompt.trim().toLowerCase();
    const exists = questions.some(q => q.subjectId === questionData.subjectId && q.prompt.trim().toLowerCase() === trimmedPrompt);
    if (exists) {
      const err = new Error('Esta questão já está cadastrada nesta disciplina.');
      handleError('Adicionar Questão', err);
      throw err;
    }

    const { error } = await supabase
      .from('questions')
      .insert({
        subject_id: questionData.subjectId,
        prompt: questionData.prompt,
        options: questionData.options,
        correct_answer_index: questionData.correctAnswerIndex,
        is_pro_or_premium: questionData.isProOrPremium,
        type: questionData.type
      });
    if (error) {
      handleError('Adicionar Questão', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const addSummary = async (summaryData: Omit<Summary, 'id' | 'pdfUrl'>, file?: File) => {
    let pdfUrl = '#';

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `resumos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('summaries')
        .upload(filePath, file);

      if (uploadError) {
        handleError('Upload do PDF', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('summaries')
        .getPublicUrl(filePath);

      pdfUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('summaries')
      .insert({
        subject_id: summaryData.subjectId,
        title: summaryData.title,
        description: summaryData.description,
        pdf_url: pdfUrl,
        is_premium: summaryData.isPremium
      });
    if (error) {
      handleError('Adicionar Resumo', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const deleteSummary = async (id: string) => {
    const { data: currentSum } = await supabase
      .from('summaries')
      .select('pdf_url')
      .eq('id', id)
      .maybeSingle();

    let oldFilePath: string | null = null;
    if (currentSum && currentSum.pdf_url && currentSum.pdf_url !== '#') {
      const match = currentSum.pdf_url.match(/\/summaries\/(.+)$/);
      if (match && match[1]) {
        oldFilePath = decodeURIComponent(match[1]);
      }
    }

    const { error } = await supabase
      .from('summaries')
      .delete()
      .eq('id', id);
    if (error) {
      handleError('Excluir Resumo', error);
      throw error;
    }

    if (oldFilePath) {
      await supabase.storage.from('summaries').remove([oldFilePath]);
    }

    if (user) await loadData(user.id, user.role);
  };

  const updateSummary = async (id: string, summaryData: Partial<Omit<Summary, 'id' | 'pdfUrl'>>, file?: File) => {
    let pdfUrl: string | undefined = undefined;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `resumos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('summaries')
        .upload(filePath, file);

      if (uploadError) {
        handleError('Upload do PDF na Atualização', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('summaries')
        .getPublicUrl(filePath);

      pdfUrl = publicUrlData.publicUrl;
    }

    let oldFilePath: string | null = null;
    if (file) {
      const { data: currentSum } = await supabase
        .from('summaries')
        .select('pdf_url')
        .eq('id', id)
        .maybeSingle();
      if (currentSum && currentSum.pdf_url && currentSum.pdf_url !== '#') {
        const match = currentSum.pdf_url.match(/\/summaries\/(.+)$/);
        if (match && match[1]) {
          oldFilePath = decodeURIComponent(match[1]);
        }
      }
    }

    const updatePayload: any = {
      subject_id: summaryData.subjectId,
      title: summaryData.title,
      description: summaryData.description,
      is_premium: summaryData.isPremium
    };

    if (pdfUrl !== undefined) {
      updatePayload.pdf_url = pdfUrl;
    }

    const { error } = await supabase
      .from('summaries')
      .update(updatePayload)
      .eq('id', id);
    if (error) {
      handleError('Atualizar Resumo', error);
      throw error;
    }

    if (oldFilePath) {
      await supabase.storage.from('summaries').remove([oldFilePath]);
    }

    if (user) await loadData(user.id, user.role);
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    if (error) {
      handleError('Excluir Questão', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const updateQuestion = async (id: string, questionData: Omit<Question, 'id'>) => {
    const trimmedPrompt = questionData.prompt.trim().toLowerCase();
    const exists = questions.some(q => q.id !== id && q.subjectId === questionData.subjectId && q.prompt.trim().toLowerCase() === trimmedPrompt);
    if (exists) {
      const err = new Error('Esta questão já está cadastrada nesta disciplina.');
      handleError('Atualizar Questão', err);
      throw err;
    }

    const { error } = await supabase
      .from('questions')
      .update({
        subject_id: questionData.subjectId,
        prompt: questionData.prompt,
        options: questionData.options,
        correct_answer_index: questionData.correctAnswerIndex,
        is_pro_or_premium: questionData.isProOrPremium,
        type: questionData.type
      })
      .eq('id', id);
    if (error) {
      handleError('Atualizar Questão', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const addCourse = async (name: string) => {
    const { error } = await supabase
      .from('courses')
      .insert({ name });
    if (error) {
      handleError('Adicionar Curso', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const addSubject = async (name: string, courseId: string, semester: number) => {
    const trimmedName = name.trim().toLowerCase();
    const exists = subjects.some(s => s.courseId === courseId && s.name.trim().toLowerCase() === trimmedName);
    if (exists) {
      const err = new Error(`A disciplina "${name}" já está cadastrada neste curso.`);
      handleError('Adicionar Disciplina', err);
      throw err;
    }

    const { error } = await supabase
      .from('subjects')
      .insert({
        name,
        course_id: courseId,
        semester
      });
    if (error) {
      handleError('Adicionar Disciplina', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) {
      handleError('Excluir Curso', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const updateCourse = async (id: string, name: string) => {
    const { error } = await supabase
      .from('courses')
      .update({ name })
      .eq('id', id);
    if (error) {
      handleError('Atualizar Curso', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    if (error) {
      handleError('Excluir Disciplina', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const updateSubject = async (id: string, name: string, semester: number) => {
    const currentSub = subjects.find(s => s.id === id);
    if (!currentSub) return;
    const trimmedName = name.trim().toLowerCase();
    const exists = subjects.some(s => s.id !== id && s.courseId === currentSub.courseId && s.name.trim().toLowerCase() === trimmedName);
    if (exists) {
      const err = new Error(`A disciplina "${name}" já está cadastrada neste curso.`);
      handleError('Atualizar Disciplina', err);
      throw err;
    }

    const { error } = await supabase
      .from('subjects')
      .update({ name, semester })
      .eq('id', id);
    if (error) {
      handleError('Atualizar Disciplina', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const deleteSummariesBySubject = async (subjectId: string) => {
    const { error } = await supabase
      .from('summaries')
      .delete()
      .eq('subject_id', subjectId);
    if (error) {
      handleError('Excluir Resumos da Disciplina', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const deleteQuestionsBySubject = async (subjectId: string) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('subject_id', subjectId);
    if (error) {
      handleError('Excluir Questões da Disciplina', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const clearCourseContent = async (courseId: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('course_id', courseId);
    if (error) {
      handleError('Limpar Conteúdos do Curso', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const addAiFile = async (fileName: string, _fileSize: string) => {
    const { error } = await supabase
      .from('ai_knowledge_files')
      .insert({
        name: fileName,
        url: '#'
      });
    if (error) {
      handleError('Adicionar Arquivo à IA', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const removeAiFile = async (id: string) => {
    const { error } = await supabase
      .from('ai_knowledge_files')
      .delete()
      .eq('id', id);
    if (error) {
      handleError('Remover Arquivo da IA', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const addSystemUser = async (email: string, fullName: string) => {
    const { error } = await supabase
      .from('system_users')
      .insert({
        email: email.trim().toLowerCase(),
        full_name: fullName,
        permissions: { all: true }
      });
    if (error) {
      handleError('Adicionar Administrador', error);
      throw error;
    }
    if (user) await loadData(user.id, user.role);
  };

  const removeSystemUser = async (email: string) => {
    try {
      const { data: existing } = await supabase
        .from('system_users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing && existing.id) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ role: 'student' })
          .eq('id', existing.id);
        if (profileErr) throw profileErr;

        const { error: studentErr } = await supabase
          .from('students')
          .upsert({ id: existing.id, plan: 'basic', lgpd_ranking_consent: false });
        if (studentErr) throw studentErr;
      }

      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('email', email);

      if (error) throw error;
    } catch (e) {
      handleError('Remover Administrador', e);
      throw e;
    }
    if (realUser) await loadData(realUser.id, realUser.role);
  };

  const transferSupraStatus = async (newSupraEmail: string) => {
    const { error } = await supabase.rpc('transfer_supra_status', {
      new_supra_email: newSupraEmail
    });
    if (error) {
      handleError('Transferir Liderança de Supra Admin', error);
      throw error;
    }
    const { data: { session } } = await supabase.auth.getSession();
    await handleSessionChange(session);
  };

  // Funções do Estudante
  const sendSupportMessage = async (messageText: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('support_messages')
      .insert({
        student_id: user.id,
        message: messageText
      });
    if (error) {
      handleError('Enviar Mensagem de Suporte', error);
      throw error;
    }
    await loadData(user.id, user.role);
  };

  const respondSupportMessage = async (id: string, response: string) => {
    const { error } = await supabase
      .from('support_messages')
      .update({ response })
      .eq('id', id);
    if (error) {
      handleError('Responder Mensagem de Suporte', error);
      throw error;
    }
    if (realUser) await loadData(realUser.id, realUser.role);
  };

  const addStudentPoints = (_points: number) => {
    // Calculado dinamicamente a partir do score das sessões
  };

  const addExamCycle = async (subjectId: string, correctAnswers: number, _totalQuestions: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('quiz_sessions')
      .insert({
        student_id: user.id,
        subject_id: subjectId === 'all' ? null : subjectId,
        score: correctAnswers,
        is_completed: true,
        completed_at: new Date().toISOString()
      });
    if (error) {
      handleError('Gravar Ciclo de Simulado', error);
      throw error;
    }
    if (realUser) {
      await loadData(realUser.id, realUser.role);
    }
  };

  const toggleLgpdConsent = async () => {
    if (!user || !studentProfile) return;
    const { error } = await supabase
      .from('students')
      .update({ lgpd_ranking_consent: !studentProfile.lgpdRankingConsent })
      .eq('id', user.id);
    if (error) {
      handleError('Atualizar Consentimento LGPD', error);
      throw error;
    }
    if (realUser) {
      await loadData(realUser.id, realUser.role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        students,
        courses,
        subjects,
        summaries,
        questions,
        supportMessages,
        aiKnowledgeFiles,
        systemUsers,
        globalError,
        loading,
        clearGlobalError,
        loginAs,
        logout,
        updateStudentPlan,
        toggleSummaryAccess,
        updateStudentSummaryAccess,
        toggleAiAccess,
        addQuestion,
        addSummary,
        deleteSummary,
        updateSummary,
        deleteQuestion,
        updateQuestion,
        addCourse,
        addSubject,
        deleteCourse,
        updateCourse,
        deleteSubject,
        updateSubject,
        deleteSummariesBySubject,
        deleteQuestionsBySubject,
        clearCourseContent,
        addAiFile,
        removeAiFile,
        sendSupportMessage,
        respondSupportMessage,
        addStudentPoints,
        addExamCycle,
        toggleLgpdConsent,
        addSystemUser,
        removeSystemUser,
        transferSupraStatus,
        isImpersonating,
        impersonatorEmail,
        stopImpersonating,
        plansConfig,
        updatePlansConfig,
        saveStudentSubjects,
        saveStudentSubjectsByAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
