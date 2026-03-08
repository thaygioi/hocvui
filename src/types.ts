export type Subject = 'Math' | 'Vietnamese' | 'Science' | 'English' | 'History' | 'Geography' | 'Ethics' | 'Music' | 'Arts' | 'PE' | 'Technology' | 'Informatics';

export type Grade = 1 | 2 | 3 | 4 | 5;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type AppMode = 'help' | 'quiz';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
