import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, StudentProfile, Course, Subject, Summary, Question, SupportMessage, AIKnowledgeFile, ExamCycle } from '../types';

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
  loginAs: (role: 'admin' | 'basic' | 'pro' | 'premium') => void;
  logout: () => void;
  updateStudentPlan: (studentId: string, plan: 'basic' | 'pro' | 'premium') => void;
  toggleSummaryAccess: (studentId: string, summaryId: string) => void;
  updateStudentSummaryAccess: (studentId: string, summaryIds: string[]) => void;
  toggleAiAccess: (studentId: string) => void;
  addQuestion: (question: Omit<Question, 'id'>) => void;
  addSummary: (summary: Omit<Summary, 'id' | 'pdfUrl'>) => void;
  addCourse: (name: string) => void;
  addSubject: (name: string, courseId: string, semester: number) => void;
  addAiFile: (fileName: string, fileSize: string) => void;
  removeAiFile: (id: string) => void;
  sendSupportMessage: (message: string) => void;
  respondSupportMessage: (id: string, response: string) => void;
  addStudentPoints: (points: number) => void;
  addExamCycle: (subjectId: string, correctAnswers: number, totalQuestions: number) => void;
  toggleLgpdConsent: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Static Data
const INITIAL_COURSES: Course[] = [
  { id: 'c1', name: 'Direito' },
  { id: 'c2', name: 'Administração de Empresas' }
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: 's1', courseId: 'c1', name: 'Direito Constitucional I', semester: 1 },
  { id: 's2', courseId: 'c1', name: 'Direito Penal Geral', semester: 2 },
  { id: 's3', courseId: 'c1', name: 'Direito Civil - Contratos', semester: 3 },
  { id: 's4', courseId: 'c2', name: 'Teoria Geral da Administração', semester: 1 },
  { id: 's5', courseId: 'c2', name: 'Comportamento Organizacional', semester: 2 }
];

const INITIAL_SUMMARIES: Summary[] = [
  { id: 'sum1', subjectId: 's1', title: 'Resumo de Controle de Constitucionalidade', description: 'Conceitos básicos, tipos de controle (difuso e concentrado) e ações constitucionais (ADI, ADC, ADPF).', pdfUrl: '#', isPremium: false },
  { id: 'sum2', subjectId: 's1', title: 'Resumo de Direitos Fundamentais', description: 'Análise detalhada do Artigo 5º da CF/88, remédios constitucionais e garantias fundamentais.', pdfUrl: '#', isPremium: true },
  { id: 'sum3', subjectId: 's2', title: 'Resumo de Teoria do Crime', description: 'Fato típico, antijuridicidade, culpabilidade, dolo, culpa e causas de exclusão de ilicitude.', pdfUrl: '#', isPremium: false },
  { id: 'sum4', subjectId: 's4', title: 'Resumo sobre Escola Clássica da Admin', description: 'Princípios de Taylor e Fayol, divisão do trabalho, organograma e eficiência operacional.', pdfUrl: '#', isPremium: false }
];

const INITIAL_QUESTIONS: Question[] = [
  // Direito Constitucional
  {
    id: 'q1',
    subjectId: 's1',
    prompt: 'Qual remédio constitucional é adequado para garantir o conhecimento de informações relativas à pessoa do impetrante, constantes de registros ou bancos de dados de entidades governamentais?',
    options: ['Mandado de Segurança', 'Habeas Data', 'Habeas Corpus', 'Ação Popular'],
    correctAnswerIndex: 1,
    isProOrPremium: false,
    type: 'simulado'
  },
  {
    id: 'q2',
    subjectId: 's1',
    prompt: 'O controle difuso de constitucionalidade caracteriza-se por ser exercido por:',
    options: ['Qualquer juiz ou tribunal', 'Apenas pelo STF', 'Apenas pelos Tribunais de Justiça estaduais', 'Exclusivamente pelo Senado Federal'],
    correctAnswerIndex: 0,
    isProOrPremium: false,
    type: 'simulado'
  },
  {
    id: 'q3',
    subjectId: 's1',
    prompt: 'A emenda constitucional que resulte em restrição ou abolição de direitos individuais:',
    options: ['É plenamente válida', 'Depende de referendo popular', 'É inconstitucional, pois afronta cláusula pétrea', 'Pode ser feita por decreto presidencial'],
    correctAnswerIndex: 2,
    isProOrPremium: true,
    type: 'prova'
  },
  {
    id: 'q4',
    subjectId: 's1',
    prompt: 'Quem tem a competência para julgar a Ação Direta de Inconstitucionalidade (ADI)?',
    options: ['O Superior Tribunal de Justiça (STJ)', 'O Supremo Tribunal Federal (STF)', 'O Congresso Nacional', 'A Procuradoria Geral da República'],
    correctAnswerIndex: 1,
    isProOrPremium: true,
    type: 'prova'
  },
  // Direito Penal
  {
    id: 'q5',
    subjectId: 's2',
    prompt: 'Considera-se crime consumado quando:',
    options: [
      'O agente inicia a execução, mas esta é interrompida por circunstâncias alheias à sua vontade',
      'Nele se reúnem todos os elementos de sua definição legal',
      'O agente desiste voluntariamente de prosseguir na execução',
      'O resultado ocorre sem dolo nem culpa'
    ],
    correctAnswerIndex: 1,
    isProOrPremium: false,
    type: 'simulado'
  },
  {
    id: 'q6',
    subjectId: 's2',
    prompt: 'Qual das alternativas abaixo NÃO constitui uma excludente de ilicitude segundo o Código Penal brasileiro?',
    options: ['Estado de necessidade', 'Legítima defesa', 'Estrito cumprimento do dever legal', 'Coação moral irresistível'],
    correctAnswerIndex: 3,
    isProOrPremium: false,
    type: 'simulado'
  },
  {
    id: 'q7',
    subjectId: 's2',
    prompt: 'O crime culposo ocorre quando o agente deu causa ao resultado por:',
    options: ['Imprudência, negligência ou imperícia', 'Vontade direta e livre', 'Coação irresistível', 'Erro de tipo inevitável'],
    correctAnswerIndex: 0,
    isProOrPremium: true,
    type: 'prova'
  },
  // Teoria Geral da Administração
  {
    id: 'q8',
    subjectId: 's4',
    prompt: 'A Administração Científica de Taylor tinha como principal foco de estudo:',
    options: ['A estrutura organizacional', 'As pessoas e o comportamento social', 'A tarefa e a eficiência no nível operacional', 'As relações internacionais da firma'],
    correctAnswerIndex: 2,
    isProOrPremium: false,
    type: 'simulado'
  },
  {
    id: 'q9',
    subjectId: 's4',
    prompt: 'Quem propôs os 14 princípios gerais da administração, focando na visão anatômica da estrutura da empresa?',
    options: ['Frederick Taylor', 'Henri Fayol', 'Max Weber', 'Elton Mayo'],
    correctAnswerIndex: 1,
    isProOrPremium: false,
    type: 'simulado'
  },
  {
    id: 'q10',
    subjectId: 's4',
    prompt: 'O conceito de burocracia na teoria das organizações é fortemente associado a qual autor?',
    options: ['Max Weber', 'Peter Drucker', 'Douglas McGregor', 'Warren Bennis'],
    correctAnswerIndex: 0,
    isProOrPremium: true,
    type: 'prova'
  },
  {
    id: 'q11',
    subjectId: 's4',
    prompt: 'De acordo com Fayol, as funções básicas da empresa dividem-se em técnicas, comerciais, financeiras, de segurança, contábeis e:',
    options: ['De recursos humanos', 'Administrativas', 'De marketing', 'De governança'],
    correctAnswerIndex: 1,
    isProOrPremium: true,
    type: 'prova'
  },
  {
    id: 'q12',
    subjectId: 's4',
    prompt: 'Qual teoria da administração surgiu como oposição ferrenha à Teoria Clássica, valorizando aspectos sociais e informais?',
    options: ['Teoria de Sistemas', 'Teoria da Burocracia', 'Teoria das Relações Humanas', 'Teoria Contingencial'],
    correctAnswerIndex: 2,
    isProOrPremium: true,
    type: 'prova'
  }
];

const INITIAL_SUPPORT: SupportMessage[] = [
  { id: 'sup1', studentId: 'stu-basic', studentName: 'João Silva', message: 'Como faço para ter acesso aos resumos premium da disciplina de Direito Penal?', response: 'Olá João! Os resumos premium estão disponíveis para assinantes Pro e Premium. Você também pode comprá-los de forma avulsa falando com nossa administração.', createdAt: '2026-06-16T15:00:00Z' }
];

const INITIAL_FILES: AIKnowledgeFile[] = [
  { id: 'f1', fileName: 'Constituicao_Federal_88.pdf', fileSize: '2.4 MB', uploadedAt: '2026-06-15T10:00:00Z' },
  { id: 'f2', fileName: 'Codigo_Penal_Brasileiro.pdf', fileSize: '1.8 MB', uploadedAt: '2026-06-15T10:15:00Z' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load stored state or use initial mock data
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eh_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('eh_student_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [students, setStudents] = useState<{ user: User; profile: StudentProfile }[]>(() => {
    const saved = localStorage.getItem('eh_students');
    if (saved) return JSON.parse(saved);

    // Initial mock student base
    return [
      {
        user: { id: 'stu-basic', email: 'joao@email.com', name: 'João Silva', role: 'student' },
        profile: { 
          id: 'p-basic', 
          userId: 'stu-basic', 
          plan: 'basic', 
          lgpdRankingConsent: true, 
          rankingPoints: 70, 
          summaryAccess: [], 
          aiConsultantAccess: false,
          examCycles: [
            { id: 'ec-1', subjectName: 'Direito Constitucional I', correctAnswers: 7, totalQuestions: 10, percentage: 70, completedAt: '2026-06-16T14:30:00Z' },
            { id: 'ec-2', subjectName: 'Direito Penal Geral', correctAnswers: 5, totalQuestions: 10, percentage: 50, completedAt: '2026-06-16T16:00:00Z' }
          ]
        }
      },
      {
        user: { id: 'stu-pro', email: 'maria@email.com', name: 'Maria Santos', role: 'student' },
        profile: { 
          id: 'p-pro', 
          userId: 'stu-pro', 
          plan: 'pro', 
          lgpdRankingConsent: true, 
          rankingPoints: 120, 
          summaryAccess: [], 
          aiConsultantAccess: false,
          examCycles: [
            { id: 'ec-3', subjectName: 'Teoria Geral da Administração', correctAnswers: 9, totalQuestions: 10, percentage: 90, completedAt: '2026-06-15T11:00:00Z' },
            { id: 'ec-4', subjectName: 'Comportamento Organizacional', correctAnswers: 8, totalQuestions: 10, percentage: 80, completedAt: '2026-06-16T10:15:00Z' }
          ]
        }
      },
      {
        user: { id: 'stu-prem', email: 'carlos@email.com', name: 'Carlos Oliveira', role: 'student' },
        profile: { 
          id: 'p-prem', 
          userId: 'stu-prem', 
          plan: 'premium', 
          lgpdRankingConsent: false, 
          rankingPoints: 210, 
          summaryAccess: [], 
          aiConsultantAccess: true,
          examCycles: [
            { id: 'ec-5', subjectName: 'Direito Civil - Contratos', correctAnswers: 10, totalQuestions: 10, percentage: 100, completedAt: '2026-06-14T09:00:00Z' },
            { id: 'ec-6', subjectName: 'Direito Constitucional I', correctAnswers: 9, totalQuestions: 10, percentage: 90, completedAt: '2026-06-16T18:45:00Z' }
          ]
        }
      }
    ];
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('eh_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('eh_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [summaries, setSummaries] = useState<Summary[]>(() => {
    const saved = localStorage.getItem('eh_summaries');
    return saved ? JSON.parse(saved) : INITIAL_SUMMARIES;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('eh_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => {
    const saved = localStorage.getItem('eh_support_messages');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT;
  });

  const [aiKnowledgeFiles, setAiKnowledgeFiles] = useState<AIKnowledgeFile[]>(() => {
    const saved = localStorage.getItem('eh_ai_files');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  // Save changes to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('eh_user', JSON.stringify(user));
    else localStorage.removeItem('eh_user');
  }, [user]);

  useEffect(() => {
    if (studentProfile) localStorage.setItem('eh_student_profile', JSON.stringify(studentProfile));
    else localStorage.removeItem('eh_student_profile');
  }, [studentProfile]);

  useEffect(() => {
    localStorage.setItem('eh_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('eh_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('eh_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('eh_summaries', JSON.stringify(summaries));
  }, [summaries]);

  useEffect(() => {
    localStorage.setItem('eh_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('eh_support_messages', JSON.stringify(supportMessages));
  }, [supportMessages]);

  useEffect(() => {
    localStorage.setItem('eh_ai_files', JSON.stringify(aiKnowledgeFiles));
  }, [aiKnowledgeFiles]);

  // Migration for old localStorage that does not contain examCycles yet
  useEffect(() => {
    setStudents(prev => {
      let changed = false;
      const updated = prev.map(s => {
        if (!s.profile.examCycles) {
          changed = true;
          let defaultCycles: ExamCycle[] = [];
          if (s.user.id === 'stu-basic') {
            defaultCycles = [
              { id: 'ec-1', subjectName: 'Direito Constitucional I', correctAnswers: 7, totalQuestions: 10, percentage: 70, completedAt: '2026-06-16T14:30:00Z' },
              { id: 'ec-2', subjectName: 'Direito Penal Geral', correctAnswers: 5, totalQuestions: 10, percentage: 50, completedAt: '2026-06-16T16:00:00Z' }
            ];
          } else if (s.user.id === 'stu-pro') {
            defaultCycles = [
              { id: 'ec-3', subjectName: 'Teoria Geral da Administração', correctAnswers: 9, totalQuestions: 10, percentage: 90, completedAt: '2026-06-15T11:00:00Z' },
              { id: 'ec-4', subjectName: 'Comportamento Organizacional', correctAnswers: 8, totalQuestions: 10, percentage: 80, completedAt: '2026-06-16T10:15:00Z' }
            ];
          } else if (s.user.id === 'stu-prem') {
            defaultCycles = [
              { id: 'ec-5', subjectName: 'Direito Civil - Contratos', correctAnswers: 10, totalQuestions: 10, percentage: 100, completedAt: '2026-06-14T09:00:00Z' },
              { id: 'ec-6', subjectName: 'Direito Constitucional I', correctAnswers: 9, totalQuestions: 10, percentage: 90, completedAt: '2026-06-16T18:45:00Z' }
            ];
          }
          return { ...s, profile: { ...s.profile, examCycles: defaultCycles } };
        }
        return s;
      });
      return changed ? updated : prev;
    });
  }, []);

  useEffect(() => {
    if (studentProfile && !studentProfile.examCycles) {
      const currentStudent = students.find(s => s.user.id === studentProfile.userId);
      if (currentStudent && currentStudent.profile.examCycles) {
        setStudentProfile(prev => prev ? { ...prev, examCycles: currentStudent.profile.examCycles } : null);
      }
    }
  }, [studentProfile, students]);

  // Login simulation
  const loginAs = (role: 'admin' | 'basic' | 'pro' | 'premium') => {
    if (role === 'admin') {
      const adminUser: User = { id: 'admin-1', email: 'admin@eadhelp.com', name: 'Administrador EAD Help', role: 'admin' };
      setUser(adminUser);
      setStudentProfile(null);
    } else {
      // Find matching mock student profile
      let targetEmail = '';
      if (role === 'basic') targetEmail = 'joao@email.com';
      else if (role === 'pro') targetEmail = 'maria@email.com';
      else if (role === 'premium') targetEmail = 'carlos@email.com';

      const found = students.find(s => s.user.email === targetEmail);
      if (found) {
        setUser(found.user);
        setStudentProfile(found.profile);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setStudentProfile(null);
  };

  // Admin features
  const updateStudentPlan = (studentId: string, plan: 'basic' | 'pro' | 'premium') => {
    setStudents(prev => prev.map(s => {
      if (s.user.id === studentId) {
        const updatedProfile = { ...s.profile, plan };
        // If current logged user is this student, update session too
        if (user && user.id === studentId) {
          setStudentProfile(updatedProfile);
        }
        return { ...s, profile: updatedProfile };
      }
      return s;
    }));
  };

  const toggleSummaryAccess = (studentId: string, summaryId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.user.id === studentId) {
        const hasAccess = s.profile.summaryAccess.includes(summaryId);
        const updatedAccess = hasAccess 
          ? s.profile.summaryAccess.filter(id => id !== summaryId)
          : [...s.profile.summaryAccess, summaryId];

        const updatedProfile = { ...s.profile, summaryAccess: updatedAccess };
        if (user && user.id === studentId) {
          setStudentProfile(updatedProfile);
        }
        return { ...s, profile: updatedProfile };
      }
      return s;
    }));
  };

  const updateStudentSummaryAccess = (studentId: string, summaryIds: string[]) => {
    setStudents(prev => prev.map(s => {
      if (s.user.id === studentId) {
        const updatedProfile = { ...s.profile, summaryAccess: summaryIds };
        if (user && user.id === studentId) {
          setStudentProfile(updatedProfile);
        }
        return { ...s, profile: updatedProfile };
      }
      return s;
    }));
  };

  const toggleAiAccess = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.user.id === studentId) {
        const updatedProfile = { ...s.profile, aiConsultantAccess: !s.profile.aiConsultantAccess };
        if (user && user.id === studentId) {
          setStudentProfile(updatedProfile);
        }
        return { ...s, profile: updatedProfile };
      }
      return s;
    }));
  };

  const addQuestion = (questionData: Omit<Question, 'id'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: `q-${Date.now()}`
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const addSummary = (summaryData: Omit<Summary, 'id' | 'pdfUrl'>) => {
    const newSummary: Summary = {
      ...summaryData,
      id: `sum-${Date.now()}`,
      pdfUrl: '#'
    };
    setSummaries(prev => [...prev, newSummary]);
  };

  const addCourse = (name: string) => {
    const newCourse: Course = {
      id: `c-${Date.now()}`,
      name
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const addSubject = (name: string, courseId: string, semester: number) => {
    const newSubject: Subject = {
      id: `s-${Date.now()}`,
      courseId,
      name,
      semester
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const addAiFile = (fileName: string, fileSize: string) => {
    const newFile: AIKnowledgeFile = {
      id: `file-${Date.now()}`,
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString()
    };
    setAiKnowledgeFiles(prev => [...prev, newFile]);
  };

  const removeAiFile = (id: string) => {
    setAiKnowledgeFiles(prev => prev.filter(f => f.id !== id));
  };

  // Student features
  const sendSupportMessage = (messageText: string) => {
    if (!user) return;
    const newMessage: SupportMessage = {
      id: `msg-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      message: messageText,
      response: null,
      createdAt: new Date().toISOString()
    };
    setSupportMessages(prev => [newMessage, ...prev]);
  };

  const respondSupportMessage = (id: string, response: string) => {
    setSupportMessages(prev => prev.map(msg => {
      if (msg.id === id) {
        return { ...msg, response };
      }
      return msg;
    }));
  };

  const addStudentPoints = (points: number) => {
    if (!user || !studentProfile) return;

    const updatedProfile = { ...studentProfile, rankingPoints: studentProfile.rankingPoints + points };
    setStudentProfile(updatedProfile);

    // Persist in students list
    setStudents(prev => prev.map(s => {
      if (s.user.id === user.id) {
        return { ...s, profile: updatedProfile };
      }
      return s;
    }));
  };

  const addExamCycle = (subjectId: string, correctAnswers: number, totalQuestions: number) => {
    if (!user || !studentProfile) return;

    // Find subject name
    const subject = subjects.find(s => s.id === subjectId);
    const subjectName = subject ? subject.name : 'Simulado Geral';

    const newCycle: ExamCycle = {
      id: `ec-${Date.now()}`,
      subjectName,
      correctAnswers,
      totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      completedAt: new Date().toISOString()
    };

    const updatedCycles = [...(studentProfile.examCycles || []), newCycle];
    const updatedProfile = { 
      ...studentProfile, 
      examCycles: updatedCycles,
      rankingPoints: studentProfile.rankingPoints + (correctAnswers * 10)
    };

    setStudentProfile(updatedProfile);

    setStudents(prev => prev.map(s => {
      if (s.user.id === user.id) {
        return { ...s, profile: updatedProfile };
      }
      return s;
    }));
  };

  const toggleLgpdConsent = () => {
    if (!user || !studentProfile) return;

    const updatedProfile = { ...studentProfile, lgpdRankingConsent: !studentProfile.lgpdRankingConsent };
    setStudentProfile(updatedProfile);

    setStudents(prev => prev.map(s => {
      if (s.user.id === user.id) {
        return { ...s, profile: updatedProfile };
      }
      return s;
    }));
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
