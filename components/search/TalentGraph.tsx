"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Node {
    id: string;
    name: string;
    avatar: string;
    role: string;
    x: number;
    y: number;
    isMain?: boolean;
}

interface Link {
    source: string;
    target: string;
}

export function TalentGraph() {
    // Mock Data for "You are connected via..."
    const nodes: Node[] = [
        { id: "me", name: "Vous", avatar: "/avatars/me.jpg", role: "Owner", x: 50, y: 80, isMain: true },
        { id: "target", name: "Sarah L.", avatar: "/avatars/sarah.jpg", role: "Architecte", x: 50, y: 20, isMain: true },
        { id: "conn1", name: "Marc D.", avatar: "/avatars/marc.jpg", role: "Dev", x: 30, y: 50 },
        { id: "conn2", name: "Julie P.", avatar: "/avatars/julie.jpg", role: "Agent", x: 70, y: 50 },
    ];

    return (
        <div className="relative w-full h-64 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
            <div className="absolute top-3 left-4 z-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Network Graph</h3>
            </div>

            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.path
                    d="M 50% 80% Q 30% 50% 50% 20%" // Curved line You -> Conn1 -> Target
                    fill="none"
                    stroke="url(#gradient-left)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <motion.path
                    d="M 50% 80% Q 70% 50% 50% 20%" // Curved line You -> Conn2 -> Target
                    fill="none"
                    stroke="url(#gradient-right)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                />
                <defs>
                    <linearGradient id="gradient-left" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="gradient-right" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => (
                <GraphNode key={node.id} node={node} delay={i * 0.3} />
            ))}
        </div>
    );
}

function GraphNode({ node, delay }: { node: Node, delay: number }) {
    return (
        <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <div className={`relative rounded-full p-1 bg-white dark:bg-black shadow-lg ${node.isMain ? 'ring-2 ring-emerald-500' : ''}`}>
                            <Avatar className={`w-10 h-10 ${node.isMain ? 'w-12 h-12' : ''}`}>
                                <AvatarImage src={node.avatar} />
                                <AvatarFallback className="text-xs bg-zinc-100 dark:bg-zinc-800">{node.name[0]}</AvatarFallback>
                            </Avatar>
                            {/* Pulse effect for target */}
                            {node.id === "target" && (
                                <span className="absolute -inset-1 rounded-full border-2 border-emerald-500 opacity-75 animate-ping pointer-events-none" />
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <div className="text-center">
                            <p className="font-bold text-xs">{node.name}</p>
                            <p className="text-[10px] text-muted-foreground">{node.role}</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </motion.div>
    );
}
