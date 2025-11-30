"use client";

import { Button } from "@/components/ui/button";
import { Send, PenTool, Image as ImageIcon, Loader2, Download } from "lucide-react";
import { cn, compressImage } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { generateAIResponse } from "@/lib/ai-service";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useState, useRef, useEffect } from "react";

interface MockTestAreaProps {
    className?: string;
    onOpenSidebar?: () => void;
}

export function MockTestArea({ className, onOpenSidebar }: MockTestAreaProps) {
    const { sessions, currentSessionId, createSession, addMessage } = useStore();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get current session
    const currentSession = sessions.find((s) => s.id === currentSessionId);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentSession?.messages, isLoading]);

    // Start new session on mount
    useEffect(() => {
        createSession();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file);
            setSelectedImage(compressed);
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to process image");
        }
    };

    const handleExport = () => {
        if (!currentSession) return;

        const content = currentSession.messages.map(m => {
            const role = m.role === 'user' ? 'User' : 'AI';
            return `[${role}]:\n${m.content}\n\n`;
        }).join('---\n\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mock-test-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        let sessionId = currentSessionId;
        if (!sessionId) {
            sessionId = createSession();
        }

        const userMessageContent = input;
        const attachments = selectedImage ? [selectedImage] : undefined;

        // Add User Message
        addMessage(sessionId!, {
            role: "user",
            content: userMessageContent,
            attachments,
        });

        setInput("");
        setSelectedImage(null);
        setIsLoading(true);

        try {
            // Generate AI Response with 'mock-test' mode
            const response = await generateAIResponse(userMessageContent, attachments, { mode: 'mock-test' });

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
                    Mock Tests
                </div>
                <button
                    onClick={handleExport}
                    className="text-emerald-500/60 hover:text-emerald-400 transition-colors"
                    title="Export Test"
                >
                    <Download className="h-5 w-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8">
                <div className="mx-auto max-w-3xl space-y-8">
                    {!currentSession || currentSession.messages.length === 0 ? (
                        /* Welcome Message */
                        <div className="flex flex-col items-center justify-center space-y-8 py-20 text-center animate-in fade-in duration-700">
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-black/50 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] biolum-box">
                                <PenTool className="h-8 w-8 text-emerald-400" />
                                <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-garamond font-light tracking-tight text-emerald-100 biolum-text">
                                    AI Exam Setter
                                </h2>
                                <p className="max-w-md mx-auto text-emerald-500/50 font-mono text-xs tracking-widest uppercase leading-loose">
                                    Tell me the Subject, Grade, Board, and Topic. I will create a perfect mock test for you.
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
                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="mb-4 relative inline-block">
                            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-sm border border-emerald-500/30" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    )}

                    <div className="relative flex items-end gap-3 rounded-sm border border-emerald-900/30 bg-black/60 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-emerald-500/30 focus-within:bg-black/80 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.1)]">

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-sm text-emerald-500/40 transition-all hover:bg-emerald-900/20 hover:text-emerald-400"
                            title="Upload Reference Question"
                        >
                            <ImageIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                        </button>

                        <textarea
                            className="flex-1 resize-none bg-transparent py-3.5 text-sm font-mono text-emerald-100 outline-none placeholder:text-emerald-900/60"
                            placeholder="e.g. Class 10 CBSE Math, Quadratic Equations..."
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
                                input.trim() || selectedImage
                                    ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    : "bg-transparent text-emerald-900/20"
                            )}
                            onClick={() => handleSubmit()}
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send message</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
