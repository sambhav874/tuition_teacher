"use client";

import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, Paperclip, Loader2, Sparkles, Mic } from "lucide-react";
import { cn, compressImage } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { generateAIResponse } from "@/lib/ai-service";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useState, useRef, useEffect } from "react";

export function ChatArea({ className }: { className?: string }) {
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
        <div className={cn("flex h-full flex-col bg-background relative", className)}>
            {/* Messages Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8">
                <div className="mx-auto max-w-3xl space-y-8">
                    {!currentSession || currentSession.messages.length === 0 ? (
                        /* Welcome Message */
                        <div className="flex flex-col items-center justify-center space-y-6 py-20 text-center animate-in fade-in duration-700">
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-white/10 shadow-2xl">
                                <Sparkles className="h-8 w-8 text-white" />
                                <div className="absolute inset-0 rounded-full bg-white/5 blur-xl" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-semibold tracking-tight text-white">Hello, Student.</h2>
                                <p className="max-w-md text-neutral-400 font-light">
                                    I am your AI Tutor. Upload a problem or ask a question to begin learning.
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
                        <div className="flex items-center gap-3 text-neutral-500 animate-pulse pl-4">
                            <div className="h-2 w-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="h-2 w-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="h-2 w-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 pb-8">
                <div className="mx-auto max-w-3xl">
                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="mb-4 relative inline-block animate-in fade-in zoom-in duration-300">
                            <img src={selectedImage} alt="Preview" className="h-24 w-24 rounded-2xl object-cover border border-white/10 shadow-lg" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-neutral-900 text-white rounded-full p-1.5 shadow-md border border-white/10 hover:bg-neutral-800 transition-colors"
                            >
                                <span className="sr-only">Remove</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                    )}

                    <div className="relative flex items-end gap-3 rounded-[28px] border border-white/10 bg-neutral-900/50 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-white/20 focus-within:bg-neutral-900/80">
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
                            className="h-12 w-12 shrink-0 rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="h-5 w-5" />
                            <span className="sr-only">Attach image</span>
                        </Button>

                        <button
                            onClick={handleVoiceInput}
                            className={cn(
                                "group flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all",
                                isListening
                                    ? "bg-red-500/20 text-red-500 animate-pulse"
                                    : "text-neutral-400 hover:bg-white/10 hover:text-white"
                            )}
                            title={isListening ? "Stop Listening" : "Voice Input"}
                        >
                            <Mic className={cn("h-5 w-5 transition-transform", isListening ? "scale-110" : "group-hover:scale-110")} />
                        </button>

                        <textarea
                            className="flex-1 resize-none bg-transparent py-3.5 text-base font-light text-white outline-none placeholder:text-neutral-500"
                            placeholder="Ask anything..."
                            rows={1}
                            style={{ minHeight: "48px", maxHeight: "200px" }}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <Button
                            size="icon"
                            className={cn(
                                "h-12 w-12 shrink-0 rounded-full transition-all duration-300",
                                input.trim() || selectedImage
                                    ? "bg-white text-black hover:bg-white/90 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
                            )}
                            onClick={handleSubmit}
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                        >
                            <Send className="h-5 w-5 ml-0.5" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-[10px] font-medium uppercase tracking-widest text-neutral-600">
                        AI Tutor • Powered by Gemini
                    </div>
                </div>
            </div>
        </div>
    );
}
