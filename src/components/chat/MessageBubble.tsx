import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PenTool, Lightbulb, PlayCircle, ArrowUpRight, Volume2, ExternalLink } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceLang, setVoiceLang] = useState<'hi' | 'en'>('hi');

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(message.content);
            const voices = window.speechSynthesis.getVoices();

            let targetVoice;
            if (voiceLang === 'hi') {
                // Prioritize "Lekha" as requested, then any Hindi voice
                targetVoice = voices.find(v => v.name === 'Lekha') || voices.find(v => v.lang.includes('hi'));
            } else {
                // Prioritize English (India), then US
                targetVoice = voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-US'));
            }

            if (targetVoice) {
                utterance.voice = targetVoice;
            }

            utterance.onend = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div
            className={cn(
                "flex w-full flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500",
                isUser ? "items-end" : "items-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[85%] px-6 py-4 text-sm leading-relaxed tracking-wide shadow-sm sm:max-w-[75%]",
                    isUser
                        ? "bg-emerald-900/30 border border-emerald-500/20 text-emerald-100 rounded-sm rounded-br-none backdrop-blur-md"
                        : "bg-black/40 backdrop-blur-md border border-emerald-900/30 text-emerald-100/90 rounded-sm rounded-bl-none"
                )}
            >
                {/* Text Content */}
                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none text-sm font-light font-sans">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-emerald-200/80">{children}</ul>,
                            ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-emerald-200/80">{children}</ol>,
                            li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
                            code: ({ className, children, ...props }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return !match ? (
                                    <code className="bg-emerald-900/30 text-emerald-300 rounded px-1 py-0.5 font-mono text-xs border border-emerald-500/10" {...props}>
                                        {children}
                                    </code>
                                ) : (
                                    <div className="rounded-sm bg-black/80 p-3 my-2 overflow-x-auto border border-emerald-900/30">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </div>
                                );
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Attachments (Images) */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {message.attachments.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt="Attachment"
                                className="max-h-64 rounded-sm border border-emerald-900/30 object-cover shadow-lg grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Metadata (Videos, Tricks, etc.) - Only for Agent */}
            {!isUser && message.metadata && (
                <div className="mt-2 w-full max-w-[85%] space-y-4 sm:max-w-[75%]">

                    {/* Illustration Suggestion */}
                    {message.metadata.illustration && (
                        <div className="overflow-hidden rounded-sm border border-emerald-900/30 bg-black/40 p-5 shadow-lg backdrop-blur-sm">
                            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/20">
                                    <PenTool className="h-3 w-3 text-emerald-400" />
                                </div>
                                <span>Visual Concept</span>
                            </div>

                            {message.metadata.illustration.startsWith("data:image") ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-emerald-900/20 shadow-inner">
                                    <img
                                        src={message.metadata.illustration}
                                        alt="AI Generated Illustration"
                                        className="h-full w-full object-cover grayscale opacity-80 hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            ) : (
                                <div className="rounded-sm border border-dashed border-emerald-900/40 bg-emerald-950/20 p-4 text-center">
                                    <p className="text-sm italic text-emerald-500/60 font-garamond">
                                        "{message.metadata.illustration}"
                                    </p>
                                    <p className="mt-2 text-[10px] uppercase tracking-widest text-emerald-700">
                                        Imagine this drawing
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tricks */}
                    {message.metadata.tricks && message.metadata.tricks.length > 0 && (
                        <div className="overflow-hidden rounded-sm border border-emerald-900/30 bg-black/40 p-5 shadow-lg backdrop-blur-sm">
                            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/20">
                                    <Lightbulb className="h-3 w-3 text-emerald-400" />
                                </div>
                                <span>Memory Tricks</span>
                            </div>
                            <ul className="space-y-3">
                                {message.metadata.tricks.map((trick, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-emerald-100/80 font-garamond italic">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/50" />
                                        <span className="leading-relaxed">{trick}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quiz Card */}
                    {message.metadata?.quiz && (
                        <div className="mt-4 overflow-hidden rounded-sm border border-emerald-900/30 bg-black/40 p-5 shadow-lg backdrop-blur-sm">
                            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/20">
                                    <Lightbulb className="h-3 w-3 text-emerald-400" />
                                </div>
                                <span>Quick Quiz</span>
                            </div>
                            <div className="space-y-4">
                                <p className="font-medium text-emerald-100 font-garamond text-lg">{message.metadata.quiz.question}</p>
                                <div className="grid gap-2">
                                    {message.metadata.quiz.options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const isCorrect = option === message.metadata?.quiz?.answer;
                                                alert(isCorrect ? "Correct! 🎉" : "Try again! ❌");
                                            }}
                                            className="w-full rounded-sm border border-emerald-900/30 bg-emerald-950/20 px-4 py-3 text-left text-sm text-emerald-200/70 hover:bg-emerald-900/40 hover:text-emerald-100 hover:border-emerald-500/30 transition-all font-mono"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Helpful Videos */}
                    {message.metadata?.videos && message.metadata.videos.length > 0 && (
                        <div className="mt-4 overflow-hidden rounded-sm border border-emerald-900/30 bg-black/40 p-5 shadow-lg backdrop-blur-sm">
                            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/20">
                                    <PlayCircle className="h-3 w-3 text-emerald-400" />
                                </div>
                                <span>Helpful Videos</span>
                            </div>
                            <div className="space-y-3">
                                {message.metadata.videos.map((video) => (
                                    <a
                                        key={video.id}
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-4 rounded-sm border border-emerald-900/20 bg-emerald-950/10 p-3 transition-colors hover:bg-emerald-900/30 hover:border-emerald-500/20"
                                    >
                                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-sm bg-neutral-800">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-100 grayscale hover:grayscale-0"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <PlayCircle className="h-6 w-6 text-white opacity-80" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="truncate text-sm font-medium text-emerald-100/90 group-hover:text-emerald-50 font-garamond">
                                                {video.title}
                                            </h4>
                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500/60 font-mono uppercase">
                                                <span>Watch on YouTube</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}    {/* Text-to-Speech Control */}
                    <div className="mt-2 flex justify-end items-center gap-2">
                        <div className="flex rounded-full bg-emerald-900/20 border border-emerald-500/10 p-0.5">
                            <button
                                onClick={() => setVoiceLang('hi')}
                                className={cn(
                                    "rounded-full px-2 py-1 text-[10px] font-bold transition-all font-mono",
                                    voiceLang === 'hi' ? "bg-emerald-800 text-emerald-100" : "text-emerald-500/50 hover:text-emerald-300"
                                )}
                            >
                                HI
                            </button>
                            <button
                                onClick={() => setVoiceLang('en')}
                                className={cn(
                                    "rounded-full px-2 py-1 text-[10px] font-bold transition-all font-mono",
                                    voiceLang === 'en' ? "bg-emerald-800 text-emerald-100" : "text-emerald-500/50 hover:text-emerald-300"
                                )}
                            >
                                EN
                            </button>
                        </div>
                        <button
                            onClick={handleSpeak}
                            className={cn(
                                "flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors font-mono border",
                                isSpeaking
                                    ? "bg-emerald-500 text-black border-emerald-500 animate-pulse"
                                    : "bg-emerald-900/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/40 hover:text-emerald-200"
                            )}
                        >
                            <Volume2 className="h-3 w-3" />
                            <span>{isSpeaking ? "Stop" : "Listen"}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
