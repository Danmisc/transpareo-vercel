import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublicPaymentForm } from "@/components/p2p/public-payment-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default async function PublicPaymentPage({ params }: { params: { username: string } }) {
    // Decode username just in case
    const username = decodeURIComponent(params.username);

    // Fetch user public info
    const user = await prisma.user.findFirst({
        where: {
            name: {
                equals: username,
                mode: 'insensitive' // Case insensitive search
            }
        },
        select: {
            id: true,
            name: true,
            image: true,
            wallet: {
                select: {
                    id: true
                }
            }
        }
    });

    if (!user || !user.wallet) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">

                {/* Profile Header */}
                <div className="text-center space-y-4">
                    <div className="relative inline-block">
                        <Avatar className="w-24 h-24 mx-auto border-4 border-white dark:border-zinc-900 shadow-xl">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="text-2xl bg-orange-100 text-orange-600 font-bold">
                                {user.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white dark:border-zinc-900" title="Vérifié">
                            <ShieldCheck size={16} />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                            Payer {user.name}
                        </h1>
                        <p className="text-zinc-500 text-sm">@transpareo/{username}</p>
                    </div>
                </div>

                {/* Payment Card */}
                <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden">
                    <PublicPaymentForm targetWalletId={user.wallet.id} targetName={user.name!} />
                </Card>

                {/* Footer */}
                <div className="text-center space-y-2">
                    <p className="text-xs text-zinc-400">
                        Paiement sécurisé par Transpareo & Stripe.
                    </p>
                    <div className="flex justify-center gap-2 opacity-50">
                        {/* Icons like Visa, Mastercard could go here */}
                    </div>
                </div>

            </div>
        </div>
    );
}
