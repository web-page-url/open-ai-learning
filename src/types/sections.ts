// Database types for sections and questions
export interface Section {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionsCount: number;
  estimatedTime: string;
  icon: string;
  color: string;
  slug: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  section_id: number;
  question_text: string;
  question_type: 'multiple-choice' | 'true-false';
  options?: string[];
  correct_answer: string;
  explanation: string;
  time_limit: number;
  points: number;
  order_index: number;
  is_active: boolean;
}

export interface UserProgress {
  user_id: string;
  section_id: number;
  questions_answered: number;
  questions_correct: number;
  total_score: number;
  completion_percentage: number;
  time_spent?: number;
  status: 'not-started' | 'in-progress' | 'completed';
  started_at?: string;
  completed_at?: string;
}

export interface UserAnswer {
  user_id: string;
  section_id: number;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  response_time: number;
  points_earned: number;
  created_at: string;
}

// Section data for the homepage (will be replaced by database calls)
export const sections: Section[] = [
  {
    id: 1,
    title: "OpenAI Comprehensive Training",
    description: "Complete guide to OpenAI technologies, applications, and practical implementations",
    difficulty: "intermediate",
    questionsCount: 8,
    estimatedTime: "16 min",
    icon: "🤖",
    color: "from-blue-500 to-purple-500",
    slug: "openai-comprehensive-training",
    is_active: true
  }
];

// Sample questions for the single section (8 questions total)
export const sampleQuestions: Record<number, Question[]> = {
  1: [
    {
      id: "q1_1",
      section_id: 1,
      question_text: "What is OpenAI's primary mission?",
      question_type: "multiple-choice",
      options: ["To create artificial general intelligence (AGI) that benefits all of humanity", "To develop gaming software exclusively", "To create social media platforms", "To build e-commerce solutions"],
      correct_answer: "0",
      explanation: "OpenAI's mission is to ensure that artificial general intelligence (AGI) benefits all of humanity through safe and beneficial AI development.",
      time_limit: 30,
      points: 1,
      order_index: 1,
      is_active: true
    },
    {
      id: "q1_2",
      section_id: 1,
      question_text: "Which of the following is a well-known language model developed by OpenAI?",
      question_type: "multiple-choice",
      options: ["BERT", "GPT (Generative Pre-trained Transformer)", "ResNet", "YOLO"],
      correct_answer: "1",
      explanation: "GPT (Generative Pre-trained Transformer) is OpenAI's flagship language model series, including GPT-3, GPT-4, and ChatGPT.",
      time_limit: 30,
      points: 1,
      order_index: 2,
      is_active: true
    },
    {
      id: "q1_3",
      section_id: 1,
      question_text: "OpenAI was founded as a non-profit organization.",
      question_type: "true-false",
      correct_answer: "true",
      explanation: "OpenAI was initially founded as a non-profit AI research company in 2015, though it later transitioned to a 'capped-profit' model.",
      time_limit: 20,
      points: 1,
      order_index: 3,
      is_active: true
    },
    {
      id: "q1_4",
      section_id: 1,
      question_text: "What does 'GPT' stand for in OpenAI's language models?",
      question_type: "multiple-choice",
      options: ["General Purpose Technology", "Generative Pre-trained Transformer", "Global Processing Tool", "Graphical Programming Toolkit"],
      correct_answer: "1",
      explanation: "GPT stands for Generative Pre-trained Transformer, referring to the architecture that generates text based on transformer neural networks.",
      time_limit: 30,
      points: 1,
      order_index: 4,
      is_active: true
    },
    {
      id: "q1_5",
      section_id: 1,
      question_text: "Which of the following is a primary use case for ChatGPT?",
      question_type: "multiple-choice",
      options: ["Image recognition only", "Conversational AI and text generation", "Video editing", "Database management"],
      correct_answer: "1",
      explanation: "ChatGPT is designed for conversational AI, helping users with text generation, answering questions, writing assistance, and dialogue.",
      time_limit: 30,
      points: 1,
      order_index: 5,
      is_active: true
    },
    {
      id: "q1_6",
      section_id: 1,
      question_text: "What is DALL-E used for?",
      question_type: "multiple-choice",
      options: ["Text translation", "Code generation", "AI-generated images from text descriptions", "Music composition"],
      correct_answer: "2",
      explanation: "DALL-E is OpenAI's AI system that generates digital images from natural language descriptions, revolutionizing AI-powered creative content.",
      time_limit: 30,
      points: 1,
      order_index: 6,
      is_active: true
    },
    {
      id: "q1_7",
      section_id: 1,
      question_text: "OpenAI's models can be used for code generation and programming assistance.",
      question_type: "true-false",
      correct_answer: "true",
      explanation: "Yes, OpenAI's models like GPT-4 and Codex are capable of generating code, debugging, and providing programming assistance across multiple languages.",
      time_limit: 20,
      points: 1,
      order_index: 7,
      is_active: true
    },
    {
      id: "q1_8",
      section_id: 1,
      question_text: "Which industry has NOT commonly adopted OpenAI technologies?",
      question_type: "multiple-choice",
      options: ["Education and tutoring", "Content creation and marketing", "Customer service and support", "Traditional brick manufacturing"],
      correct_answer: "3",
      explanation: "While OpenAI technologies are widely adopted in education, content creation, and customer service, traditional manufacturing industries like brick-making have less direct applications.",
      time_limit: 30,
      points: 1,
      order_index: 8,
      is_active: true
    }
  ]
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}; 