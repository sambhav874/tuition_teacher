"use client";

import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { SettingsModal } from "@/components/settings/SettingsModal";

export function Sidebar({ className }: { className?: string }) {
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
            <div className={cn("flex h-full w-[280px] flex-col bg-black border-r border-white/5", className)}>
                {/* Header */}
                <div className="flex items-center gap-3 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                        <span className="text-lg font-bold">AI</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-white">Tutor Agent</h1>
                    </div>
                </div>

                {/* New Session Button */}
                <div className="px-4 mb-6">
                    <button
                        onClick={() => createSession()}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Session</span>
                    </button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
                        History
                    </div>
                    <div className="space-y-1">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    "group flex items-center justify-between rounded-2xl px-4 py-3 transition-colors cursor-pointer",
                                    currentSessionId === session.id
                                        ? "bg-neutral-900 text-white"
                                        : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200"
                                )}
                                onClick={() => selectSession(session.id)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare className="h-4 w-4 shrink-0" />
                                    <span className="truncate text-sm font-medium">
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
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / Settings */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        <div className="flex flex-col items-start text-sm">
                            <span className="font-medium">Settings</span>
                            <span className="text-xs text-neutral-500">Profile & Preferences</span>
                        </div>
                    </button>
                </div>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}
