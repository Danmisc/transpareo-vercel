import { MessageCircle, Send } from "lucide-react";

export default function MessagesPage() {
    return (
        <div className="hidden md:flex flex-col items-center justify-center h-full text-zinc-500 text-center p-6 gap-4">
            <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-full border border-zinc-100 dark:border-zinc-800 relative z-10 shadow-lg">
                    <Send className="w-12 h-12 text-orange-500 ml-1" />
                </div>
            </div>

            <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Vos messages</h2>
                <p className="text-sm">Envoyez des messages privés, des photos et des vocaux à vos amis et communautés.</p>
            </div>
        </div>
    );
}

