"use client";

import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, Paperclip, Loader2, Sparkles, Mic, Menu } from "lucide-react";
import { cn, compressImage } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { generateAIResponse } from "@/lib/ai-service";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useState, useRef, useEffect } from "react";

interface ChatAreaProps {
    className?: string;
    onOpenSidebar?: () => void;
}

export function ChatArea({ className, onOpenSidebar }: ChatAreaProps) {
    const { sessions, currentSessionId, createSession, addMessage } = useStore();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get current session
    const currentSession = sessions.find((s) => s.id === currentSessionId);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentSession?.messages, isLoading]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result as string);
                setSelectedImage(compressed);
            };
            reader.readAsDataURL(file);
        }
    };

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;

        recognition.start();

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => prev + (prev ? " " : "") + transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'aborted') {
                // Ignore aborted error (usually user stopped speaking or clicked stop)
                setIsListening(false);
                return;
            }
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
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
            // Generate AI Response
            const response = await generateAIResponse(userMessageContent, attachments);

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
                    <Menu className="h-5 w-5" />
                </button>
                <div className="text-[10px] tracking-[0.2em] font-mono text-emerald-500/40 uppercase">
                    Tuition Teacher
                </div>
                <div className="w-5" /> {/* Spacer for centering */}
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
                                    Greetings, Scholar.
                                </h2>
                                <p className="max-w-md mx-auto text-emerald-500/50 font-mono text-xs tracking-widest uppercase leading-loose">
                                    I am your guide through the academic abyss. <br />
                                    Upload a problem or inquire to begin.
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
                        <div className="mb-4 relative inline-block animate-in fade-in zoom-in duration-300">
                            <img src={selectedImage} alt="Preview" className="h-24 w-24 rounded-sm object-cover border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-black text-emerald-500 rounded-full p-1.5 shadow-md border border-emerald-500/30 hover:bg-emerald-900/40 transition-colors"
                            >
                                <span className="sr-only">Remove</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                    )}

                    <div className="relative flex items-end gap-3 rounded-sm border border-emerald-900/30 bg-black/60 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-emerald-500/30 focus-within:bg-black/80 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 shrink-0 rounded-sm text-emerald-500/40 hover:bg-emerald-900/20 hover:text-emerald-400 transition-all"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="h-5 w-5" />
                            <span className="sr-only">Attach image</span>
                        </Button>

                        <button
                            onClick={handleVoiceInput}
                            className={cn(
                                "group flex h-12 w-12 shrink-0 items-center justify-center rounded-sm transition-all",
                                isListening
                                    ? "bg-red-900/20 text-red-500 animate-pulse border border-red-500/30"
                                    : "text-emerald-500/40 hover:bg-emerald-900/20 hover:text-emerald-400"
                            )}
                            title={isListening ? "Stop Listening" : "Voice Input"}
                        >
                            <Mic className={cn("h-5 w-5 transition-transform", isListening ? "scale-110" : "group-hover:scale-110")} />
                        </button>

                        <textarea
                            className="flex-1 resize-none bg-transparent py-3.5 text-sm font-mono text-emerald-100 outline-none placeholder:text-emerald-900/60"
                            placeholder="Inquire deeply..."
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
                            onClick={handleSubmit}
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-900/40">
                        AI can make mistakes. Verify important information.
                    </div>
                </div>
            </div>
        </div>
    );
}
