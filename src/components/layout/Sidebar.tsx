"use client";

import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Settings, X, Mic, BookOpen, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { SettingsModal } from "@/components/settings/SettingsModal";

interface SidebarProps {
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ className, isOpen = false, onClose }: SidebarProps) {
    const { sessions, currentSessionId, createSession, selectSession, deleteSession } = useStore();
    const [mounted, setMounted] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Hydration fix
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex h-full w-[280px] flex-col bg-black/80 backdrop-blur-xl border-r border-emerald-900/30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
                className
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                        <div className="pointer-events-auto group cursor-pointer">
                            <div className="text-[10px] tracking-[0.4em] font-mono text-emerald-500/80 uppercase mb-1 group-hover:text-emerald-400 transition-colors">
                                Tuition
                            </div>
                            <div className="text-[10px] tracking-[0.4em] font-mono text-emerald-500/50 uppercase group-hover:text-emerald-400 transition-colors">
                                Teacher
                            </div>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden text-emerald-500/50 hover:text-emerald-400 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* New Session Button */}
                <div className="px-4 mb-6 space-y-2">
                    <button
                        onClick={() => createSession()}
                        className="group relative flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-900/20 border border-emerald-500/30 py-3 text-xs font-mono uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-900/40 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Session</span>
                    </button>

                    <a
                        href="/english-tutor"
                        className="group relative flex w-full items-center justify-center gap-2 rounded-sm bg-blue-900/20 border border-blue-500/30 py-3 text-xs font-mono uppercase tracking-widest text-blue-400 transition-all hover:bg-blue-900/40 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] active:scale-[0.98]"
                    >
                        <Mic className="h-4 w-4" />
                        <span>English Tutor</span>
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                        <a
                            href="/mock-tests"
                            className="group relative flex w-full items-center justify-center gap-2 rounded-sm bg-purple-900/20 border border-purple-500/30 py-3 text-xs font-mono uppercase tracking-widest text-purple-400 transition-all hover:bg-purple-900/40 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] active:scale-[0.98]"
                        >
                            <PenTool className="h-4 w-4" />
                            <span>Mock Tests</span>
                        </a>
                        <a
                            href="/notes"
                            className="group relative flex w-full items-center justify-center gap-2 rounded-sm bg-amber-900/20 border border-amber-500/30 py-3 text-xs font-mono uppercase tracking-widest text-amber-400 transition-all hover:bg-amber-900/40 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] active:scale-[0.98]"
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Notes</span>
                        </a>
                    </div>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-4">
                    <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/40 pl-2">
                        History
                    </div>
                    <div className="space-y-1">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    "group flex items-center justify-between rounded-sm px-4 py-3 transition-all cursor-pointer border border-transparent",
                                    currentSessionId === session.id
                                        ? "bg-emerald-900/20 border-emerald-500/20 text-emerald-100"
                                        : "text-emerald-500/60 hover:bg-emerald-900/10 hover:text-emerald-200"
                                )}
                                onClick={() => selectSession(session.id)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare className="h-3 w-3 shrink-0 opacity-70" />
                                    <span className="truncate text-xs font-mono tracking-wide">
                                        {session.title}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSession(session.id);
                                    }}
                                    className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / Settings */}
                <div className="p-4 border-t border-emerald-900/30">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex w-full items-center gap-3 rounded-sm px-4 py-3 text-emerald-500/60 hover:bg-emerald-900/10 hover:text-emerald-200 transition-colors"
                    >
                        <Settings className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                            <span className="font-mono text-xs uppercase tracking-widest">Settings</span>
                        </div>
                    </button>
                </div>
            </div >

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}
