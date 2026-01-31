"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, ChevronRight, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CommunityEventsTab({ events = [] }: { events?: any[] }) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Événements à venir
                </h2>
                <CreateEventDialog />
            </div>

            {events.length > 0 ? (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-900/50">
                    <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-4 text-orange-500">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun événement prévu</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
                        Soyez le premier à organiser une rencontre, un webinaire ou une discussion live !
                    </p>
                    <CreateEventDialog trigger={<Button variant="outline" className="gap-2">Planifier un événement</Button>} />
                </div>
            )}
        </div>
    );
}

function CreateEventDialog({ trigger }: { trigger?: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" className="gap-2 rounded-full">
                        <Plus size={16} />
                        Créer un événement
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Créer un événement</DialogTitle>
                    <DialogDescription>
                        Planifiez une rencontre pour votre communauté.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input id="title" placeholder="Apéro zoom, Masterclass..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Heure</Label>
                            <Input id="time" type="time" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Lieu (Lien ou Adresse)</Label>
                        <Input id="location" placeholder="Zoom, Discord, Paris..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Publier l'événement</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function EventCard({ event }: { event: any }) {
    const [status, setStatus] = useState<"none" | "going" | "interested">("none");
    const [attendees, setAttendees] = useState(event.attendees);

    const handleParticipate = () => {
        if (status === "going") {
            setStatus("none");
            setAttendees((prev: number) => prev - 1);
        } else {
            if (status === "none") setAttendees((prev: number) => prev + 1);
            setStatus("going");
        }
    };

    const handleInterested = () => {
        setStatus(status === "interested" ? "none" : "interested");
    };

    return (
        <div className={cn(
            "group flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all duration-300",
            status === "going" && "ring-2 ring-indigo-500/20 border-indigo-500/30 bg-indigo-50/10"
        )}>
            {/* Date Box */}
            <div className={cn(
                "shrink-0 flex md:flex-col items-center justify-center w-full md:w-20 h-16 md:h-24 rounded-xl border transition-colors",
                status === "going"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            )}>
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{event.month}</span>
                <span className="text-2xl font-black">{event.day}</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 transition-colors">
                                {event.title}
                            </h3>
                            {status === "going" && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Inscrit
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500 line-clamp-2">
                            {event.description}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-medium mt-4">
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-zinc-400" />
                        {event.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-zinc-400" />
                        {event.location}
                    </div>
                    <div className="flex items-center gap-[-8px]">
                        <div className="flex -space-x-2 mr-2">
                            {[1, 2, 3].map((i) => (
                                <Avatar key={i} className="w-6 h-6 border-2 border-white dark:border-zinc-900">
                                    <AvatarFallback className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                                        M{i}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <span>+ {attendees} participants</span>
                    </div>
                </div>
            </div>

            <div className="flex md:flex-col justify-end gap-2 md:w-32">
                <Button
                    className={cn(
                        "w-full rounded-xl transition-all",
                        status === "going"
                            ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                    onClick={handleParticipate}
                >
                    {status === "going" ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            J'y vais
                        </>
                    ) : "Participer"}
                </Button>

                {status !== "going" && (
                    <Button
                        variant={status === "interested" ? "secondary" : "outline"}
                        className={cn("w-full rounded-xl", status === "interested" && "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100")}
                        onClick={handleInterested}
                    >
                        {status === "interested" ? "Intéressé(e)" : "Intéressé"}
                    </Button>
                )}
            </div>
        </div>
    );
}
