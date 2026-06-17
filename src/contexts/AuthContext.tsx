import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, StudentProfile, Course, Subject, Summary, Question, SupportMessage, AIKnowledgeFile } from '../types';
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
  loginAs: (role: 'admin' | 'basic' | 'pro' | 'premium') => Promise<void>;
  logout: () => Promise<void>;
  updateStudentPlan: (studentId: string, plan: 'basic' | 'pro' | 'premium') => Promise<void>;
  toggleSummaryAccess: (studentId: string, summaryId: string) => Promise<void>;
  updateStudentSummaryAccess: (studentId: string, summaryIds: string[]) => Promise<void>;
  toggleAiAccess: (studentId: string) => Promise<void>;
  addQuestion: (question: Omit<Question, 'id'>) => Promise<void>;
  addSummary: (summary: Omit<Summary, 'id' | 'pdfUrl'>) => Promise<void>;
  addCourse: (name: string) => Promise<void>;
  addSubject: (name: string, courseId: string, semester: number) => Promise<void>;
  addAiFile: (fileName: string, fileSize: string) => Promise<void>;
  removeAiFile: (id: string) => Promise<void>;
  sendSupportMessage: (message: string) => Promise<void>;
  respondSupportMessage: (id: string, response: string) => Promise<void>;
  addStudentPoints: (points: number) => void;
  addExamCycle: (subjectId: string, correctAnswers: number, totalQuestions: number) => Promise<void>;
  toggleLgpdConsent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [students, setStudents] = useState<{ user: User; profile: StudentProfile }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [aiKnowledgeFiles, setAiKnowledgeFiles] = useState<AIKnowledgeFile[]>([]);

  // Carrega todos os dados do Supabase
  const loadData = async (userId: string, userRole: 'admin' | 'student') => {
    try {
      // Cursos e Disciplinas
      const { data: coursesData } = await supabase.from('courses').select('*');
      const { data: subjectsData } = await supabase.from('subjects').select('*');
      if (coursesData) setCourses(coursesData);
      if (subjectsData) {
        setSubjects(subjectsData.map(s => ({
          id: s.id,
          courseId: s.course_id,
          name: s.name,
          semester: s.semester
        })));
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

      // Se for Admin, carregar todos os estudantes cadastrados
      if (userRole === 'admin') {
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
            const aiConsultantAccess = (allAiAccess || []).some(a => a.student_id === s.id);

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
                aiConsultantAccess,
                examCycles
              }
            };
          }));
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados do Supabase:', e);
    }
  };

  const handleSessionChange = async (session: any) => {
    if (!session) {
      setUser(null);
      setStudentProfile(null);
      return;
    }

    try {
      const suUser = session.user;

      // Buscar perfil
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', suUser.id)
        .single();

      if (profileErr || !profile) {
        console.error('Perfil não encontrado para o usuário:', suUser.id);
        setUser(null);
        setStudentProfile(null);
        return;
      }

      const appUser: User = {
        id: suUser.id,
        email: suUser.email || '',
        name: profile.full_name || suUser.email || '',
        role: profile.role as 'admin' | 'student'
      };

      setUser(appUser);

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
            .select('summary_id')
            .eq('student_id', suUser.id);
          const summaryAccess = (access || []).map(a => a.summary_id);

          const { data: aiAccess } = await supabase
            .from('ai_consultant_access')
            .select('*')
            .eq('student_id', suUser.id)
            .single();
          const aiConsultantAccess = !!aiAccess;

          setStudentProfile({
            id: suUser.id,
            userId: suUser.id,
            plan: student.plan as 'basic' | 'pro' | 'premium',
            lgpdRankingConsent: student.lgpd_ranking_consent,
            rankingPoints,
            summaryAccess,
            aiConsultantAccess,
            examCycles
          });
        }
      } else {
        setStudentProfile(null);
      }

      // Carregar as outras listas
      await loadData(suUser.id, profile.role);
    } catch (e) {
      console.error('Erro no processamento da sessão:', e);
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

  // Login de simulação adaptado ao Supabase
  const loginAs = async (role: 'admin' | 'basic' | 'pro' | 'premium') => {
    let email = '';
    let name = '';

    if (role === 'admin') {
      email = 'admin@eadhelp.com';
      name = 'Administrador EAD Help';
    } else if (role === 'basic') {
      email = 'joao@email.com';
      name = 'João Silva';
    } else if (role === 'pro') {
      email = 'maria@email.com';
      name = 'Maria Santos';
    } else if (role === 'premium') {
      email = 'carlos@email.com';
      name = 'Carlos Oliveira';
    }

    const password = 'TestPassword123!';

    // Tentar login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
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

        if (signUpError) throw signUpError;

        // Fazer login logo em seguida
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;

        // Se for estudante, atualizar o plano (o trigger coloca como 'basic' por padrão)
        if (role !== 'admin' && role !== 'basic' && signInData.user) {
          await supabase
            .from('students')
            .update({ plan: role })
            .eq('id', signInData.user.id);
        }
      } else {
        throw error;
      }
    } else if (data.user && role !== 'admin') {
      // Se já existia, garantir que o plano no banco bata com a simulação do botão
      await supabase
        .from('students')
        .update({ plan: role })
        .eq('id', data.user.id);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Funções Administrativas
  const updateStudentPlan = async (studentId: string, plan: 'basic' | 'pro' | 'premium') => {
    const { error } = await supabase
      .from('students')
      .update({ plan })
      .eq('id', studentId);
    if (error) console.error('Erro ao atualizar plano:', error);
    if (user) await loadData(user.id, user.role);
  };

  const toggleSummaryAccess = async (studentId: string, summaryId: string) => {
    const { data: existing } = await supabase
      .from('summary_access')
      .select('*')
      .eq('student_id', studentId)
      .eq('summary_id', summaryId)
      .single();

    if (existing) {
      await supabase
        .from('summary_access')
        .delete()
        .eq('student_id', studentId)
        .eq('summary_id', summaryId);
    } else {
      await supabase
        .from('summary_access')
        .insert({
          student_id: studentId,
          summary_id: summaryId,
          granted_by: user?.id
        });
    }
    if (user) await loadData(user.id, user.role);
  };

  const updateStudentSummaryAccess = async (studentId: string, summaryIds: string[]) => {
    await supabase
      .from('summary_access')
      .delete()
      .eq('student_id', studentId);

    if (summaryIds.length > 0) {
      const inserts = summaryIds.map(sid => ({
        student_id: studentId,
        summary_id: sid,
        granted_by: user?.id
      }));
      await supabase.from('summary_access').insert(inserts);
    }
    if (user) await loadData(user.id, user.role);
  };

  const toggleAiAccess = async (studentId: string) => {
    const { data: existing } = await supabase
      .from('ai_consultant_access')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (existing) {
      await supabase
        .from('ai_consultant_access')
        .delete()
        .eq('student_id', studentId);
    } else {
      await supabase
        .from('ai_consultant_access')
        .insert({
          student_id: studentId,
          granted_by: user?.id
        });
    }
    if (user) await loadData(user.id, user.role);
  };

  const addQuestion = async (questionData: Omit<Question, 'id'>) => {
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
    if (error) console.error('Erro ao adicionar questão:', error);
    if (user) await loadData(user.id, user.role);
  };

  const addSummary = async (summaryData: Omit<Summary, 'id' | 'pdfUrl'>) => {
    const { error } = await supabase
      .from('summaries')
      .insert({
        subject_id: summaryData.subjectId,
        title: summaryData.title,
        description: summaryData.description,
        pdf_url: '#',
        is_premium: summaryData.isPremium
      });
    if (error) console.error('Erro ao adicionar resumo:', error);
    if (user) await loadData(user.id, user.role);
  };

  const addCourse = async (name: string) => {
    const { error } = await supabase
      .from('courses')
      .insert({ name });
    if (error) console.error('Erro ao adicionar curso:', error);
    if (user) await loadData(user.id, user.role);
  };

  const addSubject = async (name: string, courseId: string, semester: number) => {
    const { error } = await supabase
      .from('subjects')
      .insert({
        name,
        course_id: courseId,
        semester
      });
    if (error) console.error('Erro ao adicionar matéria:', error);
    if (user) await loadData(user.id, user.role);
  };

  const addAiFile = async (fileName: string, _fileSize: string) => {
    const { error } = await supabase
      .from('ai_knowledge_files')
      .insert({
        name: fileName,
        url: '#'
      });
    if (error) console.error('Erro ao adicionar arquivo IA:', error);
    if (user) await loadData(user.id, user.role);
  };

  const removeAiFile = async (id: string) => {
    const { error } = await supabase
      .from('ai_knowledge_files')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao remover arquivo IA:', error);
    if (user) await loadData(user.id, user.role);
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
    if (error) console.error('Erro ao enviar mensagem de suporte:', error);
    await loadData(user.id, user.role);
  };

  const respondSupportMessage = async (id: string, response: string) => {
    const { error } = await supabase
      .from('support_messages')
      .update({ response })
      .eq('id', id);
    if (error) console.error('Erro ao responder mensagem de suporte:', error);
    if (user) await loadData(user.id, user.role);
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
        subject_id: subjectId,
        score: correctAnswers,
        is_completed: true,
        completed_at: new Date().toISOString()
      });
    if (error) console.error('Erro ao adicionar ciclo de exame:', error);
    await handleSessionChange({ user });
  };

  const toggleLgpdConsent = async () => {
    if (!user || !studentProfile) return;
    const { error } = await supabase
      .from('students')
      .update({ lgpd_ranking_consent: !studentProfile.lgpdRankingConsent })
      .eq('id', user.id);
    if (error) console.error('Erro ao alterar consentimento LGPD:', error);
    await handleSessionChange({ user });
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
        loginAs,
        logout,
        updateStudentPlan,
        toggleSummaryAccess,
        updateStudentSummaryAccess,
        toggleAiAccess,
        addQuestion,
        addSummary,
        addCourse,
        addSubject,
        addAiFile,
        removeAiFile,
        sendSupportMessage,
        respondSupportMessage,
        addStudentPoints,
        addExamCycle,
        toggleLgpdConsent
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
