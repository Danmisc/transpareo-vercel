"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Bon retour parmi nous"
            subtitle="Connectez-vous pour accéder à votre espace."
            role="TENANT" // Default visual, or strictly neutral if preferred. Using TENANT visual as generic welcoming.
        >
            <LoginForm />
        </AuthLayout>
    );
}
