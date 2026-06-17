export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
}

export interface StudentProfile {
  id: string;
  userId: string;
  plan: 'basic' | 'pro' | 'premium';
  lgpdRankingConsent: boolean;
  rankingPoints: number;
  summaryAccess: string[]; // List of summary IDs allowed for avulso access
  aiConsultantAccess: boolean; // Custom access purchased
}

export interface Course {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  courseId: string;
  name: string;
  semester: number;
}

export interface Summary {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  pdfUrl: string;
  isPremium: boolean;
}

export interface Question {
  id: string;
  subjectId: string;
  prompt: string;
  options: string[];
  correctAnswerIndex: number;
  isProOrPremium: boolean;
  type: 'simulado' | 'prova';
}

export interface SupportMessage {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  response: string | null;
  createdAt: string;
}

export interface AIKnowledgeFile {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
}
