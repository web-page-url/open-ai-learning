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
    title: "OpenAI Agents SDK Essentials",
    description: "Explore core features, architecture, and applications of OpenAI’s Agent SDK with real-world use cases.",
    difficulty: "intermediate",
    duration: 2,
    questions: [
      {
        id: "openai-1-1",
        question: "Which of the following is a use case for Retrieval-Augmented Generation (RAG) using AI agents?",
        type: "multiple-choice",
        options: [
          "Generating video game levels procedurally",
          "Answering HR policy questions using internal documents",
          "Converting text into speech",
          "Scheduling meetings with a voice assistant"
        ],
        correctAnswer: 1,
        explanation: "RAG enables AI agents to provide contextual answers from internal documents like HR policies by connecting to knowledge bases.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-2",
        question: "What is the purpose of a triage agent in a multi-agent system?",
        type: "multiple-choice",
        options: [
          "To translate queries into different languages",
          "To act as a general-purpose response agent",
          "To route user queries to specialized agents",
          "To prevent API rate limits from triggering"
        ],
        correctAnswer: 2,
        explanation: "The triage agent analyzes user queries and delegates them to appropriate specialized agents like Math Tutor or History Tutor.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-3",
        question: "True or False: Guardrails in the Agents SDK are used for tracing agent execution history.",
        type: "true-false",
        correctAnswer: "false",
        explanation: "Guardrails ensure schema validation for input/output safety. Tracing is used for debugging execution paths.",
        timeLimit: 20,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-4",
        question: "Which model is used in OpenAI’s API to generate images from text descriptions?",
        type: "multiple-choice",
        options: [
          "Whisper",
          "GPT-4o",
          "Codex",
          "DALL·E"
        ],
        correctAnswer: 3,
        explanation: "DALL·E is OpenAI’s image-generation model that creates visuals from natural language prompts.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-5",
        question: "True or False: The Whisper model supports text-to-image generation.",
        type: "true-false",
        correctAnswer: "false",
        explanation: "Whisper is used for speech-to-text and text-to-speech tasks, not for generating images.",
        timeLimit: 20,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-6",
        question: "Which of the following is a benefit of the Agent SDK's tracing dashboard?",
        type: "multiple-choice",
        options: [
          "Auto-generates prompts for the user",
          "Shows token usage and execution paths",
          "Stores all training data in the cloud",
          "Creates UI mockups for developers"
        ],
        correctAnswer: 1,
        explanation: "The tracing dashboard lets developers see token usage, tool invocations, and how agents made decisions.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-7",
        question: "OpenAI's models can be used for code generation and programming assistance.",
        type: "true-false",
        correctAnswer: "true",
        explanation: "Yes, OpenAI's models like GPT-4 and Codex are capable of generating code, debugging, and providing programming assistance across multiple languages.",
        timeLimit: 20,
        points: 1,
        category: "general"
      },
      {
        id: "openai-1-8",
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

