"use client";

import { useState } from "react";
import { format, addDays, addHours, setHours, setMinutes, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, X, ChevronLeft, ChevronRight, Zap, Sun, Moon, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface SchedulePostModalProps {
    onSchedule: (date: Date) => void;
    trigger?: React.ReactNode;
    disabled?: boolean;
}

const quickOptions = [
    { label: "Dans 1h", icon: Zap, getDate: () => addHours(new Date(), 1) },
    { label: "Demain matin", icon: Coffee, getDate: () => setMinutes(setHours(addDays(new Date(), 1), 9), 0) },
    { label: "Demain midi", icon: Sun, getDate: () => setMinutes(setHours(addDays(new Date(), 1), 12), 0) },
    { label: "Demain soir", icon: Moon, getDate: () => setMinutes(setHours(addDays(new Date(), 1), 19), 0) },
];

const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

export function SchedulePostModal({ onSchedule, trigger, disabled }: SchedulePostModalProps) {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>("12:00");
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handleQuickOption = (getDate: () => Date) => {
        const date = getDate();
        onSchedule(date);
        setOpen(false);
    };

    const handleConfirm = () => {
        if (!selectedDate) return;

        const [hours, minutes] = selectedTime.split(":").map(Number);
        const finalDate = setMinutes(setHours(selectedDate, hours), minutes);

        if (isBefore(finalDate, new Date())) {
            return; // Don't allow past dates
        }

        onSchedule(finalDate);
        setOpen(false);
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < (startingDay === 0 ? 6 : startingDay - 1); i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const today = startOfDay(new Date());

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
                        <Clock size={16} />
                        Programmer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="text-orange-500" size={20} />
                        Programmer la publication
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-4">
                    {/* Quick options */}
                    <div className="grid grid-cols-2 gap-2">
                        {quickOptions.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickOption(opt.getDate)}
                                className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all text-left"
                            >
                                <opt.icon size={16} className="text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">{opt.label}</p>
                                    <p className="text-[10px] text-zinc-400">
                                        {format(opt.getDate(), "d MMM, HH:mm", { locale: fr })}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white dark:bg-zinc-900 text-xs text-zinc-400">
                                ou choisir une date
                            </span>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3">
                        {/* Month navigation */}
                        <div className="flex items-center justify-between mb-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="text-sm font-medium">
                                {format(currentMonth, "MMMM yyyy", { locale: fr })}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>

                        {/* Day names */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((day) => (
                                <div key={day} className="text-center text-[10px] text-zinc-400 font-medium py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, i) => {
                                if (!day) {
                                    return <div key={`empty-${i}`} />;
                                }

                                const isToday = day.getTime() === today.getTime();
                                const isPast = isBefore(day, today);
                                const isSelected = selectedDate && day.getTime() === startOfDay(selectedDate).getTime();

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => !isPast && setSelectedDate(day)}
                                        disabled={isPast}
                                        className={cn(
                                            "aspect-square rounded-lg text-sm flex items-center justify-center transition-all",
                                            isPast && "text-zinc-300 dark:text-zinc-600 cursor-not-allowed",
                                            isToday && !isSelected && "ring-1 ring-orange-500 text-orange-500",
                                            isSelected && "bg-orange-500 text-white",
                                            !isPast && !isSelected && "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time selector */}
                    {selectedDate && (
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-500">Heure de publication</label>
                            <div className="flex flex-wrap gap-2">
                                {timeSlots.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-sm transition-all",
                                            selectedTime === time
                                                ? "bg-orange-500 text-white"
                                                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                        )}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Confirm button */}
                    {selectedDate && (
                        <Button
                            onClick={handleConfirm}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                            Programmer pour le {format(selectedDate, "d MMMM", { locale: fr })} à {selectedTime}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

