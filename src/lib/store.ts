import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Session, Message } from './types';

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            sessions: [],
            currentSessionId: null,
            userName: "",
            userGrade: "",

            createSession: () => {
                const newSession: Session = {
                    id: uuidv4(),
                    title: 'New Chat',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    messages: [],
                };
                set((state) => ({
                    sessions: [newSession, ...state.sessions],
                    currentSessionId: newSession.id,
                }));
                return newSession.id;
            },

            selectSession: (id) => {
                set({ currentSessionId: id });
            },

            addMessage: (sessionId, message) => {
                const newMessage: Message = {
                    ...message,
                    id: uuidv4(),
                    timestamp: Date.now(),
                };

                set((state) => {
                    const sessions = state.sessions.map((session) => {
                        if (session.id === sessionId) {
                            // Update title if it's the first user message and title is default
                            let title = session.title;
                            if (
                                session.messages.length === 0 &&
                                message.role === 'user' &&
                                message.content
                            ) {
                                title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
                            }

                            return {
                                ...session,
                                title,
                                updatedAt: Date.now(),
                                messages: [...session.messages, newMessage],
                            };
                        }
                        return session;
                    });

                    // Move updated session to top
                    const updatedSession = sessions.find((s) => s.id === sessionId);
                    const otherSessions = sessions.filter((s) => s.id !== sessionId);

                    return {
                        sessions: updatedSession ? [updatedSession, ...otherSessions] : sessions,
                    };
                });
            },

            deleteSession: (id) => {
                set((state) => ({
                    sessions: state.sessions.filter((s) => s.id !== id),
                    currentSessionId:
                        state.currentSessionId === id ? null : state.currentSessionId,
                }));
            },
            setUserName: (name) => set({ userName: name }),
            setUserGrade: (grade) => set({ userGrade: grade }),
        }),
        {
            name: 'ai-tutor-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
