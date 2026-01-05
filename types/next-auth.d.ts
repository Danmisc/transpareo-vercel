import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

export type UserRole = "TENANT" | "OWNER" | "AGENCY" | "ADMIN" | "USER"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            role: UserRole
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role?: UserRole | string
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        role?: UserRole | string
    }
}
