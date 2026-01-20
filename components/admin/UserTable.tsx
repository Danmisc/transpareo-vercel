"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Search,
    MoreHorizontal,
    Shield,
    ShieldAlert,
    CheckCircle,
    XCircle,
    UserX,
    UserCheck,
    Mail
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getUsers, toggleUserBan, updateUserRole } from "@/lib/actions-admin";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming this hook exists or I'll implement a simple one inside

// Simple debounce implementation if hook missing
function useDebounceValue(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function UserTable() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounceValue(search, 500);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getUsers(debouncedSearch, "ALL", page);
            setUsers(result.users);
            setTotalPages(result.totalPages);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleBan = async (userId: string, currentRole: string) => {
        try {
            const res = await toggleUserBan(userId);
            toast.success(res.newRole === "BANNED" ? "User banned" : "User unbanned");
            fetchUsers();
        } catch (e) {
            toast.error("Action failed");
        }
    };

    const handleRoleUpdate = async (userId: string, role: string) => {
        try {
            await updateUserRole(userId, role);
            toast.success(`Role updated to ${role}`);
            fetchUsers();
        } catch (e) {
            toast.error("Action failed");
        }
    };

    return (
        <div className="space-y-4">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between gap-4 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 backdrop-blur overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900">
                        <TableRow className="border-zinc-800 hover:bg-zinc-900">
                            <TableHead className="text-zinc-400">User</TableHead>
                            <TableHead className="text-zinc-400">Role</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400 text-right">Activity</TableHead>
                            <TableHead className="text-zinc-400 w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    Loading secure data...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-zinc-700">
                                                <AvatarImage src={user.image} />
                                                <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                                    {user.name?.[0]?.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-200 text-sm">{user.name || "Unknown"}</span>
                                                <span className="text-xs text-zinc-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                                            ${user.role === 'ADMIN' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : ''}
                                            ${user.role === 'MODERATOR' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : ''}
                                            ${user.role === 'USER' ? 'border-zinc-700 text-zinc-400' : ''}
                                            ${user.role === 'BANNED' ? 'border-red-500/30 text-red-500 bg-red-500/10' : ''}
                                        `}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {user.role === 'BANNED' ? (
                                                <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                                    <XCircle size={14} /> Banned
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                                                    <CheckCircle size={14} /> Active
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-xs text-zinc-300 font-mono">
                                                {user._count.posts} posts
                                            </span>
                                            <span className="text-[10px] text-zinc-500">
                                                Joined {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                                                    Copy ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "MODERATOR")} className="focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                    <Shield className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-400" /> Make Moderator
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "ADMIN")} className="focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                    <ShieldAlert className="mr-2 h-4 w-4 text-purple-500 group-hover:text-purple-400" /> Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                    <Mail className="mr-2 h-4 w-4 text-zinc-500 group-hover:text-zinc-300" /> Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                {user.role === 'BANNED' ? (
                                                    <DropdownMenuItem onClick={() => handleBan(user.id, user.role)} className="focus:bg-zinc-800 focus:text-emerald-400 text-emerald-500 cursor-pointer">
                                                        <UserCheck className="mr-2 h-4 w-4" /> Unban User
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleBan(user.id, user.role)} className="focus:bg-zinc-800 focus:text-red-400 text-red-500 cursor-pointer">
                                                        <UserX className="mr-2 h-4 w-4" /> Ban User
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-2">
                <span className="text-xs text-zinc-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

