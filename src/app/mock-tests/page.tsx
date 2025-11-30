"use client";

import { MockTestArea } from "@/components/mock-tests/MockTestArea";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";

export default function MockTestsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-emerald-50">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <main className="flex-1 relative flex flex-col h-full overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

                <MockTestArea
                    className="flex-1 z-10"
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                />
            </main>
        </div>
    );
}
