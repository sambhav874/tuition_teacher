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
                        ? "bg-foreground text-background rounded-[24px] rounded-br-sm"
                        : "bg-card/50 backdrop-blur-md border border-white/10 text-foreground rounded-[24px] rounded-bl-sm"
                )}
            >
                {/* Text Content */}
                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none text-sm font-medium">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
                            code: ({ className, children, ...props }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return !match ? (
                                    <code className="bg-white/10 rounded px-1 py-0.5 font-mono text-xs" {...props}>
                                        {children}
                                    </code>
                                ) : (
                                    <div className="rounded-lg bg-black/50 p-3 my-2 overflow-x-auto border border-white/10">
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
                                className="max-h-64 rounded-2xl border border-white/10 object-cover shadow-lg grayscale"
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
                        <div className="overflow-hidden rounded-3xl border border-white/5 bg-neutral-900 p-5 shadow-lg">
                            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800">
                                    <PenTool className="h-3 w-3 text-white" />
                                </div>
                                <span>Visual Concept</span>
                            </div>

                            {message.metadata.illustration.startsWith("data:image") ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 shadow-inner">
                                    <img
                                        src={message.metadata.illustration}
                                        alt="AI Generated Illustration"
                                        className="h-full w-full object-cover grayscale"
                                    />
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950/50 p-4 text-center">
                                    <p className="text-sm italic text-neutral-400">
                                        "{message.metadata.illustration}"
                                    </p>
                                    <p className="mt-2 text-[10px] uppercase tracking-widest text-neutral-600">
                                        Imagine this drawing
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tricks */}
                    {message.metadata.tricks && message.metadata.tricks.length > 0 && (
                        <div className="overflow-hidden rounded-3xl border border-white/5 bg-neutral-900 p-5 shadow-lg">
                            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800">
                                    <Lightbulb className="h-3 w-3 text-white" />
                                </div>
                                <span>Memory Tricks</span>
                            </div>
                            <ul className="space-y-3">
                                {message.metadata.tricks.map((trick, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
                                        <span className="leading-relaxed">{trick}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quiz Card */}
                    {message.metadata?.quiz && (
                        <div className="mt-4 overflow-hidden rounded-3xl border border-white/5 bg-neutral-900 p-5 shadow-lg">
                            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800">
                                    <Lightbulb className="h-3 w-3 text-white" />
                                </div>
                                <span>Quick Quiz</span>
                            </div>
                            <div className="space-y-4">
                                <p className="font-medium text-white">{message.metadata.quiz.question}</p>
                                <div className="grid gap-2">
                                    {message.metadata.quiz.options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const isCorrect = option === message.metadata?.quiz?.answer;
                                                alert(isCorrect ? "Correct! 🎉" : "Try again! ❌");
                                            }}
                                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-left text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
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
                        <div className="mt-4 overflow-hidden rounded-3xl border border-white/5 bg-neutral-900 p-5 shadow-lg">
                            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800">
                                    <PlayCircle className="h-3 w-3 text-white" />
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
                                        className="group flex items-center gap-4 rounded-xl border border-white/5 bg-black/50 p-3 transition-colors hover:bg-white/5"
                                    >
                                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-100 grayscale"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <PlayCircle className="h-6 w-6 text-white opacity-80" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="truncate text-sm font-medium text-neutral-200 group-hover:text-white">
                                                {video.title}
                                            </h4>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
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
                        <div className="flex rounded-full bg-neutral-800 p-0.5">
                            <button
                                onClick={() => setVoiceLang('hi')}
                                className={cn(
                                    "rounded-full px-2 py-1 text-[10px] font-bold transition-all",
                                    voiceLang === 'hi' ? "bg-neutral-600 text-white" : "text-neutral-500 hover:text-neutral-300"
                                )}
                            >
                                HI
                            </button>
                            <button
                                onClick={() => setVoiceLang('en')}
                                className={cn(
                                    "rounded-full px-2 py-1 text-[10px] font-bold transition-all",
                                    voiceLang === 'en' ? "bg-neutral-600 text-white" : "text-neutral-500 hover:text-neutral-300"
                                )}
                            >
                                EN
                            </button>
                        </div>
                        <button
                            onClick={handleSpeak}
                            className={cn(
                                "flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                                isSpeaking
                                    ? "bg-white text-black animate-pulse"
                                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
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
