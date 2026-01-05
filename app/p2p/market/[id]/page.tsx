import { getLoanDetails } from "@/lib/actions-p2p-loans";
import { getMyWallet } from "@/lib/actions-p2p-wallet";
import { getSocialTrust } from "@/lib/actions-p2p-social";
import { getCurrentUser } from "@/lib/session";
import { InvestWidget } from "@/components/p2p/InvestWidget";
import { ProjectTimeline } from "@/components/p2p/ProjectTimeline";
import { TrustBadge } from "@/components/p2p/TrustBadge";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShieldCheck, User, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    const loan = await getLoanDetails(id);
    const wallet = await getMyWallet();

    if (!loan) return notFound();

    const trustData = await getSocialTrust(loan.borrowerId);
    const percentFunded = (loan.funded / loan.amount) * 100;
    const isOwner = user?.id === loan.borrowerId;

    return (
        <div className="space-y-6">
            <Link href="/p2p/market">
                <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux opportunités
                </Button>
            </Link>

            <div className="grid lg:grid-cols-3 gap-12">

                {/* Left Column: Project Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex gap-3 mb-4">
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">Immobilier</span>
                            <span className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <MapPin size={12} /> {loan.location}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">{loan.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 text-zinc-500 text-sm mb-6">
                            <div className="flex items-center gap-2">
                                <User size={16} /> Emprunteur: {loan.borrower.name}
                            </div>
                            <div>•</div>
                            <div>Grade de Risque <strong className="text-black dark:text-white bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded text-xs">{loan.riskGrade}</strong></div>
                        </div>

                        <div className="mb-6">
                            <TrustBadge
                                trustData={trustData}
                                targetUserId={loan.borrowerId}
                                currentUserId={user?.id || ""}
                            />
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-orange-600">{Math.round(percentFunded)}% financé</span>
                            <span className="text-zinc-500">{loan.funded.toLocaleString()} / {loan.amount.toLocaleString()} €</span>
                        </div>
                        <Progress value={percentFunded} className="h-4 bg-zinc-200 dark:bg-zinc-800" indicatorClassName="bg-gradient-to-r from-orange-500 to-amber-500" />
                    </div>

                    {/* Tabs: Description vs Updates */}
                    <Tabs defaultValue="details" className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
                        <TabsList className="mb-6 bg-zinc-100 dark:bg-zinc-800">
                            <TabsTrigger value="details">Détails du Projet</TabsTrigger>
                            <TabsTrigger value="updates" className="relative">
                                Actualités
                                {loan.updates.length > 0 && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
                            <h3 className="text-xl font-bold mb-4">À propos du projet</h3>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {loan.description || "Aucune description fournie."}
                            </p>

                            <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-white/5 grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-zinc-500 text-sm mb-1">Remboursement</p>
                                    <p className="font-bold">Mensuel (constant)</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm mb-1">Garantie</p>
                                    <p className="font-bold">Caution Personnelle</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="updates">
                            <ProjectTimeline updates={loan.updates} loanId={loan.id} isOwner={isOwner} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Investment Widget */}
                <div>
                    <InvestWidget loan={loan} maxInvest={wallet?.balance || 0} />

                    <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                        <ShieldCheck className="shrink-0 mt-0.5" size={18} />
                        <p>Votre capital est à risque. Les performances passées ne préjugent pas des performances futures.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
