"use client";

import { useState, useEffect } from "react";
import { getSystemStatus, toggleSystemFlag } from "@/lib/actions-admin-system";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Server, Database, Cloud, Shield } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminSystemPage() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const data = await getSystemStatus();
            setStatus(data);
        } catch (e) {
            toast.error("Failed to load system status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleToggle = async (flag: string, checked: boolean) => {
        // Optimistic update
        setStatus((prev: any) => ({
            ...prev,
            flags: { ...prev.flags, [flag]: checked }
        }));

        try {
            await toggleSystemFlag(flag as any, checked);
            toast.success(`Updated ${flag}`);
        } catch (e) {
            toast.error("Failed to update setting");
            fetchStatus(); // Revert
        }
    };

    if (loading && !status) return <div className="p-8 text-zinc-500">Connecting to engine room...</div>;

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Server className="text-zinc-500" />
                    System Controls
                </h1>
                <p className="text-zinc-400 mt-2">Manage global settings, feature flags, and view system health.</p>
            </div>

            {/* HEALTH GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <Database size={14} /> Database
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-emerald-500 font-bold">{status?.health.database}</span>
                            <span className="text-xs text-zinc-500">{status?.health.latency}ms</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <Cloud size={14} /> API Gateway
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-emerald-500 font-bold">{status?.health.api}</span>
                            <span className="text-xs text-zinc-500">99.99% Uptime</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <Shield size={14} /> Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-emerald-500 font-bold">Secure</span>
                            <span className="text-xs text-zinc-500">0 Threats</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FEATURE FLAGS */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">Feature Flags</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Toggle platform capabilities in real-time. Use with caution.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-white">Maintenance Mode</Label>
                            <p className="text-sm text-zinc-500">
                                Disables application access for all non-admin users.
                            </p>
                        </div>
                        <Switch
                            checked={status?.flags.maintenanceMode}
                            onCheckedChange={(c) => handleToggle("maintenanceMode", c)}
                            className="data-[state=checked]:bg-red-500"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-white">Disable Registrations</Label>
                            <p className="text-sm text-zinc-500">
                                Prevents new users from signing up.
                            </p>
                        </div>
                        <Switch
                            checked={status?.flags.disableRegistrations}
                            onCheckedChange={(c) => handleToggle("disableRegistrations", c)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-white">Debug Mode</Label>
                            <p className="text-sm text-zinc-500">
                                Reveals verbose error logs in the frontend (Admin only).
                            </p>
                        </div>
                        <Switch
                            checked={status?.flags.debugMode}
                            onCheckedChange={(c) => handleToggle("debugMode", c)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Label className="text-white">Beta Features</Label>
                                <Badge variant="outline" className="text-purple-400 border-purple-500/20 bg-purple-500/10 text-[10px]">Experimental</Badge>
                            </div>
                            <p className="text-sm text-zinc-500">
                                Enables early access features for selected users.
                            </p>
                        </div>
                        <Switch
                            checked={status?.flags.betaFeatures}
                            onCheckedChange={(c) => handleToggle("betaFeatures", c)}
                            className="data-[state=checked]:bg-purple-500"
                        />
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}

