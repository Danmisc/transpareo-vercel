"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createCommunityRole, updateCommunityRole, deleteCommunityRole } from "@/lib/community-management-actions";
import { toast } from "sonner";
import { Plus, Trash, Pencil, Shield, MoreHorizontal, GripVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Role {
    id: string;
    name: string;
    color: string;
    permissions: string; // JSON
    position: number;
    isDefault: boolean;
    _count?: { members: number };
}

interface RolesClientProps {
    communityId: string;
    userId: string;
    initialRoles: Role[];
}

const PERMISSIONS_LIST = [
    { id: "manage_members", label: "Gérer les Membres", description: "Bannir, expulser et promouvoir." },
    { id: "manage_content", label: "Gérer le Contenu", description: "Supprimer des posts et commentaires." },
    { id: "manage_settings", label: "Gérer les Paramètres", description: "Modifier le nom, la description et le thème." },
    { id: "view_analytics", label: "Voir les Statistiques", description: "Accéder aux données de croissance." },
];

const COLORS = [
    "#000000", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"
];

export function RolesClient({ communityId, userId, initialRoles }: RolesClientProps) {
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        color: "#000000",
        permissions: [] as string[]
    });

    const resetForm = () => {
        setFormData({ name: "", color: "#000000", permissions: [] });
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (role: Role) => {
        let perms: string[] = [];
        try {
            perms = JSON.parse(role.permissions);
        } catch (e) { }

        setFormData({
            name: role.name,
            color: role.color,
            permissions: perms
        });
        setCurrentRole(role);
        setIsEditOpen(true);
    };

    const togglePermission = (permId: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId]
        }));
    };

    const handleCreate = async () => {
        if (!formData.name) return toast.error("Le nom du rôle est requis");

        setIsLoading(true);
        const res = await createCommunityRole(communityId, userId, {
            name: formData.name,
            color: formData.color,
            permissions: JSON.stringify(formData.permissions)
        });
        setIsLoading(false);

        if (res.success && res.data) {
            toast.success("Rôle créé avec succès");
            setRoles([...roles, res.data as Role]); // Append new role
            setIsCreateOpen(false);
        } else {
            toast.error(res.error || "Erreur lors de la création");
        }
    };

    const handleUpdate = async () => {
        if (!currentRole) return;
        setIsLoading(true);

        const res = await updateCommunityRole(communityId, userId, currentRole.id, {
            name: formData.name,
            color: formData.color,
            permissions: JSON.stringify(formData.permissions)
        });
        setIsLoading(false);

        if (res.success && res.data) {
            toast.success("Rôle mis à jour");
            setRoles(roles.map(r => r.id === currentRole.id ? (res.data as Role) : r));
            setIsEditOpen(false);
        } else {
            toast.error(res.error || "Erreur lors de la mise à jour");
        }
    };

    const handleDelete = async (roleId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) return;

        const res = await deleteCommunityRole(communityId, userId, roleId);
        if (res.success) {
            toast.success("Rôle supprimé");
            setRoles(roles.filter(r => r.id !== roleId));
        } else {
            toast.error("Erreur, ce rôle est peut-être assigné à des membres");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Rôles & Permissions</h2>
                    <p className="text-sm text-muted-foreground">Définissez qui peut faire quoi dans votre communauté.</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Rôle
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Rôle</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => {
                            let permsOrCount = 0;
                            try {
                                const p = JSON.parse(role.permissions);
                                permsOrCount = Array.isArray(p) ? p.length : 0;
                            } catch { }

                            return (
                                <TableRow key={role.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {/* <GripVertical className="text-zinc-400 cursor-move" size={16} /> */}
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: role.color }}
                                            />
                                            <span className="font-medium">{role.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-zinc-500">
                                            {permsOrCount === 0 ? "Aucune permission" : `${permsOrCount} permission(s)`}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenEdit(role)}>
                                                    <Pencil className="w-4 h-4 mr-2" /> Modifier
                                                </DropdownMenuItem>
                                                {!role.isDefault && (
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(role.id)}>
                                                        <Trash className="w-4 h-4 mr-2" /> Supprimer
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {roles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-zinc-500">
                                    Aucun rôle personnalisé. Créez-en un pour commencer.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Dialog Create/Edit */}
            <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => !open && (setIsCreateOpen(false), setIsEditOpen(false))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditOpen ? "Modifier le Rôle" : "Créer un Nouveau Rôle"}</DialogTitle>
                        <DialogDescription>
                            Configurez le nom, la couleur et les permissions de ce rôle.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nom du rôle</Label>
                            <Input
                                placeholder="ex: Modérateur Sénior"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Couleur</Label>
                            <div className="flex gap-2 flex-wrap">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setFormData({ ...formData, color: c })}
                                        className={`w-6 h-6 rounded-full border-2 ${formData.color === c ? "border-zinc-900 dark:border-white scale-110" : "border-transparent"}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="border rounded-md p-4 space-y-3 max-h-[200px] overflow-y-auto">
                                {PERMISSIONS_LIST.map(perm => (
                                    <div key={perm.id} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={perm.id}
                                            checked={formData.permissions.includes(perm.id)}
                                            onCheckedChange={() => togglePermission(perm.id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor={perm.id} className="font-medium cursor-pointer">
                                                {perm.label}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {perm.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => (setIsCreateOpen(false), setIsEditOpen(false))}>Annuler</Button>
                        <Button onClick={isEditOpen ? handleUpdate : handleCreate} disabled={isLoading}>
                            {isLoading ? "Enregistrement..." : (isEditOpen ? "Mettre à jour" : "Créer le Rôle")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
