import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, DollarSign, AlertTriangle } from "lucide-react";
import { getAdminStats } from "@/lib/actions-admin-stats";
import { AdminCharts } from "@/components/admin/AdminCharts";

export default async function AdminPage() {
    const stats = await getAdminStats();

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.users}</div>
                        <p className="text-xs text-zinc-500">Registered Accounts</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Active Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.counts.revenue.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500">Gross Volume (Mock)</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Pending Reports</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{stats.counts.reports}</div>
                        <p className="text-xs text-zinc-500">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">System Status</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">Operational</div>
                        <p className="text-xs text-zinc-500">Latency: Low</p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS LAYER */}
            <AdminCharts
                activityData={stats.charts.activity}
                revenueData={stats.charts.revenue}
            />
        </div>
    );
}
