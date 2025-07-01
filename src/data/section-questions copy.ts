// Hardcoded questions for all 6 sections
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
    title: "What is GitHub Copilot?",
    description: "Understanding GitHub Copilot as an AI pair programmer",
    difficulty: "beginner",
    duration: 1,
    questions: [
      {
        id: "copilot-1-1",
        question: "What is GitHub Copilot?",
        type: "multiple-choice",
        options: ["GitHub Copilot is an AI pair programmer that offers real-time code suggestions.", "GitHub Copilot is OpenAI's new autonomous agent for running end-to-end tests.", "GitHub Copilot is a Git repository hosting service built by Microsoft.", "GitHub Copilot is a package manager integrated into Visual Studio Code."],
        correctAnswer: 0,
        explanation: "GitHub Copilot is an AI pair programmer that offers real-time code suggestions to help developers write code more efficiently.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-1-2",
        question: "How does GitHub Copilot boost developer productivity?",
        type: "multiple-choice",
        options: ["By offloading boilerplate and repetitive coding tasks to free you for logic.", "By managing project dependencies across multiple services.", "By automatically writing system architecture documentation.", "By deploying code directly to cloud environments."],
        correctAnswer: 0,
        explanation: "GitHub Copilot boosts productivity by handling boilerplate and repetitive coding tasks, allowing developers to focus on business logic and creative problem-solving.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },
  
  2: {
    id: 2,
    title: "Key Features and Plans",
    description: "Exploring GitHub Copilot's features and subscription options",
    difficulty: "beginner",
    duration: 1,
    questions: [
      {
        id: "copilot-2-1",
        question: "Which feature suggests entire functions or code blocks inline?",
        type: "multiple-choice",
        options: ["Inline Code Completion.", "Copilot Chat.", "Pull Request Review.", "CLI Code Runner."],
        correctAnswer: 0,
        explanation: "Inline Code Completion is the feature that suggests entire functions or code blocks directly in your editor as you type.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-2-2",
        question: "Which Copilot capability enables automatic PR reviews and Q&A within VS Code?",
        type: "multiple-choice",
        options: ["Copilot Chat.", "Inline Code Suggestions.", "Ghost Text.", "Live Share."],
        correctAnswer: 0,
        explanation: "Copilot Chat enables automatic PR reviews and Q&A functionality directly within VS Code and other supported editors.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  3: {
    id: 3,
    title: "Working with VS Code",
    description: "Using GitHub Copilot effectively in Visual Studio Code",
    difficulty: "intermediate",
    duration: 1,
    questions: [
      {
        id: "copilot-3-1",
        question: "What are \"ghost text\" suggestions in VS Code?",
        type: "multiple-choice",
        options: ["Light-gray, inline code completions shown as you type.", "A floating help panel with sample snippets.", "An audio narration of code changes.", "An external browser window with documentation."],
        correctAnswer: 0,
        explanation: "Ghost text suggestions are the light-gray, inline code completions that appear as you type in VS Code, showing Copilot's suggestions.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-3-2",
        question: "To accept a Copilot suggestion in VS Code, which key do you press by default?",
        type: "multiple-choice",
        options: ["Tab.", "Enter.", "Ctrl + Space.", "Esc."],
        correctAnswer: 0,
        explanation: "By default, you press the Tab key to accept a Copilot suggestion in VS Code.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  4: {
    id: 4,
    title: "Framework-Specific Support",
    description: "How GitHub Copilot works with different frameworks",
    difficulty: "intermediate",
    duration: 1,
    questions: [
      {
        id: "copilot-4-1",
        question: "In a Spring Boot app, typing @GetMapping and a method stub will most likely prompt Copilot to:",
        type: "multiple-choice",
        options: ["Suggest a complete controller method implementation.", "Generate a Dockerfile.", "Create a new JPA database schema.", "Write unit tests only."],
        correctAnswer: 0,
        explanation: "When you type @GetMapping and a method stub in Spring Boot, Copilot will suggest a complete controller method implementation based on the context.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-4-2",
        question: "What does Copilot's \"framework awareness\" enable?",
        type: "multiple-choice",
        options: ["Generating code using common APIs like Spring's @Autowired.", "Automatically updating library versions.", "Hosting your application in the cloud.", "Encrypting your source code."],
        correctAnswer: 0,
        explanation: "Framework awareness enables Copilot to generate code using common APIs and patterns specific to frameworks like Spring's @Autowired annotation.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  5: {
    id: 5,
    title: "Responsible Use and Limitations",
    description: "Understanding responsible AI practices with GitHub Copilot",
    difficulty: "advanced",
    duration: 1,
    questions: [
      {
        id: "copilot-5-1",
        question: "Which practice is not recommended when using Copilot?",
        type: "multiple-choice",
        options: ["Blindly trusting all suggestions without review.", "Reviewing and testing AI-generated code.", "Adding comments to note AI-assisted sections.", "Using linters and security scanners on generated code."],
        correctAnswer: 0,
        explanation: "Blindly trusting all suggestions without review is not recommended. Always review and test AI-generated code before using it in production.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-5-2",
        question: "\"You're the driver\" in Copilot usage means:",
        type: "multiple-choice",
        options: ["You remain responsible for design, architecture, and final quality.", "Copilot autonomously makes all decisions.", "You delegate code reviews entirely to Copilot.", "Copilot writes your entire README.md."],
        correctAnswer: 0,
        explanation: "'You're the driver' means you remain responsible for design decisions, architecture choices, and ensuring the final quality of your code.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  6: {
    id: 6,
    title: "Hands-On Examples Overview",
    description: "Practical examples of using GitHub Copilot",
    difficulty: "advanced",
    duration: 1,
    questions: [
      {
        id: "copilot-6-1",
        question: "In the Java demo (\"CustomerRewards\"), you'd start by writing a comment such as // calculate reward points; Copilot will then:",
        type: "multiple-choice",
        options: ["Generate the method stub and implementation for computing points.", "Create a Docker Compose file.", "Publish the code to npm.", "Delete the class."],
        correctAnswer: 0,
        explanation: "In the Java demo, writing '// calculate reward points' prompts Copilot to generate the method stub and implementation for computing reward points.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-6-2",
        question: "The hands-on wrap-up emphasizes that after accepting suggestions you should always:",
        type: "multiple-choice",
        options: ["Review and run tests to verify correctness.", "Immediately merge without checks.", "Delete all comments.", "Uninstall Copilot."],
        correctAnswer: 0,
        explanation: "The hands-on wrap-up emphasizes that you should always review and run tests to verify the correctness of Copilot's suggestions.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  7: {
    id: 7,
    title: "Code Review & Quality",
    description: "Reviewing AI-generated code",
    difficulty: "advanced",
    duration: 1,
    questions: [
      {
        id: "copilot-7-1",
        question: "What should you always do before accepting Copilot's code suggestions?",
        type: "multiple-choice",
        options: ["Review the code for correctness and security.", "Accept it immediately to save time.", "Run it in production first.", "Share it with the entire team."],
        correctAnswer: 0,
        explanation: "You should always review Copilot's code suggestions for correctness, security, and alignment with your project requirements before accepting them.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-7-2",
        question: "How can you ensure AI-generated code meets your project's quality standards?",
        type: "multiple-choice",
        options: ["Use linters, run tests, and conduct peer reviews.", "Accept all suggestions without changes.", "Only use Copilot for comments.", "Disable Copilot entirely."],
        correctAnswer: 0,
        explanation: "Ensure quality by using linters, running comprehensive tests, and conducting peer reviews on AI-generated code.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  8: {
    id: 8,
    title: "Security Considerations",
    description: "Safe usage and data privacy",
    difficulty: "advanced",
    duration: 1,
    questions: [
      {
        id: "copilot-8-1",
        question: "What security risk should you be aware of when using Copilot?",
        type: "multiple-choice",
        options: ["It might suggest code with security vulnerabilities.", "It automatically encrypts all your data.", "It never suggests insecure code.", "It only works with public repositories."],
        correctAnswer: 0,
        explanation: "Copilot might suggest code with security vulnerabilities, so always review suggestions for potential security issues.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-8-2",
        question: "How does GitHub Copilot handle your private code data?",
        type: "multiple-choice",
        options: ["Private code is not used to train the model.", "All code is shared publicly.", "Private code is used to improve suggestions.", "Data is sold to third parties."],
        correctAnswer: 0,
        explanation: "GitHub Copilot does not use private repository code to train its models, ensuring your proprietary code remains private.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  9: {
    id: 9,
    title: "Troubleshooting",
    description: "Common issues and solutions",
    difficulty: "intermediate",
    duration: 1,
    questions: [
      {
        id: "copilot-9-1",
        question: "What should you do if Copilot suggestions aren't appearing?",
        type: "multiple-choice",
        options: ["Check your internet connection and Copilot subscription status.", "Restart your computer immediately.", "Uninstall and reinstall VS Code.", "Switch to a different programming language."],
        correctAnswer: 0,
        explanation: "If suggestions aren't appearing, first check your internet connection and verify your Copilot subscription is active.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-9-2",
        question: "How can you improve the quality of Copilot's suggestions?",
        type: "multiple-choice",
        options: ["Write clear, descriptive comments and function names.", "Type as fast as possible.", "Use only single-letter variable names.", "Work without any comments."],
        correctAnswer: 0,
        explanation: "Writing clear, descriptive comments and using meaningful function names helps Copilot understand context and provide better suggestions.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  },

  10: {
    id: 10,
    title: "Advanced Techniques",
    description: "Expert tips and tricks",
    difficulty: "advanced",
    duration: 1,
    questions: [
      {
        id: "copilot-10-1",
        question: "What's an advanced technique for getting better Copilot suggestions?",
        type: "multiple-choice",
        options: ["Provide detailed docstrings and type hints.", "Use very short variable names.", "Avoid writing any comments.", "Only work with single-line functions."],
        correctAnswer: 0,
        explanation: "Providing detailed docstrings and type hints gives Copilot more context, resulting in more accurate and helpful suggestions.",
        timeLimit: 30,
        points: 1,
        category: "general"
      },
      {
        id: "copilot-10-2",
        question: "How can you use Copilot Chat for complex problem-solving?",
        type: "multiple-choice",
        options: ["Ask it to explain algorithms and suggest optimizations.", "Only use it for simple syntax questions.", "Avoid using it for debugging.", "Use it only for documentation."],
        correctAnswer: 0,
        explanation: "Copilot Chat can help explain complex algorithms, suggest optimizations, assist with debugging, and provide architectural guidance.",
        timeLimit: 30,
        points: 1,
        category: "general"
      }
    ]
  }
}; 
