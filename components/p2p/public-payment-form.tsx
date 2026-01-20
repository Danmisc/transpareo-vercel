"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, ArrowRight, CreditCard } from "lucide-react";
import { toast } from "sonner";

// Initialize Stripe (Mock key for now or env)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function PublicPaymentForm({ targetWalletId, targetName }: { targetWalletId: string, targetName: string }) {
    const [amount, setAmount] = useState("");
    const [step, setStep] = useState<"AMOUNT" | "PAYMENT">("AMOUNT");
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAmountSubmit = async () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val < 1) {
            toast.error("Le montant minimum est de 1.00 €");
            return;
        }

        setIsLoading(true);
        try {
            // Call server action to create PaymentIntent
            const { createPublicPaymentIntent } = await import("@/lib/actions-public-pay");
            const secret = await createPublicPaymentIntent(val, targetWalletId);

            if (secret) {
                setClientSecret(secret);
                setStep("PAYMENT");
            } else {
                toast.error("Erreur d'initialisation du paiement");
            }
        } catch (e) {
            toast.error("Erreur technique");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8">
            {step === "AMOUNT" ? (
                <div className="space-y-6">
                    <div className="relative flex justify-center items-center py-8">
                        <span className="text-4xl font-bold text-zinc-300 mr-2">€</span>
                        <Input
                            autoFocus
                            type="number"
                            className="text-6xl font-black text-center border-none focus-visible:ring-0 p-0 w-[240px] h-auto bg-transparent placeholder:text-zinc-200 text-zinc-900 dark:text-white"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleAmountSubmit}
                        disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                        className="w-full h-14 text-lg font-bold bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:scale-[1.02] transition-transform"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <>Payer <ArrowRight className="ml-2" /></>}
                    </Button>
                </div>
            ) : (
                clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <StripePaymentInner targetName={targetName} amount={amount} />
                    </Elements>
                )
            )}
        </div>
    );
}

function StripePaymentInner({ targetName, amount }: { targetName: string, amount: string }) {
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
                return_url: `${window.location.origin}/pay/success`, // Should create this page too
            },
        });

        if (error) {
            toast.error(error.message);
            setIsProcessing(false);
        }
        // If success, Stripe redirects.
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <p className="text-zinc-500 text-sm">Vous payez</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{amount} €</p>
                <p className="text-zinc-500 text-sm">à {targetName}</p>
            </div>

            <PaymentElement />

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" size={18} />}
                Confirmer le paiement
            </Button>
        </form>
    );
}

