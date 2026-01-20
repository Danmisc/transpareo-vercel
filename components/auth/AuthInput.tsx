"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";

export interface AuthInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    ({ className, type, label, error, icon, value, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const hasValue = value && value.toString().length > 0;

        return (
            <div className="relative mb-6 group">
                <div className="relative">
                    <input
                        type={type}
                        className={cn(
                            "peer w-full bg-transparent border-b-2 py-3 px-0 placeholder-transparent focus:outline-none transition-colors",
                            error
                                ? "border-red-500 text-red-600 dark:text-red-400"
                                : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-900 dark:text-zinc-100",
                            className
                        )}
                        placeholder={label}
                        ref={ref}
                        value={value}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...props}
                    />
                    <label
                        className={cn(
                            "absolute left-0 -top-3.5 text-xs font-bold transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 dark:peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs",
                            error
                                ? "text-red-500"
                                : "text-zinc-400 dark:text-zinc-500 peer-focus:text-zinc-900 dark:peer-focus:text-zinc-100"
                        )}
                    >
                        {label}
                    </label>

                    {/* Icon or Validation */}
                    <div className="absolute right-0 top-3 text-zinc-400">
                        {error ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                            isFocused && !error && hasValue && (
                                <Check className="w-5 h-5 text-green-500" />
                            )
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-widest"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

AuthInput.displayName = "AuthInput";

export { AuthInput };

