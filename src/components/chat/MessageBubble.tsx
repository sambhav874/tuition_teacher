import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PenTool, Lightbulb, PlayCircle, ArrowUpRight, Volume2, ExternalLink, Download } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
}

function Flashcard({ front, back }: { front: string, back: string }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="group relative h-40 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: "1000px" }}
        >
            <div
                className="relative h-full w-full transition-all duration-500"
                style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
            >
                {/* Front */}
                <div
                    className="absolute inset-0 flex items-center justify-center rounded-sm border border-emerald-900/30 bg-emerald-950/20 p-4 text-center"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden"
                    }}
                >
                    <p className="font-garamond text-lg font-medium text-emerald-100">{front}</p>
                    <span className="absolute bottom-2 right-2 text-[10px] text-emerald-500/40 uppercase tracking-widest">Tap to flip</span>
                </div>
                {/* Back */}
                <div
                    className="absolute inset-0 flex items-center justify-center rounded-sm border border-emerald-500/30 bg-emerald-900/40 p-4 text-center"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                    }}
                >
                    <p className="text-sm text-emerald-200">{back}</p>
                </div>
            </div>
        </div>
    );
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
                    "max-w-[85%] px-6 py-4 text-sm leading-relaxed tracking-wide shadow-sm sm:max-w-[90%]",
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
                    )}

                    {/* References */}
                    {message.metadata?.references && message.metadata.references.length > 0 && (
                        <div className="mt-4 overflow-hidden rounded-sm border border-emerald-900/30 bg-black/40 p-5 shadow-lg backdrop-blur-sm">
                            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/20">
                                    <ExternalLink className="h-3 w-3 text-emerald-400" />
                                </div>
                                <span>References</span>
                            </div>
                            <ul className="space-y-2">
                                {message.metadata.references.map((ref, i) => (
                                    <li key={i}>
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-2 text-sm text-emerald-200/70 hover:text-emerald-100 transition-colors group"
                                        >
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400" />
                                            <span className="font-garamond italic underline decoration-emerald-500/30 underline-offset-4 group-hover:decoration-emerald-400/50">
                                                {ref.title || ref.url}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Flashcards */}
                    {message.metadata?.flashcards && message.metadata.flashcards.length > 0 && (
                        <div className="mt-4 overflow-hidden rounded-sm border border-emerald-900/30 bg-black/40 p-5 shadow-lg backdrop-blur-sm">
                            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/20">
                                    <Lightbulb className="h-3 w-3 text-emerald-400" />
                                </div>
                                <span>Flashcards</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {message.metadata.flashcards.map((card, i) => (
                                    <Flashcard key={i} front={card.front} back={card.back} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes Metadata (Topic & Summary) */}
                    {message.metadata?.type === 'notes' && (
                        <div className="mb-4 space-y-4">
                            {message.metadata.topic && (
                                <div className="rounded-sm border-l-2 border-emerald-500 bg-emerald-900/20 p-4">
                                    <h3 className="font-garamond text-xl font-bold text-emerald-100">{message.metadata.topic}</h3>
                                </div>
                            )}
                            {message.metadata.summary && (
                                <div className="rounded-sm border border-emerald-900/30 bg-black/40 p-4 text-sm text-emerald-200/80 italic font-garamond">
                                    <span className="font-bold text-emerald-500 not-italic mr-2">Summary:</span>
                                    {message.metadata.summary}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mock Test (Legacy) */}
                    {message.metadata?.mockTest && message.metadata.mockTest.length > 0 && !message.metadata.data?.questions && (
                        <div className="mt-4 overflow-hidden rounded-sm border border-emerald-900/30 bg-black/40 p-5 shadow-lg backdrop-blur-sm">
                            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/20">
                                    <PenTool className="h-3 w-3 text-emerald-400" />
                                </div>
                                <span >Mock Test</span>
                            </div>
                            <div className="space-y-8">
                                {message.metadata.mockTest.map((quiz, qIndex) => (
                                    <div key={qIndex} className="space-y-3">
                                        <p className="font-medium text-emerald-100 font-garamond text-base">
                                            <span className="text-emerald-500/50 mr-2">{qIndex + 1}.</span>
                                            {quiz.question}
                                        </p>
                                        <div className="grid gap-2 pl-6">
                                            {quiz.options.map((option, oIndex) => (
                                                <button
                                                    key={oIndex}
                                                    onClick={(e) => {
                                                        const isCorrect = option === quiz.answer;
                                                        const btn = e.currentTarget;
                                                        if (isCorrect) {
                                                            btn.classList.add("bg-emerald-500/20", "border-emerald-500");
                                                        } else {
                                                            btn.classList.add("bg-red-900/20", "border-red-500/50");
                                                        }
                                                    }}
                                                    className="w-full rounded-sm border border-emerald-900/30 bg-emerald-950/10 px-4 py-2 text-left text-sm text-emerald-200/70 hover:bg-emerald-900/30 transition-all font-mono"
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mock Test (New Schema) */}
                    {message.metadata?.type === 'mock-test' && message.metadata.data?.questions && (
                        <div className="mt-4 overflow-hidden rounded-sm border border-emerald-900/30 bg-black/40 p-5 shadow-lg backdrop-blur-sm">
                            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/20">
                                    <PenTool className="h-3 w-3 text-emerald-400" />
                                </div>
                                <span>Mock Test ({message.metadata.data.questions.length} Questions)</span>
                            </div>
                            <div className="space-y-8">
                                {message.metadata.data.questions.map((q: any, qIndex: number) => (
                                    <div key={qIndex} className="space-y-3 border-b border-emerald-900/20 pb-6 last:border-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <p className="font-medium text-emerald-100 font-garamond text-base flex-1">
                                                <span className="text-emerald-500/50 mr-2">{qIndex + 1}.</span>
                                                {q.question}
                                            </p>
                                            <span className="text-[10px] font-mono text-emerald-500/40 bg-emerald-900/10 px-2 py-1 rounded">
                                                {q.marks} Marks
                                            </span>
                                        </div>

                                        {/* Objective */}
                                        {q.type === 'objective' && q.options && (
                                            <div className="grid gap-2 pl-6">
                                                {q.options.map((option: string, oIndex: number) => (
                                                    <button
                                                        key={oIndex}
                                                        onClick={(e) => {
                                                            const isCorrect = option === q.answer;
                                                            const btn = e.currentTarget;
                                                            // Reset siblings
                                                            const parent = btn.parentElement;
                                                            if (parent) {
                                                                Array.from(parent.children).forEach(child => {
                                                                    child.classList.remove("bg-emerald-500/20", "border-emerald-500", "bg-red-900/20", "border-red-500/50");
                                                                });
                                                            }

                                                            if (isCorrect) {
                                                                btn.classList.add("bg-emerald-500/20", "border-emerald-500");
                                                            } else {
                                                                btn.classList.add("bg-red-900/20", "border-red-500/50");
                                                            }
                                                        }}
                                                        className="w-full rounded-sm border border-emerald-900/30 bg-emerald-950/10 px-4 py-2 text-left text-sm text-emerald-200/70 hover:bg-emerald-900/30 transition-all font-mono"
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Theoretical / Numerical */}
                                        {(q.type === 'theoretical' || q.type === 'numerical') && (
                                            <div className="pl-6">
                                                <details className="group">
                                                    <summary className="cursor-pointer text-xs font-mono text-emerald-500/60 hover:text-emerald-400 transition-colors list-none flex items-center gap-2">
                                                        <span>▶ Show Solution</span>
                                                    </summary>
                                                    <div className="mt-3 p-4 rounded-sm bg-emerald-900/10 border border-emerald-900/20 text-sm text-emerald-200/80 font-garamond leading-relaxed animate-in fade-in slide-in-from-top-2">
                                                        <ReactMarkdown>{q.solution || "No solution provided."}</ReactMarkdown>
                                                    </div>
                                                </details>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Text-to-Speech Control */}
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
                        <button
                            onClick={() => {
                                let text = "";
                                let filename = `note-${new Date().toISOString().split('T')[0]}`;

                                // Use metadata if available
                                if (message.metadata?.type === 'notes') {
                                    if (message.metadata.topic) {
                                        text += `# ${message.metadata.topic}\n\n`;
                                        filename = message.metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                    }
                                    if (message.metadata.summary) {
                                        text += `**Summary**: ${message.metadata.summary}\n\n`;
                                    }
                                }

                                text += `${message.content}\n`;

                                // Append Flashcards
                                if (message.metadata?.flashcards) {
                                    text += "\n### Flashcards\n";
                                    message.metadata.flashcards.forEach((card: any, i: number) => {
                                        text += `\n**${i + 1}. ${card.front}**\n${card.back}\n`;
                                    });
                                }

                                const blob = new Blob([text], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${filename}.md`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors font-mono border bg-emerald-900/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/40 hover:text-emerald-200"
                            title="Export this note"
                        >
                            <Download className="h-3 w-3" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
