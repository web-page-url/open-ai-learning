import { Section, LearningSession } from '@/types/learning';

// Sample Learning Session Data - Can be replaced with AI-generated content
export const defaultSections: Section[] = [
  {
    id: 1,
    title: "Introduction to Modern Web Development",
    description: "Understanding the fundamentals of web development in 2025",
    partA: {
      id: "s1-a",
      title: "Web Development Overview",
      warmupQuestion: {
        id: "s1-a-warmup",
        question: "What is the primary purpose of HTML in web development?",
        type: "multiple-choice",
        options: ["Styling", "Structure", "Interactivity", "Database"],
        correctAnswer: 1,
        explanation: "HTML provides the structural foundation of web pages",
        timeLimit: 30,
        aiGenerated: false
      },
      discussionContent: {
        id: "s1-a-discussion",
        title: "The Evolution of Web Development",
        content: "Web development has evolved dramatically over the past decade. From simple static HTML pages to complex, interactive applications that rival desktop software. In this discussion, we'll explore how technologies like React, Vue, and Angular have revolutionized the way we build web applications. We'll also discuss the importance of responsive design, accessibility, and performance optimization in modern web development.",
        duration: 10,
        type: "text"
      },
      quickfireQuestions: [
        {
          id: "s1-a-qf1",
          question: "CSS stands for Cascading Style Sheets",
          type: "true-false",
          correctAnswer: "true",
          timeLimit: 60,
          aiGenerated: false
        },
        {
          id: "s1-a-qf2",
          question: "Which of these is a JavaScript framework?",
          type: "multiple-choice",
          options: ["HTML", "CSS", "React", "SQL"],
          correctAnswer: 2,
          timeLimit: 60,
          aiGenerated: false
        }
      ]
    },
    partB: {
      id: "s1-b",
      title: "Modern Development Tools",
      warmupQuestion: {
        id: "s1-b-warmup",
        question: "What is the main benefit of using a package manager like npm?",
        type: "multiple-choice",
        options: ["Faster code execution", "Dependency management", "Better styling", "Database connectivity"],
        correctAnswer: 1,
        explanation: "Package managers help organize and manage project dependencies",
        timeLimit: 30,
        aiGenerated: false
      },
      discussionContent: {
        id: "s1-b-discussion",
        title: "Development Environment Setup",
        content: "Setting up an efficient development environment is crucial for productivity. We'll explore essential tools like VS Code, Git, Node.js, and package managers. Understanding how to configure these tools properly can significantly improve your development workflow. We'll also discuss the importance of version control, code formatting, and debugging tools in modern development practices.",
        duration: 10,
        type: "text"
      },
      quickfireQuestions: [
        {
          id: "s1-b-qf1",
          question: "Git is used for version control",
          type: "true-false",
          correctAnswer: "true",
          timeLimit: 60,
          aiGenerated: false
        },
        {
          id: "s1-b-qf2",
          question: "Which command initializes a new npm project?",
          type: "multiple-choice",
          options: ["npm start", "npm init", "npm install", "npm create"],
          correctAnswer: 1,
          timeLimit: 60,
          aiGenerated: false
        }
      ]
    }
  },
  {
    id: 2,
    title: "Frontend Frameworks & Libraries",
    description: "Deep dive into popular frontend technologies",
    partA: {
      id: "s2-a",
      title: "React Fundamentals",
      warmupQuestion: {
        id: "s2-a-warmup",
        question: "What is a React component?",
        type: "multiple-choice",
        options: ["A CSS file", "A reusable piece of UI", "A database table", "A server endpoint"],
        correctAnswer: 1,
        explanation: "React components are reusable pieces of UI that encapsulate both structure and behavior",
        timeLimit: 30,
        aiGenerated: false
      },
      discussionContent: {
        id: "s2-a-discussion",
        title: "Understanding React's Virtual DOM",
        content: "React's Virtual DOM is one of its most powerful features. It creates a virtual representation of the actual DOM in memory, allowing React to efficiently update only the parts of the UI that have changed. This approach leads to better performance and a smoother user experience. We'll explore how the reconciliation process works and why it makes React applications so fast and responsive.",
        duration: 10,
        type: "text"
      },
      quickfireQuestions: [
        {
          id: "s2-a-qf1",
          question: "JSX is a syntax extension for JavaScript",
          type: "true-false",
          correctAnswer: "true",
          timeLimit: 60,
          aiGenerated: false
        },
        {
          id: "s2-a-qf2",
          question: "Which hook is used for managing component state?",
          type: "multiple-choice",
          options: ["useEffect", "useState", "useContext", "useCallback"],
          correctAnswer: 1,
          timeLimit: 60,
          aiGenerated: false
        }
      ]
    },
    partB: {
      id: "s2-b",
      title: "State Management & Hooks",
      warmupQuestion: {
        id: "s2-b-warmup",
        question: "What is the purpose of the useEffect hook?",
        type: "multiple-choice",
        options: ["Managing state", "Handling side effects", "Creating components", "Styling elements"],
        correctAnswer: 1,
        explanation: "useEffect is used to handle side effects like API calls, subscriptions, and DOM manipulation",
        timeLimit: 30,
        aiGenerated: false
      },
      discussionContent: {
        id: "s2-b-discussion",
        title: "Advanced State Management Patterns",
        content: "As applications grow in complexity, managing state becomes more challenging. We'll explore various state management solutions including React Context, Redux, and Zustand. Understanding when to use local component state versus global state management is crucial for building scalable applications. We'll also discuss best practices for state normalization and avoiding common pitfalls.",
        duration: 10,
        type: "text"
      },
      quickfireQuestions: [
        {
          id: "s2-b-qf1",
          question: "Redux is a state management library",
          type: "true-false",
          correctAnswer: "true",
          timeLimit: 60,
          aiGenerated: false
        },
        {
          id: "s2-b-qf2",
          question: "Which pattern does Redux follow?",
          type: "multiple-choice",
          options: ["MVC", "MVP", "Flux", "Observer"],
          correctAnswer: 2,
          timeLimit: 60,
          aiGenerated: false
        }
      ]
    }
  },
  {
    id: 3,
    title: "Advanced Concepts & Best Practices",
    description: "Professional development practices and optimization techniques",
    partA: {
      id: "s3-a",
      title: "Performance Optimization",
      warmupQuestion: {
        id: "s3-a-warmup",
        question: "What is code splitting in web development?",
        type: "multiple-choice",
        options: ["Dividing CSS files", "Breaking code into smaller bundles", "Writing cleaner code", "Testing strategies"],
        correctAnswer: 1,
        explanation: "Code splitting involves breaking your application into smaller chunks that can be loaded on demand",
        timeLimit: 30,
        aiGenerated: false
      },
      discussionContent: {
        id: "s3-a-discussion",
        title: "Web Performance Metrics & Optimization",
        content: "Web performance directly impacts user experience and business outcomes. We'll explore Core Web Vitals including Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS). Understanding how to measure and optimize these metrics is essential for modern web development. We'll also discuss techniques like lazy loading, image optimization, and caching strategies.",
        duration: 10,
        type: "text"
      },
      quickfireQuestions: [
        {
          id: "s3-a-qf1",
          question: "Lazy loading improves initial page load performance",
          type: "true-false",
          correctAnswer: "true",
          timeLimit: 60,
          aiGenerated: false
        },
        {
          id: "s3-a-qf2",
          question: "Which Core Web Vital measures visual stability?",
          type: "multiple-choice",
          options: ["LCP", "FID", "CLS", "TTFB"],
          correctAnswer: 2,
          timeLimit: 60,
          aiGenerated: false
        }
      ]
    },
    partB: {
      id: "s3-b",
      title: "Testing & Deployment",
      warmupQuestion: {
        id: "s3-b-warmup",
        question: "What is the primary purpose of unit testing?",
        type: "multiple-choice",
        options: ["UI design", "Testing individual components", "Database optimization", "Performance monitoring"],
        correctAnswer: 1,
        explanation: "Unit testing focuses on testing individual components or functions in isolation",
        timeLimit: 30,
        aiGenerated: false
      },
      discussionContent: {
        id: "s3-b-discussion",
        title: "Modern Deployment Strategies",
        content: "Deployment strategies have evolved with the rise of cloud platforms and containerization. We'll explore different deployment approaches including traditional hosting, static site generators, serverless functions, and container orchestration. Understanding CI/CD pipelines, automated testing, and rollback strategies is crucial for maintaining reliable applications in production environments.",
        duration: 10,
        type: "text"
      },
      quickfireQuestions: [
        {
          id: "s3-b-qf1",
          question: "CI/CD stands for Continuous Integration/Continuous Deployment",
          type: "true-false",
          correctAnswer: "true",
          timeLimit: 60,
          aiGenerated: false
        },
        {
          id: "s3-b-qf2",
          question: "Which platform is commonly used for serverless deployment?",
          type: "multiple-choice",
          options: ["Apache", "Nginx", "Vercel", "MySQL"],
          correctAnswer: 2,
          timeLimit: 60,
          aiGenerated: false
        }
      ]
    }
  }
];

export const createDefaultSession = (): LearningSession => ({
  id: `session-${Date.now()}`,
  title: "Interactive Web Development Masterclass",
  description: "A comprehensive learning experience covering modern web development concepts",
  totalSections: 3,
  currentSection: 1,
  currentPart: 'A',
  currentStep: 'warmup',
  startTime: new Date(),
  estimatedDuration: 90,
  status: 'not-started'
}); 