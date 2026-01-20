"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showStrength?: boolean;
    required?: boolean;
    error?: string;
    placeholder?: string;
}

// Password strength calculation
function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const levels = [
        { label: "Très faible", color: "bg-red-500" },
        { label: "Faible", color: "bg-orange-500" },
        { label: "Moyen", color: "bg-yellow-500" },
        { label: "Fort", color: "bg-lime-500" },
        { label: "Très fort", color: "bg-emerald-500" },
    ];

    const level = levels[Math.max(0, score - 1)] || levels[0];
    return { score, label: level.label, color: level.color };
}

export function PasswordInput({
    label,
    value,
    onChange,
    showStrength = false,
    required = false,
    error,
    placeholder
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const strength = getPasswordStrength(value);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    className={cn(
                        "flex h-12 w-full rounded-xl border px-4 py-2 text-base pr-12",
                        "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
                        "text-zinc-900 dark:text-white placeholder:text-zinc-400",
                        "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
                        "transition-all duration-200",
                        error && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    )}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {/* Password Strength Indicator */}
            {showStrength && value.length > 0 && (
                <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                                    i < strength.score ? strength.color : "bg-zinc-200 dark:bg-zinc-700"
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">
                            Force : <span className="font-medium text-zinc-700 dark:text-zinc-300">{strength.label}</span>
                        </span>
                        <span className="text-zinc-400">
                            {value.length < 8 && "Min. 8 caractères"}
                        </span>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}
