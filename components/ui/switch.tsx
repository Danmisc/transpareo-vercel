"use client"

import * as React from "react"
// Simplified Switch without Radix
import { cn } from "@/lib/utils"

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked || false);
    const isControlled = checked !== undefined;
    const finalChecked = isControlled ? checked : isChecked;

    return (
        <button
            type="button"
            role="switch"
            aria-checked={finalChecked}
            data-state={finalChecked ? "checked" : "unchecked"}
            className={cn(
                "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
                className
            )}
            onClick={(e) => {
                const newState = !finalChecked;
                if (!isControlled) {
                    setIsChecked(newState);
                }
                onCheckedChange?.(newState);
                props.onClick?.(e);
            }}
            ref={ref}
            {...props}
        >
            <span
                data-state={finalChecked ? "checked" : "unchecked"}
                className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                )}
            />
        </button>
    );
})
Switch.displayName = "Switch"

export { Switch }

