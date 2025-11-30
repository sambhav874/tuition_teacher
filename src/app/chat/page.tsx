'use client'
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatArea } from "@/components/layout/ChatArea";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { useState } from "react";

export default function ChatPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <main className="flex h-screen w-full overflow-hidden bg-transparent text-foreground relative">
            <BackgroundEffects />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                className="z-50"
            />

            <div className="flex-1 z-10 flex flex-col min-w-0">
                <ChatArea
                    className="h-full"
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                />
            </div>
        </main>
    );
}
