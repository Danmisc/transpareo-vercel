import { UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Link as LinkIcon, MapPin, Globe, Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { BadgeList } from "@/components/gamification/BadgeList";

interface ProfileInfoProps {
    user: UserProfile & {
        bio?: string;
        location?: string;
        website?: string;
        links?: string; // JSON string
        joinedAt?: string;
        lastActive?: Date | null;
    };
    isCurrentUser: boolean;
}

export function ProfileInfo({ user, isCurrentUser }: ProfileInfoProps) {
    let socialLinks: any = {};
    try {
        socialLinks = user.links ? JSON.parse(user.links) : {};
    } catch (e) {
        socialLinks = {};
    }

    // Calculate profile completion
    const completionFields = [
        { key: "bio", label: "Bio", filled: !!user.bio },
        { key: "location", label: "Lieu", filled: !!user.location },
        { key: "website", label: "Site Web", filled: !!user.website },
        // { key: "avatar", label: "Avatar", filled: user.avatar && !user.avatar.includes("default") }, // Simplistic check
        { key: "cover", label: "Couverture", filled: !!user.coverImage }
    ];
    const filledCount = completionFields.filter(f => f.filled).length;
    const totalFields = completionFields.length;
    const completionPercent = Math.round((filledCount / totalFields) * 100);

    return (
        <div className="space-y-4">
            {/* Profile Consolidator / Completion Widget */}
            {isCurrentUser && completionPercent < 100 && (
                <Card className="border-none shadow-sm ring-1 ring-border/50 bg-primary/5">
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm font-semibold flex items-center justify-between">
                            Complétez votre profil
                            <span className="text-xs font-normal text-muted-foreground">{completionPercent}%</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                        <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${completionPercent}%` }} />
                        </div>
                        <div className="space-y-1">
                            {completionFields.filter(f => !f.filled).slice(0, 2).map(f => ( // Show next 2 missing
                                <div key={f.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                    Ajouter {f.label.toLowerCase()}
                                </div>
                            ))}
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs h-8 bg-background">Editer le profil</Button>
                    </CardContent>
                </Card>
            )}

            {/* Intro Card */}
            <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex justify-between items-center">
                        Infos
                        <Link href="/badges" className="text-xs font-normal text-muted-foreground hover:text-primary hover:underline flex items-center gap-1">
                            Tous les badges
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {user.badges && user.badges.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Badges</h4>
                            <BadgeList badges={user.badges} />
                        </div>
                    )}

                    {user.bio && (
                        <p className="text-muted-foreground whitespace-pre-line">{user.bio}</p>
                    )}

                    <div className="space-y-2.5 pt-2">
                        {user.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-foreground/70" />
                                <span>Habite à <span className="text-foreground font-medium">{user.location}</span></span>
                            </div>
                        )}

                        {user.joinedAt && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4 text-foreground/70" />
                                <span>Membre depuis {user.joinedAt}</span>
                            </div>
                        )}

                        {user.lastActive && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="h-2 w-2 rounded-full bg-green-500 ml-1 mr-1" />
                                <span>En ligne récemment</span>
                            </div>
                        )}

                        {user.website && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <LinkIcon className="h-4 w-4 text-foreground/70" />
                                <a href={user.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                                    {user.website.replace(/^https?:\/\//, '')}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Social Links */}
                    {(socialLinks.twitter || socialLinks.instagram || socialLinks.linkedin) && (
                        <div className="flex gap-2 pt-2">
                            {socialLinks.twitter && (
                                <a href={socialLinks.twitter} target="_blank" className="p-2 bg-muted rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
                                    <Globe className="h-4 w-4" /> {/* Would use Twitter icon */}
                                </a>
                            )}
                            {/* ... others ... */}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contact Card (if visible/allowed) */}
            {!isCurrentUser && (
                <Card className="border-none shadow-sm ring-1 ring-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Contacter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <MessageCircle className="h-4 w-4" /> Message
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <Mail className="h-4 w-4" /> Email
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

