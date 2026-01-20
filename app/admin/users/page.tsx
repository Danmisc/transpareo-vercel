import { UserTable } from "@/components/admin/UserTable";

export default function AdminUsersPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="text-zinc-400 mt-2">View, search, and manage all registered users.</p>
                </div>
            </div>

            <UserTable />
        </div>
    );
}

