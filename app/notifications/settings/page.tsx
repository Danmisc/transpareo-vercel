import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BackToTop } from "@/components/ui/back-to-top";
import { getNotificationSettings, updateNotificationSettings } from "@/lib/actions";

export default async function NotificationSettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const settings = await getNotificationSettings(session.user.id);

    const defaultSettings = {
        emailNotifications: true,
        pushNotifications: true,
        notifyOnLike: true,
        notifyOnComment: true,
        notifyOnMention: true
    };

    const currentSettings = settings || defaultSettings;

    return (
        <div className="min-h-screen bg-background font-sans anti-aliased">
            <Header />
            <div className="container max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <main className="w-full">
                    <div className="mb-6">
                        <Link href="/notifications">
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:underline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour aux notifications
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Paramètres de notification</h1>
                        <p className="text-muted-foreground">Gérez comment et quand vous êtes notifié.</p>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Canaux</CardTitle>
                                <CardDescription>Choisissez vos moyens de communication préférés.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="emailNotifications">Email</Label>
                                        <p className="text-sm text-muted-foreground">Recevoir un récapitulatif par email.</p>
                                    </div>
                                    <Switch
                                        id="emailNotifications"
                                        defaultChecked={currentSettings.emailNotifications}
                                        name="emailNotifications"
                                        formAction={async () => {
                                            "use server";
                                            if (session?.user?.id) {
                                                await updateNotificationSettings(session.user.id, { emailNotifications: !currentSettings.emailNotifications });
                                            }
                                        }}
                                    />
                                </form>
                                <form className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="pushNotifications">Push (Navigateur)</Label>
                                        <p className="text-sm text-muted-foreground">Notifications instantanées sur votre appareil.</p>
                                    </div>
                                    <Switch
                                        id="pushNotifications"
                                        defaultChecked={currentSettings.pushNotifications}
                                        name="pushNotifications"
                                        formAction={async () => {
                                            "use server";
                                            if (session?.user?.id) {
                                                await updateNotificationSettings(session.user.id, { pushNotifications: !currentSettings.pushNotifications });
                                            }
                                        }}
                                    />
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Interactions</CardTitle>
                                <CardDescription>Séléctionnez les types d'activités qui vous importent.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notifyOnLike">J'aime</Label>
                                    </div>
                                    <Switch
                                        id="notifyOnLike"
                                        defaultChecked={currentSettings.notifyOnLike}
                                        formAction={async () => {
                                            "use server";
                                            if (session?.user?.id) {
                                                await updateNotificationSettings(session.user.id, { notifyOnLike: !currentSettings.notifyOnLike });
                                            }
                                        }}
                                    />
                                </form>
                                <form className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notifyOnComment">Commentaires</Label>
                                    </div>
                                    <Switch
                                        id="notifyOnComment"
                                        defaultChecked={currentSettings.notifyOnComment}
                                        formAction={async () => {
                                            "use server";
                                            if (session?.user?.id) {
                                                await updateNotificationSettings(session.user.id, { notifyOnComment: !currentSettings.notifyOnComment });
                                            }
                                        }}
                                    />
                                </form>
                                <form className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notifyOnMention">Mentions</Label>
                                    </div>
                                    <Switch
                                        id="notifyOnMention"
                                        defaultChecked={currentSettings.notifyOnMention}
                                        formAction={async () => {
                                            "use server";
                                            if (session?.user?.id) {
                                                await updateNotificationSettings(session.user.id, { notifyOnMention: !currentSettings.notifyOnMention });
                                            }
                                        }}
                                    />
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
            <BackToTop />
        </div>
    );
}

