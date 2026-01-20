"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Eye, TrendingUp, TrendingDown, Users, Heart, MessageSquare,
    BarChart3, ArrowUpRight, ArrowDownRight, Minus, Bookmark,
    Calendar, Award, Building2, Target, ChevronDown
} from "lucide-react";
import Link from "next/link";
import type {
    AnalyticsPeriod,
    ProfileAnalytics,
    ContentAnalytics,
    PostAnalytics,
    DailyEngagement,
    AudienceInsight,
    RealEstateAnalytics
} from "@/lib/services/analytics.service";

interface AnalyticsDashboardProps {
    userId: string;
    currentPeriod: AnalyticsPeriod;
    profileAnalytics: ProfileAnalytics;
    contentAnalytics: ContentAnalytics;
    postAnalytics: PostAnalytics[];
    topPosts: PostAnalytics[];
    engagementTrend: DailyEngagement[];
    audienceInsights: {
        byRole: AudienceInsight[];
        byLocation: AudienceInsight[];
        byIndustry: AudienceInsight[];
        peakHours: number[];
    };
    realEstateAnalytics: RealEstateAnalytics;
}

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
    { value: "TODAY", label: "Aujourd'hui" },
    { value: "7D", label: "7 jours" },
    { value: "28D", label: "28 jours" },
    { value: "90D", label: "90 jours" },
    { value: "365D", label: "1 an" },
    { value: "ALL", label: "Tout" }
];

function ChangeIndicator({ value, type = "percent" }: { value: number; type?: "percent" | "absolute" }) {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    return (
        <span className={`flex items-center gap-0.5 text-xs font-medium ${isNeutral ? "text-zinc-500" : isPositive ? "text-green-600" : "text-red-600"
            }`}>
            {isNeutral ? (
                <Minus className="h-3 w-3" />
            ) : isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
            ) : (
                <ArrowDownRight className="h-3 w-3" />
            )}
            {type === "percent" ? `${Math.abs(value)}%` : (value > 0 ? `+${value}` : value)}
        </span>
    );
}

function StatCard({
    title,
    value,
    change,
    changeType = "percent",
    icon: Icon,
    color
}: {
    title: string;
    value: number | string;
    change?: number;
    changeType?: "percent" | "absolute";
    icon: any;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800",
        pink: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/10 border-pink-200 dark:border-pink-800",
        green: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800",
        orange: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-200 dark:border-orange-800",
        purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200 dark:border-purple-800",
        yellow: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-200 dark:border-yellow-800"
    };

    const iconColors: Record<string, string> = {
        blue: "text-blue-500",
        pink: "text-pink-500",
        green: "text-green-500",
        orange: "text-orange-500",
        purple: "text-purple-500",
        yellow: "text-yellow-500"
    };

    return (
        <Card className={`bg-gradient-to-br ${colorClasses[color]} border`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <Icon className={`h-7 w-7 ${iconColors[color]}`} />
                    {change !== undefined && <ChangeIndicator value={change} type={changeType} />}
                </div>
                <p className="text-3xl font-bold mt-2">{typeof value === "number" ? value.toLocaleString() : value}</p>
                <p className="text-xs text-muted-foreground mt-1">{title}</p>
            </CardContent>
        </Card>
    );
}

export function AnalyticsDashboard({
    userId,
    currentPeriod,
    profileAnalytics,
    contentAnalytics,
    postAnalytics,
    topPosts,
    engagementTrend,
    audienceInsights,
    realEstateAnalytics
}: AnalyticsDashboardProps) {
    const router = useRouter();
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

    const handlePeriodChange = (period: AnalyticsPeriod) => {
        router.push(`/analytics?period=${period}`);
        setShowPeriodDropdown(false);
    };

    const currentPeriodLabel = PERIODS.find(p => p.value === currentPeriod)?.label || "28 jours";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-orange-500" />
                        Statistiques
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Analysez vos performances
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period Selector */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="min-w-[140px] justify-between"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            {currentPeriodLabel}
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>

                        {showPeriodDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border rounded-lg shadow-lg z-50">
                                {PERIODS.map(period => (
                                    <button
                                        key={period.value}
                                        onClick={() => handlePeriodChange(period.value)}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg ${currentPeriod === period.value ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600" : ""
                                            }`}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link href={`/profile/${userId}`}>
                        <Button variant="outline">Retour au profil</Button>
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-grid">
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="content">Contenu</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                    <TabsTrigger value="realestate">Immobilier</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <StatCard
                            title="Vues du profil"
                            value={profileAnalytics.profileViews}
                            change={profileAnalytics.changes.profileViews}
                            icon={Eye}
                            color="blue"
                        />
                        <StatCard
                            title="Visiteurs uniques"
                            value={profileAnalytics.uniqueVisitors}
                            icon={Users}
                            color="purple"
                        />
                        <StatCard
                            title="Abonnés"
                            value={profileAnalytics.followerCount}
                            change={profileAnalytics.changes.followers}
                            changeType="absolute"
                            icon={Users}
                            color="green"
                        />
                        <StatCard
                            title="J'aime reçus"
                            value={contentAnalytics.totalLikes}
                            change={contentAnalytics.changes.likes}
                            icon={Heart}
                            color="pink"
                        />
                        <StatCard
                            title="Commentaires"
                            value={contentAnalytics.totalComments}
                            icon={MessageSquare}
                            color="blue"
                        />
                        <StatCard
                            title="Taux d'engagement"
                            value={`${contentAnalytics.engagementRate}%`}
                            change={contentAnalytics.changes.engagement}
                            icon={TrendingUp}
                            color="orange"
                        />
                    </div>

                    {/* Engagement Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-orange-500" />
                                Tendance d'engagement
                            </CardTitle>
                            <CardDescription>Évolution sur la période sélectionnée</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-end gap-1">
                                {engagementTrend.map((day, i) => {
                                    const maxVal = Math.max(...engagementTrend.map(d => d.likes + d.comments + d.views));
                                    const total = day.likes + day.comments + day.views;
                                    const height = maxVal > 0 ? (total / maxVal) * 100 : 5;

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                            <div
                                                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm transition-all hover:from-orange-600 hover:to-orange-500 cursor-pointer"
                                                style={{ height: `${Math.max(height, 3)}%` }}
                                            />
                                            <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                                                {day.date}
                                            </span>

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-900 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap z-10">
                                                <p className="font-semibold">{day.date}</p>
                                                <p>❤️ {day.likes} likes</p>
                                                <p>💬 {day.comments} commentaires</p>
                                                <p>👁️ {day.views} vues</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-pink-500" /> Likes</span>
                                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3 text-blue-500" /> Commentaires</span>
                                <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-green-500" /> Vues</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Posts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                Meilleures publications
                            </CardTitle>
                            <CardDescription>Vos posts les plus performants</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topPosts.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-4">
                                    Pas encore de publications
                                </p>
                            ) : (
                                topPosts.map((post, i) => (
                                    <Link
                                        key={post.id}
                                        href={`/post/${post.id}`}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <span className="text-2xl font-bold text-zinc-300 w-6">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">{post.content}...</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3" /> {post.likes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" /> {post.comments}
                                                </span>
                                                <span className="text-green-600 font-medium">{post.engagementRate}%</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            title="Impressions"
                            value={contentAnalytics.totalImpressions}
                            change={contentAnalytics.changes.impressions}
                            icon={Eye}
                            color="blue"
                        />
                        <StatCard
                            title="Portée"
                            value={contentAnalytics.totalReach}
                            icon={Users}
                            color="purple"
                        />
                        <StatCard
                            title="Enregistrements"
                            value={contentAnalytics.totalSaves}
                            icon={Bookmark}
                            color="yellow"
                        />
                        <StatCard
                            title="Engagement"
                            value={`${contentAnalytics.engagementRate}%`}
                            change={contentAnalytics.changes.engagement}
                            icon={TrendingUp}
                            color="orange"
                        />
                    </div>

                    {/* All Posts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Toutes vos publications</CardTitle>
                            <CardDescription>Performance détaillée de chaque post</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-muted-foreground">
                                            <th className="text-left py-3 px-2">Publication</th>
                                            <th className="text-center py-3 px-2">Type</th>
                                            <th className="text-center py-3 px-2">Impressions</th>
                                            <th className="text-center py-3 px-2">Likes</th>
                                            <th className="text-center py-3 px-2">Commentaires</th>
                                            <th className="text-center py-3 px-2">Engagement</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {postAnalytics.map(post => (
                                            <tr key={post.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                                <td className="py-3 px-2">
                                                    <Link href={`/post/${post.id}`} className="hover:text-orange-600 truncate block max-w-[200px]">
                                                        {post.content}...
                                                    </Link>
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    <span className="px-2 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800">
                                                        {post.type}
                                                    </span>
                                                </td>
                                                <td className="text-center py-3 px-2">{post.impressions.toLocaleString()}</td>
                                                <td className="text-center py-3 px-2">{post.likes}</td>
                                                <td className="text-center py-3 px-2">{post.comments}</td>
                                                <td className="text-center py-3 px-2">
                                                    <span className="text-green-600 font-medium">{post.engagementRate}%</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Audience Tab */}
                <TabsContent value="audience" className="space-y-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* By Role */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Par type de compte</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {audienceInsights.byRole.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Pas encore d'abonnés</p>
                                ) : (
                                    <div className="space-y-3">
                                        {audienceInsights.byRole.map((item, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{item.label}</span>
                                                    <span className="text-muted-foreground">{item.percentage}%</span>
                                                </div>
                                                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-500 rounded-full"
                                                        style={{ width: `${item.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* By Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Par localisation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {audienceInsights.byLocation.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Données insuffisantes</p>
                                ) : (
                                    <div className="space-y-3">
                                        {audienceInsights.byLocation.map((item, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{item.label}</span>
                                                    <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                                                </div>
                                                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${item.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* By Industry */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Par secteur d'activité</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {audienceInsights.byIndustry.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Données insuffisantes</p>
                                ) : (
                                    <div className="space-y-3">
                                        {audienceInsights.byIndustry.map((item, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{item.label}</span>
                                                    <span className="text-muted-foreground">{item.percentage}%</span>
                                                </div>
                                                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${item.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Peak Hours Heatmap */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Heures d'activité de votre audience</CardTitle>
                            <CardDescription>Quand vos abonnés interagissent le plus</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-1 h-32">
                                {audienceInsights.peakHours.map((count, hour) => {
                                    const max = Math.max(...audienceInsights.peakHours);
                                    const height = max > 0 ? (count / max) * 100 : 0;
                                    const isPeak = count === max && count > 0;

                                    return (
                                        <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                                            <div
                                                className={`w-full rounded-t-sm transition-all ${isPeak ? "bg-orange-500" : "bg-zinc-300 dark:bg-zinc-600"
                                                    }`}
                                                style={{ height: `${Math.max(height, 3)}%` }}
                                                title={`${hour}h: ${count} interactions`}
                                            />
                                            {hour % 4 === 0 && (
                                                <span className="text-[10px] text-muted-foreground">{hour}h</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Real Estate Tab */}
                <TabsContent value="realestate" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            title="Vues propriétés"
                            value={realEstateAnalytics.propertyViews}
                            icon={Building2}
                            color="blue"
                        />
                        <StatCard
                            title="Intérêt investissement"
                            value={realEstateAnalytics.investmentClicks}
                            icon={TrendingUp}
                            color="green"
                        />
                        <StatCard
                            title="Demandes de contact"
                            value={realEstateAnalytics.contactRequests}
                            icon={MessageSquare}
                            color="orange"
                        />
                        <StatCard
                            title="Score de leads"
                            value={`${realEstateAnalytics.leadScore}/100`}
                            icon={Target}
                            color="purple"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-500" />
                                Métriques Immobilier
                            </CardTitle>
                            <CardDescription>
                                Performance de vos annonces et projets d'investissement
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {realEstateAnalytics.propertyViews === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>Pas encore de données immobilières</p>
                                    <p className="text-sm mt-1">Publiez des annonces ou projets pour voir les statistiques</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Vos biens immobiliers génèrent de l'intérêt. Continuez à publier du contenu de qualité!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

