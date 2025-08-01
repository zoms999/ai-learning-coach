export interface UserInput {
  learningGoal: string;
  interests: string[];
  currentConcerns: string;
  learningLevel?: string;
  timeAvailable?: string;
  email?: string;
}

export interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

export interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "resource" | "activity" | "strategy";
  priority: "high" | "medium" | "low";
}

export interface Conversation {
  id: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  recommendations: Recommendation[];
  userInput: UserInput;
} 