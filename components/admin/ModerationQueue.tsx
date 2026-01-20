"use client";

import { useState, useEffect, useCallback } from "react";
import { getReportsQueue, resolveReport } from "@/lib/actions-admin-mod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert, Trash2, UserX, AlertTriangle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function ModerationQueue() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeindex, setActiveIndex] = useState(0);

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getReportsQueue();
            setReports(data);
            setActiveIndex(0);
        } catch (e) {
            toast.error("Failed to load moderation queue");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const handleDecision = async (decision: "DISMISS" | "DELETE" | "BAN") => {
        const currentReport = reports[activeindex];
        if (!currentReport) return;

        // Optimistic update
        const nextIndex = activeindex + 1;
        setActiveIndex(nextIndex);

        try {
            await resolveReport(currentReport.id, decision, currentReport);
            toast.success(`Report ${decision.toLowerCase()}ed`);

            // If we reached the end + buffer, maybe fetch more?
            if (nextIndex >= reports.length) {
                // Fetch next batch?
                // For now, just show "All caught up"
            }
        } catch (e) {
            toast.error("Action failed");
            // Revert on error? 
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="space-y-4 w-full max-w-md">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <div className="flex justify-between">
                        <Skeleton className="h-12 w-24" />
                        <Skeleton className="h-12 w-24" />
                    </div>
                </div>
            </div>
        );
    }

    if (reports.length === 0 || activeindex >= reports.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="bg-emerald-900/20 p-6 rounded-full text-emerald-500">
                    <Check size={48} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">All Caught Up!</h3>
                    <p className="text-zinc-400">No pending reports in the queue.</p>
                </div>
                <Button onClick={fetchQueue} variant="outline" className="gap-2">
                    <RefreshCcw size={16} /> Check Again
                </Button>
            </div>
        );
    }

    const report = reports[activeindex];
    const isBanHazard = report.reason === "HARASSMENT" || report.reason === "SPAM";

    return (
        <div className="max-w-xl mx-auto">
            <div className="relative">
                {/* BACK CARD (Visual Stack Effect) */}
                {activeindex + 1 < reports.length && (
                    <div className="absolute top-4 left-0 w-full h-full scale-[0.98] opacity-50 translate-y-2 -z-10">
                        <Card className="h-full bg-zinc-900 border-zinc-800" />
                    </div>
                )}

                {/* ACTIVE CARD */}
                <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                    <CardHeader className="bg-zinc-950/50 border-b border-zinc-800 pb-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10 mb-2">
                                    {report.reason}
                                </Badge>
                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                    Reported by <span className="text-zinc-300">{report.reporter?.name || "Anonymous"}</span>
                                    <span>•</span>
                                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-zinc-800">
                                {report.targetType}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-6 space-y-6">
                        {/* THE CONTENT BEING REPORTED */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Reported Content</h4>
                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-200 text-lg leading-relaxed font-medium">
                                "{typeof report.contentObject === 'string' ? report.contentObject : JSON.stringify(report.contentObject)}"
                            </div>
                            {/* Images would go here */}
                        </div>

                        {/* THE OFFENDER */}
                        <div className="bg-zinc-900/50 p-4 rounded-lg flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-zinc-700">
                                <AvatarImage src={report.targetAuthor?.image} />
                                <AvatarFallback>{report.targetAuthor?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold text-white">{report.targetAuthor?.name || "Unknown User"}</div>
                                <div className="text-xs text-zinc-400">{report.targetAuthor?.email}</div>
                                <div className="text-xs text-zinc-500 mt-1">ID: {report.targetAuthor?.id}</div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-4 grid grid-cols-3 gap-3 bg-zinc-950 border-t border-zinc-800">
                        <Button
                            variant="ghost"
                            className="h-14 flex flex-col gap-1 hover:bg-zinc-800 hover:text-white transition-colors"
                            onClick={() => handleDecision("DISMISS")}
                        >
                            <Check className="h-6 w-6 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500">Keep (Dismiss)</span>
                        </Button>

                        <Button
                            variant="ghost"
                            className="h-14 flex flex-col gap-1 hover:bg-zinc-800 hover:text-white transition-colors"
                            onClick={() => handleDecision("DELETE")}
                        >
                            <Trash2 className="h-6 w-6 text-amber-500" />
                            <span className="text-xs font-bold text-amber-500">Delete Content</span>
                        </Button>

                        <Button
                            variant="ghost"
                            className="h-14 flex flex-col gap-1 hover:bg-red-950/30 hover:text-white transition-colors group"
                            onClick={() => handleDecision("BAN")}
                        >
                            <UserX className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-red-500">Ban User</span>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="text-center mt-6 text-xs text-zinc-500">
                Keyboard shortcuts: 1 (Keep), 2 (Delete), 3 (Ban) - Coming Soon
            </div>
        </div>
    );
}

