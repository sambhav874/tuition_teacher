"use client";

import { Button } from "@/components/ui/button";
import { Send, Mic, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { generateAIResponse } from "@/lib/ai-service";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useState, useRef, useEffect } from "react";

interface EnglishTutorAreaProps {
    className?: string;
    onOpenSidebar?: () => void;
}

export function EnglishTutorArea({ className, onOpenSidebar }: EnglishTutorAreaProps) {
    const { sessions, currentSessionId, createSession, addMessage } = useStore();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get current session
    const currentSession = sessions.find((s) => s.id === currentSessionId);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentSession?.messages, isLoading]);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleVoiceInput = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64Audio = reader.result as string;
                        // Send audio as attachment immediately
                        handleSubmit(base64Audio);
                    };
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please check permissions.");
            }
        }
    };

    const handleSubmit = async (audioAttachment?: string) => {
        if ((!input.trim() && !audioAttachment) || isLoading) return;

        let sessionId = currentSessionId;
        if (!sessionId) {
            sessionId = createSession();
        }

        const userMessageContent = audioAttachment ? "🎤 [Audio Message]" : input;

        const attachments = audioAttachment ? [audioAttachment] : undefined;

        // Add User Message
        addMessage(sessionId!, {
            role: "user",
            content: userMessageContent,
            attachments,
        });

        setInput("");
        setIsLoading(true);

        try {
            // Generate AI Response with 'english-tutor' mode
            const response = await generateAIResponse(userMessageContent, attachments, { mode: 'english-tutor' });

            if (response.content) {
                addMessage(sessionId!, {
                    role: "agent",
                    content: response.content,
                    metadata: response.metadata,
                });
            }
        } catch (error) {
            console.error("Failed to generate response", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={cn("flex h-full flex-col bg-transparent relative", className)}>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-emerald-900/20 bg-black/20 backdrop-blur-sm">
                <button
                    onClick={onOpenSidebar}
                    className="text-emerald-500/60 hover:text-emerald-400 transition-colors"
                >
                    <span className="sr-only">Menu</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                </button>
                <div className="text-[10px] tracking-[0.2em] font-mono text-emerald-500/40 uppercase">
                    English Tutor
                </div>
                <div className="w-5" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8">
                <div className="mx-auto max-w-3xl space-y-8">
                    {!currentSession || currentSession.messages.length === 0 ? (
                        /* Welcome Message */
                        <div className="flex flex-col items-center justify-center space-y-8 py-20 text-center animate-in fade-in duration-700">
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-black/50 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] biolum-box">
                                <Sparkles className="h-8 w-8 text-emerald-400" />
                                <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-garamond font-light tracking-tight text-emerald-100 biolum-text">
                                    English Tutor
                                </h2>
                                <p className="max-w-md mx-auto text-emerald-500/50 font-mono text-xs tracking-widest uppercase leading-loose">
                                    Speak to me. I will listen and correct your pronunciation.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Message List */
                        currentSession.messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))
                    )}

                    {isLoading && (
                        <div className="flex items-center gap-3 text-emerald-500/50 animate-pulse pl-4">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 pb-6 sm:pb-8">
                <div className="mx-auto max-w-3xl">
                    <div className="relative flex items-end gap-3 rounded-sm border border-emerald-900/30 bg-black/60 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-emerald-500/30 focus-within:bg-black/80 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.1)]">

                        <button
                            onClick={handleVoiceInput}
                            className={cn(
                                "group flex h-12 w-12 shrink-0 items-center justify-center rounded-sm transition-all",
                                isRecording
                                    ? "bg-red-900/20 text-red-500 animate-pulse border border-red-500/30"
                                    : "text-emerald-500/40 hover:bg-emerald-900/20 hover:text-emerald-400"
                            )}
                            title={isRecording ? "Stop Recording" : "Record Audio"}
                        >
                            <Mic className={cn("h-5 w-5 transition-transform", isRecording ? "scale-110" : "group-hover:scale-110")} />
                        </button>

                        <textarea
                            className="flex-1 resize-none bg-transparent py-3.5 text-sm font-mono text-emerald-100 outline-none placeholder:text-emerald-900/60"
                            placeholder="Type or record to practice..."
                            rows={1}
                            style={{ minHeight: "48px", maxHeight: "200px" }}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <Button
                            size="icon"
                            className={cn(
                                "h-12 w-12 shrink-0 rounded-sm transition-all duration-300",
                                input.trim()
                                    ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    : "bg-transparent text-emerald-900/20"
                            )}
                            onClick={() => handleSubmit()}
                            disabled={isLoading || (!input.trim() && !isRecording)}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
