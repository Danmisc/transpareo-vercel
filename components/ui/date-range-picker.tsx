"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        size="sm"
                        className={cn(
                            "justify-start text-left font-normal bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm border-zinc-200 dark:border-zinc-800",
                            !date && "text-muted-foreground",
                            className
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
                        {date?.from ? (
                            date.to ? (
                                <span className="font-medium text-zinc-700 dark:text-zinc-200 text-xs">
                                    {format(date.from, "d MMM", { locale: fr })} -{" "}
                                    {format(date.to, "d MMM", { locale: fr })}
                                </span>
                            ) : (
                                <span className="font-medium text-zinc-700 dark:text-zinc-200 text-xs">
                                    {format(date.from, "d MMM", { locale: fr })}
                                </span>
                            )
                        ) : (
                            <span className="text-zinc-500 text-xs">Dates personnalisées</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="end" sideOffset={8}>
                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Période personnalisée</h4>
                        <p className="text-xs text-zinc-500">Sélectionnez une plage de dates</p>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        locale={fr}
                        className="p-3"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
