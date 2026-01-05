"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Send, Home, ArrowRight } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-zinc-950 text-zinc-300 rounded-t-[2.5rem] mt-auto relative z-10 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">

                    {/* BRAND COL (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                                <Home className="text-white h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Transpareo</span>
                        </Link>
                        <p className="text-zinc-400 leading-relaxed max-w-sm">
                            La plateforme communautaire de l'immobilier citoyen. Rejoignez vos voisins et les professionnels de confiance pour une expérience transparente et humaine.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialButton icon={<Twitter size={18} />} href="#" />
                            <SocialButton icon={<Instagram size={18} />} href="#" />
                            <SocialButton icon={<Linkedin size={18} />} href="#" />
                            <SocialButton icon={<Facebook size={18} />} href="#" />
                        </div>
                    </div>

                    {/* LINKS COL 1 (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-white font-bold text-lg mb-2">Explorer</h4>
                        <ul className="space-y-3">
                            <FooterLink href="/marketplace">Immobilier</FooterLink>
                            <FooterLink href="/map">Carte interactive</FooterLink>
                            <FooterLink href="/agencies">Agences</FooterLink>
                            <FooterLink href="/owners">Propriétaires</FooterLink>
                        </ul>
                    </div>

                    {/* LINKS COL 2 (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-white font-bold text-lg mb-2">Transpareo</h4>
                        <ul className="space-y-3">
                            <FooterLink href="/about">À propos</FooterLink>
                            <FooterLink href="/careers">Carrières</FooterLink>
                            <FooterLink href="/blog">Blog</FooterLink>
                            <FooterLink href="/contact">Contact</FooterLink>
                        </ul>
                    </div>

                    {/* NEWSLETTER COL (4 cols) */}
                    <div className="lg:col-span-4 pl-0 lg:pl-4">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                            <h4 className="text-white font-bold text-lg mb-2">Restez informé</h4>
                            <p className="text-zinc-400 text-sm mb-4">
                                Recevez les dernières annonces et actualités de l'immobilier directement dans votre boîte mail.
                            </p>
                            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                                <Input
                                    type="email"
                                    placeholder="votre@email.com"
                                    className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500 rounded-xl"
                                />
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02]">
                                    S'inscrire <Send size={16} className="ml-2" />
                                </Button>
                            </form>
                            <p className="text-[10px] text-zinc-500 mt-3 text-center">
                                En vous inscrivant, vous acceptez nos <Link href="/terms" className="underline hover:text-white">CGU</Link>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <p>© 2024 Transpareo. Tous droits réservés.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialButton({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-600 hover:scale-110 transition-all duration-300"
        >
            {icon}
        </a>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-zinc-400 hover:text-emerald-400 hover:pl-2 transition-all duration-300 flex items-center gap-1 group">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-4 group-hover:ml-0"><ArrowRight size={12} /></span>
                {children}
            </Link>
        </li>
    );
}
