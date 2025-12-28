
export enum UserRole {
  STUDENT = 'Student',
  ADMIN = 'Admin'
}

export interface User {
  userId: string;
  name: string;
  email: string;
  age: number;
  role: UserRole;
  joinedAt: string;
}

export interface MathProblem {
  problemId: string;
  userId: string;
  imageUrl?: string;
  questionText?: string;
  solution: string;
  topic?: string;
  language: 'English' | 'Malay';
  submissionTime: string;
}

export interface Feedback {
  feedbackId: string;
  userId: string;
  userName: string;
  feedbackText: string;
  submissionTime: string;
}

export interface AppState {
  currentUser: User | null;
  problems: MathProblem[];
  feedbacks: Feedback[];
}
