"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { UserRole } from "@/types/next-auth";

export default function RegisterPage() {
    const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

    return (
        <AuthLayout
            title="Rejoignez l'aventure"
            subtitle="Commencez par nous dire qui vous êtes."
            role={currentRole}
        >
            <RegisterForm onRoleChange={setCurrentRole} />
        </AuthLayout>
    );
}

