import { redirect } from "next/navigation";

// Wallet page is deprecated - redirect to gains
export default function WalletPage() {
    redirect("/p2p/gains");
}

