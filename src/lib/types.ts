export interface VideoRef {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
}

export interface Quiz {
    question: string;
    options: string[];
    answer: string;
}

export interface MessageMetadata {
    tricks?: string[];
    illustration?: string;
    videos?: VideoRef[];
    quiz?: Quiz;
}

export interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    attachments?: string[]; // base64
    timestamp: number;
    metadata?: MessageMetadata;
}

export interface Session {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messages: Message[];
}

export interface AppState {
    sessions: Session[];
    currentSessionId: string | null;
    userName: string;
    userGrade: string;
    createSession: () => string;
    selectSession: (id: string) => void;
    deleteSession: (id: string) => void;
    addMessage: (sessionId: string, message: Omit<Message, "id" | "timestamp">) => void;
    setUserName: (name: string) => void;
    setUserGrade: (grade: string) => void;
}
