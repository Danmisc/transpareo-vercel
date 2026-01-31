"use client";

import * as React from "react";
import { useMemo } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
    MousePointerClick,
    Calendar,
    Download,
    ExternalLink,
    Eye,
    ThumbsUp,
    MessageCircle,
    Users,
    TrendingUp,
    MessageSquare,
    Heart,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface AnalyticsDataPoint {
    date: string;
    members: number;
    posts: number;
    comments: number;
    interactions: number;
    activeUsers: number;
}

interface AnalyticsSummary {
    totalMembers: number;
    memberGrowth: number;
    totalPosts: number;
    postGrowth: number;
    engagementRate: number;
    topContributors: {
        id: string;
        name: string;
        avatar: string | null;
        score: number;
    }[];
    topPosts: {
        id: string;
        content: string;
        authorName: string;
        authorAvatar: string | null;
        views: number;
        likes: number;
        comments: number;
        score: number;
        date: string;
    }[];
    trafficSources: {
        name: string;
        value: number;
        percent: number;
    }[];
}

interface Props {
    data: AnalyticsDataPoint[];
    summary: AnalyticsSummary;
    period: "7d" | "30d" | "90d" | "custom";
    customFrom?: string;
    customTo?: string;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsClient({ data, summary, period, customFrom, customTo }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
        if (customFrom && customTo) {
            return { from: parseISO(customFrom), to: parseISO(customTo) };
        }
        return undefined;
    });

    const handlePeriodChange = (val: string) => {
        const params = new URLSearchParams(searchParams);
        if (val === "custom") {
            // Do nothing
        } else {
            params.set("period", val);
            params.delete("from");
            params.delete("to");
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            const params = new URLSearchParams(searchParams);
            params.set("period", "custom");
            params.set("from", format(range.from, "yyyy-MM-dd"));
            params.set("to", format(range.to, "yyyy-MM-dd"));
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    // Prepare chart data for French locale presentation
    const chartData = useMemo(() => {
        return data.map(d => ({
            ...d,
            formattedDate: format(parseISO(d.date), "d MMM", { locale: fr }),
            fullDate: format(parseISO(d.date), "d MMMM yyyy", { locale: fr })
        }));
    }, [data]);

    // Engagement Pie Data
    const engagementData = useMemo(() => {
        const totalPosts = data.reduce((acc, curr) => acc + curr.posts, 0);
        const totalComments = data.reduce((acc, curr) => acc + curr.comments, 0);
        const totalInteractions = data.reduce((acc, curr) => acc + curr.interactions, 0);

        return [
            { name: "Posts", value: totalPosts },
            { name: "Commentaires", value: totalComments },
            { name: "Réactions", value: totalInteractions }
        ].filter(d => d.value > 0);
    }, [data]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Statistiques</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Analysez la croissance et l'engagement de votre communauté.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex" onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,"
                            + "Date,Membres,Posts,Commentaires,Interactions,Utilisateurs Actifs\n"
                            + data.map(e => `${e.date},${e.members},${e.posts},${e.comments},${e.interactions},${e.activeUsers}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}>
                        <Download className="w-4 h-4 text-zinc-500" />
                        Export
                    </Button>
                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg shrink-0">
                        <DatePickerWithRange
                            date={dateRange}
                            setDate={handleDateRangeSelect}
                            className="w-auto"
                        />

                        <Tabs value={period === "custom" ? undefined : period} onValueChange={handlePeriodChange} className="w-auto flex-1">
                            <TabsList className="bg-transparent h-8 w-full justify-start">
                                <TabsTrigger value="7d" className="h-7 text-xs px-3">7j</TabsTrigger>
                                <TabsTrigger value="30d" className="h-7 text-xs px-3">30j</TabsTrigger>
                                <TabsTrigger value="90d" className="h-7 text-xs px-3">90j</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="content">Contenu</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 border-none p-0 mt-0">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Membres Totaux"
                            value={summary.totalMembers}
                            growth={summary.memberGrowth}
                            icon={Users}
                            color="text-indigo-500"
                        />
                        <MetricCard
                            title="Nouveaux Posts"
                            value={summary.totalPosts}
                            growth={summary.postGrowth}
                            icon={MessageSquare}
                            color="text-blue-500"
                        />
                        <MetricCard
                            title="Taux d'Engagement"
                            value={`${summary.engagementRate.toFixed(1)}%`}
                            subtitle="Interactions / Membre"
                            icon={Activity}
                            color="text-emerald-500"
                        />
                        <MetricCard
                            title="Utilisateurs Actifs"
                            value={data[data.length - 1]?.activeUsers || 0}
                            subtitle="Dernières 24h"
                            icon={MousePointerClick}
                            color="text-orange-500"
                        />
                    </div>

                    {/* Main Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Growth Chart (Area) - Takes 2 cols */}
                        <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <CardHeader>
                                <CardTitle>Croissance et Activité</CardTitle>
                                <CardDescription>Évolution des membres et des utilisateurs actifs.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                                        <XAxis
                                            dataKey="formattedDate"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            minTickGap={30}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="members"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorMembers)"
                                            name="Membres Totaux"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="activeUsers"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorActive)"
                                            name="Utilisateurs Actifs"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Bar Chart (Small version for overview) */}
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <CardHeader>
                                <CardTitle>Volume</CardTitle>
                                <CardDescription>Activité récente.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                                        <XAxis
                                            dataKey="formattedDate"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="posts" name="Posts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="comments" name="Commentaires" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 border-none p-0 mt-0">
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Volume de Contenu</CardTitle>
                            <CardDescription>Posts et commentaires publiés par jour.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                                    <XAxis
                                        dataKey="formattedDate"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="posts" name="Posts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="comments" name="Commentaires" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                        <CardHeader>
                            <CardTitle>Top Contenu</CardTitle>
                            <CardDescription>Les posts les plus performants de la période.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {summary.topPosts?.map((post, i) => (
                                    <div key={post.id} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
                                        <div className="font-mono text-xs text-zinc-400 w-4 mt-1">#{i + 1}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={post.authorAvatar || undefined} />
                                                    <AvatarFallback className="text-[10px]">{post.authorName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{post.authorName}</span>
                                                <span className="text-[10px] text-zinc-400">• {format(parseISO(post.date), "d MMM", { locale: fr })}</span>
                                            </div>
                                            <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-2">
                                                {post.content}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> {post.views}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" /> {post.likes}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3" /> {post.comments}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="group-hover:opacity-100 opacity-0 transition-opacity h-8 w-8">
                                            <ExternalLink className="w-4 h-4 text-zinc-500" />
                                        </Button>
                                    </div>
                                ))}
                                {(!summary.topPosts || summary.topPosts.length === 0) && (
                                    <div className="text-center text-sm text-zinc-500 py-8">Aucun post performant trouvé.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audience" className="space-y-4 border-none p-0 mt-0">
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Croissance et Activité</CardTitle>
                            <CardDescription>Évolution des membres et des utilisateurs actifs.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                                    <XAxis
                                        dataKey="formattedDate"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="members"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorMembers)"
                                        name="Membres Totaux"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="activeUsers"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorActive)"
                                        name="Utilisateurs Actifs"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Sources de Trafic</CardTitle>
                            <CardDescription>D'où viennent vos visiteurs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {summary.trafficSources?.map((source) => (
                                    <div key={source.name} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-zinc-700 dark:text-zinc-300 capitalize">{source.name.toLowerCase()}</span>
                                            <div className="flex gap-4">
                                                <span className="text-zinc-500">{source.value} vues</span>
                                                <span className="font-semibold text-zinc-900 dark:text-white w-12 text-right">{source.percent.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${source.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!summary.trafficSources || summary.trafficSources.length === 0) && (
                                    <div className="text-center text-sm text-zinc-500 py-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                                        Pas assez de données de trafic pour cette période.
                                        <br />
                                        <span className="text-xs text-zinc-400">Les vues sont enregistrées lorsque les utilisateurs voient un post.</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="engagement" className="space-y-4 border-none p-0 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <CardHeader>
                                <CardTitle>Répartition de l'Engagement</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={engagementData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {engagementData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 text-xs text-zinc-500 mt-2">
                                    {engagementData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            {entry.name}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <CardHeader>
                                <CardTitle>Top Contributeurs</CardTitle>
                                <CardDescription>Les membres les plus actifs.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {summary.topContributors.map((user, i) => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono text-xs text-zinc-400 w-4">#{i + 1}</div>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar || undefined} />
                                                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm font-medium truncate max-w-[120px]">{user.name}</div>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {user.score} pts
                                            </Badge>
                                        </div>
                                    ))}
                                    {summary.topContributors.length === 0 && (
                                        <div className="text-center text-sm text-zinc-500 py-4">Pas encore de données.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function MetricCard({ title, value, growth, subtitle, icon: Icon, color }: any) {
    const isPositive = growth >= 0;
    return (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-zinc-500">{title}</p>
                        <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{value}</h3>
                    </div>
                    <div className={`p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                    {growth !== undefined ? (
                        <span className={`flex items-center font-medium ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {Math.abs(growth).toFixed(1)}%
                            <span className="text-zinc-400 font-normal ml-1">vs période préc.</span>
                        </span>
                    ) : (
                        <span className="text-zinc-400">{subtitle}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg text-xs">
                <p className="font-semibold mb-2 text-zinc-900 dark:text-white">{label}</p>
                {payload.map((entry: any) => (
                    <div key={entry.name} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-zinc-500 capitalize">{entry.name}:</span>
                        <span className="font-medium text-zinc-900 dark:text-white">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};
