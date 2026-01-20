import { ModerationQueue } from "@/components/admin/ModerationQueue";
import { ShieldCheck } from "lucide-react";

export default function AdminModerationPage() {
    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500" />
                        Moderation Queue
                    </h1>
                    <p className="text-zinc-400 mt-2">Review reported content and user flags.</p>
                </div>
            </div>

            <ModerationQueue />
        </div>
    );
}

