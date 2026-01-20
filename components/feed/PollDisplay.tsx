"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { votePoll, getPollResults } from "@/lib/actions-polls";
import { Check, BarChart2 } from "lucide-react";

interface PollDisplayProps {
    postId: string;
    options: string[];
    currentUserId?: string;
    endDate?: Date;
}

interface PollResults {
    votes: number[];
    total: number;
    userVote: number | null;
}

export function PollDisplay({ postId, options, currentUserId, endDate }: PollDisplayProps) {
    const [results, setResults] = useState<PollResults>({ votes: [], total: 0, userVote: null });
    const [isPending, startTransition] = useTransition();
    const [hasVoted, setHasVoted] = useState(false);

    // Load initial results
    useEffect(() => {
        const loadResults = async () => {
            const res = await getPollResults(postId, currentUserId);
            setResults(res);
            setHasVoted(res.userVote !== null);
        };
        loadResults();
    }, [postId, currentUserId]);

    const handleVote = (optionIdx: number) => {
        if (!currentUserId) return; // Prompt login in real app

        // Optimistic update
        setHasVoted(true);
        setResults(prev => {
            const newVotes = [...prev.votes];
            // If changing vote, decrement old
            if (prev.userVote !== null && prev.userVote !== optionIdx) {
                newVotes[prev.userVote] = Math.max(0, (newVotes[prev.userVote] || 0) - 1);
            }
            // If new vote (not just changing)
            if (prev.userVote === null) {
                newVotes[optionIdx] = (newVotes[optionIdx] || 0) + 1;
                return {
                    votes: newVotes,
                    total: prev.total + 1,
                    userVote: optionIdx
                };
            }
            // Changing vote
            newVotes[optionIdx] = (newVotes[optionIdx] || 0) + 1;
            return {
                votes: newVotes,
                total: prev.total,
                userVote: optionIdx
            };
        });

        startTransition(async () => {
            const res = await votePoll(postId, currentUserId, optionIdx);
            if (res.success && res.results) {
                setResults(res.results);
            }
        });
    };

    const getPercentage = (idx: number): number => {
        if (results.total === 0) return 0;
        return Math.round(((results.votes[idx] || 0) / results.total) * 100);
    };

    const isExpired = endDate ? new Date() > endDate : false;
    const showResults = hasVoted || isExpired;

    return (
        <div className="space-y-2 mt-3">
            {options.map((option, idx) => {
                const percentage = getPercentage(idx);
                const isUserVote = results.userVote === idx;

                return showResults ? (
                    // Results View
                    <div
                        key={idx}
                        className={cn(
                            "relative overflow-hidden rounded-lg border transition-all",
                            isUserVote
                                ? "border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10"
                                : "border-zinc-200 dark:border-zinc-800"
                        )}
                    >
                        {/* Progress Bar Background */}
                        <div
                            className={cn(
                                "absolute inset-0 transition-all duration-500",
                                isUserVote
                                    ? "bg-orange-100 dark:bg-orange-900/20"
                                    : "bg-zinc-100 dark:bg-zinc-800/50"
                            )}
                            style={{ width: `${percentage}%` }}
                        />

                        {/* Content */}
                        <div className="relative flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                                {isUserVote && (
                                    <Check className="h-4 w-4 text-orange-500" />
                                )}
                                <span className={cn(
                                    "font-medium text-sm",
                                    isUserVote ? "text-orange-700 dark:text-orange-300" : "text-zinc-700 dark:text-zinc-300"
                                )}>
                                    {option}
                                </span>
                            </div>
                            <span className={cn(
                                "text-sm font-semibold",
                                isUserVote ? "text-orange-600" : "text-zinc-500"
                            )}>
                                {percentage}%
                            </span>
                        </div>
                    </div>
                ) : (
                    // Voting View
                    <Button
                        key={idx}
                        variant="outline"
                        className={cn(
                            "w-full justify-start h-auto py-3 px-4",
                            "border-zinc-200 dark:border-zinc-800",
                            "hover:bg-orange-50 hover:border-orange-500/30 dark:hover:bg-orange-900/10",
                            "transition-all group"
                        )}
                        onClick={() => handleVote(idx)}
                        disabled={isPending || !currentUserId}
                    >
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                            {option}
                        </span>
                    </Button>
                );
            })}

            {/* Footer Stats */}
            <div className="flex items-center justify-center gap-2 pt-1">
                <BarChart2 className="h-3.5 w-3.5 text-zinc-400" />
                <p className="text-xs text-zinc-500">
                    {results.total} vote{results.total !== 1 ? 's' : ''}
                    {endDate && !isExpired && (
                        <> • Fin {new Date(endDate).toLocaleDateString('fr-FR')}</>
                    )}
                    {isExpired && (
                        <> • <span className="text-zinc-400">Terminé</span></>
                    )}
                </p>
            </div>
        </div>
    );
}

