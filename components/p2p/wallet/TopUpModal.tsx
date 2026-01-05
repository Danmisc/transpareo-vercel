"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "@/lib/actions-banking-stripe";

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

function StripePaymentForm({ amount, onSuccess }: { amount: string, onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/p2p/wallet`, // Usually redirects, but we can handle partials
            },
            redirect: "if_required",
        });

        if (error) {
            toast.error(error.message || "Paiement refusé");
            setIsProcessing(false);
        } else {
            toast.success("Paiement réussi !");
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <PaymentElement />
            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl"
            >
                {isProcessing ? "Traitement sécurisé..." : `Payer ${amount} €`}
            </Button>
        </form>
    );
}

export function TopUpModal({ children }: { children: React.ReactNode }) {
    const [amount, setAmount] = useState("500");
    const [isOpen, setIsOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoadingSecret, setIsLoadingSecret] = useState(false);
    const [step, setStep] = useState<"AMOUNT" | "PAYMENT">("AMOUNT");

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setStep("AMOUNT");
            setClientSecret(null);
        }
    }, [isOpen]);

    const handleContinue = async () => {
        setIsLoadingSecret(true);
        const res = await createPaymentIntent(Number(amount));
        if (res.clientSecret) {
            setClientSecret(res.clientSecret);
            setStep("PAYMENT");
        } else {
            toast.error("Erreur d'initialisation Stripe", { description: res.error });
        }
        setIsLoadingSecret(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 p-0 overflow-hidden rounded-[32px]">
                <div className="p-6 bg-gradient-to-br from-zinc-900 to-black text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Zap className="text-amber-500 fill-amber-500" size={20} />
                            Rechargement CB (Stripe)
                        </DialogTitle>
                        <p className="text-zinc-400 text-sm">Sécurisé et instantané.</p>
                    </DialogHeader>

                    {step === "AMOUNT" && (
                        <div className="mt-8 flex flex-col items-center justify-center pb-4">
                            <div className="relative">
                                <span className="absolute left-[-20px] top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-500">€</span>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-5xl font-black bg-transparent border-none text-center w-[200px] h-auto p-0 focus-visible:ring-0 placeholder:text-zinc-700"
                                    autoFocus
                                />
                            </div>
                            <Button
                                onClick={handleContinue}
                                disabled={isLoadingSecret || Number(amount) <= 0}
                                className="mt-8 w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 rounded-xl"
                            >
                                {isLoadingSecret ? <Loader2 className="animate-spin" /> : "Continuer"}
                            </Button>
                        </div>
                    )}
                </div>

                {step === "PAYMENT" && clientSecret && (
                    <div className="p-6 bg-white dark:bg-zinc-950">
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            <StripePaymentForm amount={amount} onSuccess={() => setIsOpen(false)} />
                        </Elements>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
