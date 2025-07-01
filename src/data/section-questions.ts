// Hardcoded questions for 2 sections about OpenAI
export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  timeLimit: number;
  points: number;
  category: 'general' | 'general' | 'quickfire';
}

export interface SectionData {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  questions: Question[];
}

export const sectionData: Record<number, SectionData> = {
  1: {
    id: 1,
    title: "Introduction to OpenAI",
    description: "Understanding OpenAI, its mission, and core AI technologies",
    difficulty: "beginner",
    duration: 1,
    questions: [
      {
        id: "openai-1-1",
        question: "What is OpenAI's primary mission?",
        type: "multiple-choice",
        options: [
          "To create artificial general intelligence (AGI) that benefits all of humanity",
          "To develop gaming software exclusively",
          "To create social media platforms",
          "To build e-commerce solutions"
        ],
        correctAnswer: 0,
        explanation: "OpenAI's mission is to ensure that artificial general intelligence (AGI) benefits all of humanity through safe and beneficial AI development.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-2",
        question: "Which of the following is a well-known language model developed by OpenAI?",
        type: "multiple-choice",
        options: [
          "BERT",
          "GPT (Generative Pre-trained Transformer)",
          "ResNet",
          "YOLO"
        ],
        correctAnswer: 1,
        explanation: "GPT (Generative Pre-trained Transformer) is OpenAI's flagship language model series, including GPT-3, GPT-4, and ChatGPT.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-3",
        question: "OpenAI was founded as a non-profit organization.",
        type: "true-false",
        correctAnswer: "true",
        explanation: "OpenAI was initially founded as a non-profit AI research company in 2015, though it later transitioned to a 'capped-profit' model.",
        timeLimit: 20,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-4",
        question: "What does 'GPT' stand for in OpenAI's language models?",
        type: "multiple-choice",
        options: [
          "General Purpose Technology",
          "Generative Pre-trained Transformer",
          "Global Processing Tool",
          "Graphical Programming Toolkit"
        ],
        correctAnswer: 1,
        explanation: "GPT stands for Generative Pre-trained Transformer, referring to the architecture that generates text based on transformer neural networks.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  2: {
    id: 2,
    title: "OpenAI Applications and Use Cases",
    description: "Exploring practical applications and real-world uses of OpenAI technologies",
    difficulty: "intermediate",
    duration: 1,
    questions: [
      {
        id: "openai-2-1",
        question: "Which of the following is a primary use case for ChatGPT?",
        type: "multiple-choice",
        options: [
          "Image recognition only",
          "Conversational AI and text generation",
          "Video editing",
          "Database management"
        ],
        correctAnswer: 1,
        explanation: "ChatGPT is designed for conversational AI, helping users with text generation, answering questions, writing assistance, and dialogue.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "openai-2-2",
        question: "What is DALL-E used for?",
        type: "multiple-choice",
        options: [
          "Text translation",
          "Code generation",
          "AI-generated images from text descriptions",
          "Music composition"
        ],
        correctAnswer: 2,
        explanation: "DALL-E is OpenAI's AI system that generates digital images from natural language descriptions, revolutionizing AI-powered creative content.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "openai-2-3",
        question: "OpenAI's models can be used for code generation and programming assistance.",
        type: "true-false",
        correctAnswer: "true",
        explanation: "Yes, OpenAI's models like GPT-4 and Codex are capable of generating code, debugging, and providing programming assistance across multiple languages.",
        timeLimit: 20,
        points: 1,
        category: "general"
      },
      {
        id: "openai-2-4",
        question: "Which industry has NOT commonly adopted OpenAI technologies?",
        type: "multiple-choice",
        options: [
          "Education and tutoring",
          "Content creation and marketing",
          "Customer service and support",
          "Traditional brick manufacturing"
        ],
        correctAnswer: 3,
        explanation: "While OpenAI technologies are widely adopted in education, content creation, and customer service, traditional manufacturing industries like brick-making have less direct applications.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  }
}; 
