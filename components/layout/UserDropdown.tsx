"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, HelpCircle, Moon, Sun, Laptop, Activity, Check } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { StatusSettings } from "@/components/user/StatusSettings";
import { SettingsDialog } from "@/components/user/SettingsDialog";

function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <DropdownMenuItem className="p-0 focus:bg-transparent">
            <div className="grid grid-cols-3 w-full gap-1 p-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 rounded-sm px-2 ${theme === 'light' ? 'bg-accent text-accent-foreground' : ''}`}
                    onClick={(e) => { e.preventDefault(); setTheme("light"); }}
                >
                    <Sun className="h-4 w-4 mr-2" />
                    <span className="text-xs">Clair</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 rounded-sm px-2 ${theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}`}
                    onClick={(e) => { e.preventDefault(); setTheme("dark"); }}
                >
                    <Moon className="h-4 w-4 mr-2" />
                    <span className="text-xs">Sombre</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 rounded-sm px-2 ${theme === 'system' ? 'bg-accent text-accent-foreground' : ''}`}
                    onClick={(e) => { e.preventDefault(); setTheme("system"); }}
                >
                    <Laptop className="h-4 w-4 mr-2" />
                    <span className="text-xs">Auto</span>
                </Button>
            </div>
        </DropdownMenuItem>
    );
}

interface UserDropdownProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null; // Note: NextAuth uses 'image', our DB 'avatar'. We map it.
        statusMessage?: string | null;
        isInvisible?: boolean;
    };
}

export function UserDropdown({ user }: UserDropdownProps) {
    const [statusOpen, setStatusOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const avatarSrc = user.image || "/avatars/default.svg";
    const initials = user.name ? user.name[0].toUpperCase() : "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarSrc} alt={user.name || "User"} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <Link href={`/profile/${user.id}`}>
                        <DropdownMenuItem className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Mon Profil</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => setStatusOpen(true)} className="cursor-pointer">
                        <Activity className="mr-2 h-4 w-4" />
                        <span>Statut & Présence</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Paramètres</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Thème
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                    <ThemeToggle />
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Aide & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-500 focus:text-red-600 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                </DropdownMenuItem>
            </DropdownMenuContent>


            <StatusSettings
                open={statusOpen}
                onOpenChange={setStatusOpen}
                currentStatus={user.statusMessage || ""}
                currentInvisible={user.isInvisible || false}
            />

            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </DropdownMenu>
    );
}
