"use server";

import { plaidClient } from "@/lib/plaid";
import { CountryCode, Products, LinkTokenCreateRequest } from "plaid";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/encryption";

export async function createLinkToken() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const request: LinkTokenCreateRequest = {
        user: { client_user_id: user.id },
        client_name: 'Transpareo P2P',
        products: [Products.Auth, Products.Transactions],
        country_codes: [CountryCode.Fr, CountryCode.Us], // FR for local tests, US for Sandbox default
        language: 'fr',
    };

    try {
        const response = await plaidClient.linkTokenCreate(request);
        return { link_token: response.data.link_token };
    } catch (error) {
        console.error("Plaid Link Token Error:", error);
        return { error: "Failed to create link token" };
    }
}

export async function exchangePublicToken(publicToken: string, metadata: any) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Get Account Info (Balance, Name...)
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const account = accountsResponse.data.accounts[0]; // Take the first one for demo

        // Save to DB (Real Data)
        await prisma.linkedAccount.create({
            data: {
                userId: user.id,
                providerId: "plaid_" + itemId,
                providerName: metadata.institution?.name || "Banque Inconnue",
                accountName: account.name,
                mask: account.mask || "0000",
                balance: account.balances.current || 0,
                status: "ACTIVE",
                accessToken: encrypt(accessToken),
            }
        });

        revalidatePath("/p2p/wallet");
        return { success: true };
    } catch (error) {
        console.error("Plaid Public Token Exchange Error:", error);
        return { error: "Failed to exchange token" };
    }
}

export async function getLinkedAccounts() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await prisma.linkedAccount.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { lastSync: 'desc' }
    });
}
