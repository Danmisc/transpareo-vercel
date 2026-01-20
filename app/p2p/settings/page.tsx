import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
    Shield,
    User,
    Bell,
    CreditCard,
    Eye,
    Lock,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Clock,
    Smartphone,
    Mail,
    FileText,
    Globe,
    Moon,
    Palette,
    ArrowLeftRight,
    Banknote,
    Building,
    type LucideIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getKYCState } from "@/lib/banking/kyc";

// Types
type SettingStatus = "complete" | "warning" | "pending" | "none";

interface SettingCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href?: string;
    status?: SettingStatus;
    statusLabel?: string;
    children?: React.ReactNode;
    badge?: string;
}

// Status badge component
function StatusBadge({ status, label }: { status: SettingStatus; label?: string }) {
    const config = {
        complete: {
            icon: CheckCircle2,
            className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            defaultLabel: "Configuré"
        },
        warning: {
            icon: AlertCircle,
            className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            defaultLabel: "Action requise"
        },
        pending: {
            icon: Clock,
            className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            defaultLabel: "En cours"
        },
        none: { icon: null, className: "", defaultLabel: "" }
    };

    const { icon: Icon, className, defaultLabel } = config[status];
    if (!Icon) return null;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
            <Icon size={12} />
            {label || defaultLabel}
        </span>
    );
}

// Setting card component
function SettingCard({ title, description, icon: Icon, href, status = "none", statusLabel, children, badge }: SettingCardProps) {
    const content = (
        <div className={`group flex items-start gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all ${href ? 'hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md cursor-pointer' : ''}`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
                <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{title}</h3>
                    {badge && (
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase rounded-full">
                            {badge}
                        </span>
                    )}
                    {status !== "none" && <StatusBadge status={status} label={statusLabel} />}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                {children && <div className="mt-3">{children}</div>}
            </div>
            {href && (
                <ChevronRight size={18} className="flex-shrink-0 text-zinc-400 group-hover:text-indigo-600 transition-colors mt-3" />
            )}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }
    return content;
}

// Toggle setting component
function ToggleSetting({ label, description, checked, disabled }: { label: string; description: string; checked: boolean; disabled?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
                <p className="text-xs text-zinc-500">{description}</p>
            </div>
            <Switch checked={checked} disabled={disabled} />
        </div>
    );
}

export default async function SettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Fetch user data
    const [dbUser, kycState, bankAccount] = await Promise.all([
        prisma.user.findUnique({
            where: { id: user.id },
            select: {
                name: true,
                email: true,
                phoneNumber: true,
                twoFactorEnabled: true,
                createdAt: true,
                image: true,
            }
        }),
        getKYCState(),
        prisma.linkedAccount.findFirst({
            where: { userId: user.id },
            select: { id: true, providerName: true, mask: true }
        })
    ]);

    // Calculate statuses
    const kycStatus: SettingStatus = kycState?.status === "VERIFIED" ? "complete" :
        kycState?.status === "PENDING" ? "pending" : "warning";
    const securityStatus: SettingStatus = dbUser?.twoFactorEnabled ? "complete" : "warning";
    const bankStatus: SettingStatus = bankAccount ? "complete" : "warning";

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Paramètres</h1>
                <p className="text-zinc-500">
                    Gérez votre compte, votre sécurité et vos préférences d&apos;investissement.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Membre depuis</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '-'}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Statut KYC</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white capitalize">
                        {kycState?.status === "VERIFIED" ? "Vérifié ✓" : kycState?.status === "PENDING" ? "En cours..." : "Non vérifié"}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Tier investisseur</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        Niveau {kycState?.tier || 0}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Sécurité</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {dbUser?.twoFactorEnabled ? "2FA Actif ✓" : "Standard"}
                    </p>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-8">
                {/* Account & Identity */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={18} className="text-indigo-600" />
                        Compte & Identité
                    </h2>
                    <div className="grid gap-3">
                        <SettingCard
                            title="Vérification KYC"
                            description="Vérifiez votre identité pour débloquer toutes les fonctionnalités d'investissement."
                            icon={FileText}
                            href="/p2p/settings/kyc"
                            status={kycStatus}
                            statusLabel={kycState?.status === "VERIFIED" ? "Vérifié" : kycState?.status === "PENDING" ? "En attente" : "À compléter"}
                        />
                        <SettingCard
                            title="Informations personnelles"
                            description={`${dbUser?.name || 'Non renseigné'} • ${dbUser?.email || ''}`}
                            icon={User}
                            href="/p2p/settings/profile"
                        />
                        <SettingCard
                            title="Numéro de téléphone"
                            description={dbUser?.phoneNumber || "Aucun numéro enregistré - recommandé pour la sécurité"}
                            icon={Smartphone}
                            href="/p2p/settings/phone"
                            status={dbUser?.phoneNumber ? "complete" : "none"}
                        />
                    </div>
                </section>

                {/* Security */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-emerald-600" />
                        Sécurité
                    </h2>
                    <div className="grid gap-3">
                        <SettingCard
                            title="Double authentification (2FA)"
                            description="Protégez votre compte avec Google Authenticator ou Authy."
                            icon={Lock}
                            href="/p2p/settings/security"
                            status={securityStatus}
                            statusLabel={dbUser?.twoFactorEnabled ? "Activé" : "Désactivé"}
                            badge={dbUser?.twoFactorEnabled ? "" : "Recommandé"}
                        />
                        <SettingCard
                            title="Sessions actives"
                            description="Gérez vos connexions actives et déconnectez les appareils inconnus."
                            icon={Eye}
                            href="/p2p/settings/sessions"
                        />
                        <SettingCard
                            title="Historique de sécurité"
                            description="Consultez les événements de sécurité récents sur votre compte."
                            icon={Clock}
                            href="/p2p/settings/security-log"
                        />
                    </div>
                </section>

                {/* Banking & Payments */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-blue-600" />
                        Comptes bancaires & Paiements
                    </h2>
                    <div className="grid gap-3">
                        <SettingCard
                            title="Compte bancaire principal"
                            description={bankAccount ? `${bankAccount.providerName} ${bankAccount.mask}` : "Ajoutez un compte pour les retraits"}
                            icon={Building}
                            href="/p2p/settings/bank"
                            status={bankStatus}
                            statusLabel={bankAccount ? "Connecté" : "Non configuré"}
                        />
                        <SettingCard
                            title="Moyens de paiement"
                            description="Gérez vos cartes et méthodes de paiement pour les investissements."
                            icon={CreditCard}
                            href="/p2p/settings/payment-methods"
                        />
                        <SettingCard
                            title="Limites & Plafonds"
                            description="Consultez et ajustez vos limites d'investissement et de retrait."
                            icon={ArrowLeftRight}
                            href="/p2p/settings/limits"
                        />
                    </div>
                </section>

                {/* Notifications */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bell size={18} className="text-amber-600" />
                        Notifications
                    </h2>
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-4 space-y-1 divide-y divide-zinc-100 dark:divide-zinc-800">
                            <ToggleSetting
                                label="Notifications par email"
                                description="Recevez les mises à jour importantes par email"
                                checked={true}
                            />
                            <ToggleSetting
                                label="Alertes d'investissement"
                                description="Nouveaux projets correspondant à vos critères"
                                checked={true}
                            />
                            <ToggleSetting
                                label="Rappels d'échéances"
                                description="Alertes 7 jours avant chaque échéance"
                                checked={true}
                            />
                            <ToggleSetting
                                label="Récapitulatif hebdomadaire"
                                description="Résumé de votre portfolio chaque lundi"
                                checked={false}
                            />
                            <ToggleSetting
                                label="Marketing & Promotions"
                                description="Offres spéciales et actualités Transpareo"
                                checked={false}
                            />
                        </CardContent>
                    </Card>
                </section>

                {/* Preferences */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <Palette size={18} className="text-purple-600" />
                        Préférences
                    </h2>
                    <div className="grid gap-3">
                        <SettingCard
                            title="Langue & Région"
                            description="Français (France) • EUR €"
                            icon={Globe}
                            href="/p2p/settings/locale"
                        />
                        <SettingCard
                            title="Fiscalité"
                            description="Configurez votre situation fiscale pour les rapports automatiques."
                            icon={Banknote}
                            href="/p2p/settings/tax"
                        />
                    </div>
                </section>

                {/* Legal Documents */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-zinc-600" />
                        Documents légaux
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Link href="/legal/terms" className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Conditions générales</span>
                            <ChevronRight size={16} className="text-zinc-400" />
                        </Link>
                        <Link href="/legal/privacy" className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Politique de confidentialité</span>
                            <ChevronRight size={16} className="text-zinc-400" />
                        </Link>
                        <Link href="/legal/cookies" className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Politique de cookies</span>
                            <ChevronRight size={16} className="text-zinc-400" />
                        </Link>
                        <Link href="/p2p/legal/risks" className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Avertissement sur les risques</span>
                            <ChevronRight size={16} className="text-zinc-400" />
                        </Link>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-red-600 mb-4">Zone de danger</h2>
                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-zinc-900 dark:text-white">Supprimer mon compte</h3>
                                <p className="text-sm text-zinc-500">Cette action est irréversible. Tous vos investissements actifs devront être clôturés.</p>
                            </div>
                            <Button variant="destructive" size="sm">Supprimer</Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

