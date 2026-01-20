"use client";

import Link from "next/link";
import { ArrowRight, Twitter, Linkedin, Instagram, Github, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingFooter() {
    return (
        <footer className="bg-zinc-950 text-white pt-24 pb-8 px-4 border-t border-zinc-900 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">

                    {/* Brand Section (Cols 1-4) */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                        <div>
                            <Link href="/" className="inline-block font-bold text-3xl tracking-tighter mb-6 text-white">
                                Transpareo<span className="text-orange-500">.</span>
                            </Link>
                            <p className="text-zinc-500 text-lg max-w-sm leading-relaxed mb-8">
                                La référence de la confiance immobilière. Sécurisez vos locations et investissements dès aujourd'hui.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <SocialLink icon={<Twitter className="w-5 h-5" />} href="#" />
                            <SocialLink icon={<Github className="w-5 h-5" />} href="#" />
                            <SocialLink icon={<Linkedin className="w-5 h-5" />} href="#" />
                        </div>
                    </div>

                    {/* Links Section (Cols 5-8) */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">Produit</h4>
                            <ul className="space-y-4 text-sm text-zinc-500">
                                <FooterLink href="#">Fonctionnalités</FooterLink>
                                <FooterLink href="#">Tarifs</FooterLink>
                                <FooterLink href="#">P2P Invest</FooterLink>
                                <FooterLink href="#">Sécurité</FooterLink>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">Compagnie</h4>
                            <ul className="space-y-4 text-sm text-zinc-500">
                                <FooterLink href="#">À propos</FooterLink>
                                <FooterLink href="#">Blog</FooterLink>
                                <FooterLink href="#">Carrières</FooterLink>
                                <FooterLink href="#">Contact</FooterLink>
                            </ul>
                        </div>
                    </div>

                    {/* Innovative Newsletter (Cols 9-12) */}
                    <div className="lg:col-span-4 relative">
                        <div className="bg-zinc-900/30 rounded-2xl p-8 border border-zinc-800/50 backdrop-blur-sm lg:h-full flex flex-col justify-center relative overflow-hidden group">
                            {/* Decorative gradient glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-1000" />

                            <h3 className="font-bold text-2xl text-white mb-2">Newsletter</h3>
                            <p className="text-zinc-500 text-sm mb-8">
                                Analyses de marché exclusives et opportunités P2P en avant-première.
                            </p>

                            <form className="relative" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    className="w-full bg-transparent border-b border-zinc-700 py-3 text-lg text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500 transition-colors pr-12 font-medium"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-orange-500 transition-colors"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </form>

                            <p className="text-xs text-zinc-700 mt-6">
                                Pas de spam. Désinscription à tout moment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-900/50">
                    <p className="text-zinc-600 text-xs">
                        © 2026 Transpareo Inc. Tous droits réservés.
                    </p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="#" className="text-zinc-600 text-xs hover:text-white transition-colors">Confidentialité</Link>
                        <Link href="#" className="text-zinc-600 text-xs hover:text-white transition-colors">CGU</Link>
                        <Link href="#" className="text-zinc-600 text-xs hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="hover:text-white transition-colors duration-200 block w-max">
                {children}
            </Link>
        </li>
    );
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <Link href={href} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black transition-all duration-300">
            {icon}
        </Link>
    );
}
