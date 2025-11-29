import { Sidebar } from "@/components/layout/Sidebar";
import { ChatArea } from "@/components/layout/ChatArea";

export default function ChatPage() {
    return (
        <main className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            <Sidebar className="hidden md:flex" />
            <div className="flex-1">
                <ChatArea className="h-full" />
            </div>
        </main>
    );
}
