import { Home, Compass, User, Bell, PlusSquare, MessageCircle, Crown, Key, Film, Search } from "lucide-react";

export const NAV_CONFIG = {
    main: [
        {
            label: "Accueil",
            href: "/",
            icon: Home,
            activeIcon: Home, // Could use filled variants if available or handle via CSS
        },
        {
            label: "Explorer",
            href: "/search?tab=all",
            icon: Search,
            activeIcon: Search
        },
        {
            label: "Marketplace",
            href: "/marketplace",
            icon: Compass,
            activeIcon: Compass
        },
        {
            label: "Reels",
            href: "/reels",
            icon: Film,
            activeIcon: Film
        },
    ],
    mobileBottom: [
        { label: "Home", href: "/", icon: Home },
        { label: "Explorer", href: "/search", icon: Search },
        { label: "Post", href: "#post", icon: PlusSquare, isFab: true }, // Special FAB
        { label: "Notifs", href: "/notifications", icon: Bell },
        { label: "Profil", href: "/profile/me", icon: User },
    ],
    roles: {
        tenant: { label: "Locataire", href: "/dossier", icon: Key },
        owner: { label: "Propriétaire", href: "/owner", icon: Crown },
    }
};
