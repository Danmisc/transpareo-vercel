"use client";

import { motion } from "framer-motion";
import { Building2, Home, Key, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/next-auth";

interface RoleSelectorProps {
    selected: UserRole | null;
    onSelect: (role: UserRole) => void;
}

export function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
    const roles = [
        {
            id: "TENANT",
            label: "Locataire",
            desc: "Je cherche mon futur chez-moi",
            icon: Home,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "group-hover:border-orange-500",
            shadow: "group-hover:shadow-orange-500/20"
        },
        {
            id: "OWNER",
            label: "Propriétaire",
            desc: "Je veux gérer mes biens",
            icon: Key,
            color: "text-blue-600",
            bg: "bg-blue-600/10",
            border: "group-hover:border-blue-600",
            shadow: "group-hover:shadow-blue-600/20"
        },
        {
            id: "AGENCY",
            label: "Agence",
            desc: "Je gère un portefeuille",
            icon: Building2,
            color: "text-zinc-900",
            bg: "bg-zinc-900/10",
            border: "group-hover:border-zinc-900",
            shadow: "group-hover:shadow-zinc-900/20"
        }
    ] as const;

    return (
        <div className="grid gap-4">
            {roles.map((role) => {
                const isSelected = selected === role.id;
                const Icon = role.icon;

                return (
                    <motion.button
                        key={role.id}
                        type="button"
                        onClick={() => onSelect(role.id as UserRole)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "group relative flex items-center p-4 rounded-xl border-2 text-left transition-all duration-300",
                            "hover:shadow-xl",
                            role.border,
                            role.shadow,
                            isSelected
                                ? `border-${role.color.split("-")[1]}-${role.color.split("-")[2]} bg-white shadow-lg`
                                : "border-zinc-100 bg-white"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors",
                            role.bg,
                            role.color
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={cn("font-bold text-lg", isSelected ? "text-zinc-900" : "text-zinc-700")}>
                                {role.label}
                            </h3>
                            <p className="text-sm text-zinc-500 font-medium">
                                {role.desc}
                            </p>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                            <motion.div
                                layoutId="check"
                                className={cn("absolute right-4 w-4 h-4 rounded-full bg-current", role.color)}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

