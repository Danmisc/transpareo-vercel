"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowRight, Heart, Shield, Sparkles, MapPin, Users, Building2, Coffee, Star, Quote, ArrowLeft, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// ----------------------------------------------------------------------
// ASSETS (Sunny Toulouse & Life)
// ----------------------------------------------------------------------
const IMG_TOULOUSE_HERO = "https://images.unsplash.com/photo-1549241528-9861bb082e6d?auto=format&fit=crop&w=2070&q=80"; // Reliable Toulouse
const IMG_GARONNE = "https://images.unsplash.com/photo-1533630238883-939e6912384a?auto=format&fit=crop&w=1000&q=80"; // Reliable Garonne
// Gallery Images - Using tried and true Unsplash IDs to avoid 404s
const GALLERY_1 = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"; // Collaborative
const GALLERY_2 = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80"; // Meeting
const GALLERY_3 = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80"; // Office
const GALLERY_4 = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80"; // Laptop/Coffee
const GALLERY_5 = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"; // Students

const IMG_PORTRAIT_1 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&fit=crop";
const IMG_PORTRAIT_2 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&fit=crop";
const IMG_PORTRAIT_3 = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&fit=crop";

export default function AboutPage() {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();

    // Parallax Effects
    const yHero = useTransform(scrollY, [0, 1000], [0, 400]);
    const yText = useTransform(scrollY, [0, 500], [0, 100]); // Reduced movement to keep text visible
    const opacityHero = useTransform(scrollY, [0, 600], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-200 overflow-x-hidden">

            {/* ---------------------------------------------------------------------- */}
            {/* 1. HERO SECTION: Sunny & Bright */}
            {/* ---------------------------------------------------------------------- */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                {/* Back Button - Fixed Z-index and position independent of Hero fade */}
                <div className="absolute top-8 left-8 z-[60]">
                    <Link href="/">
                        <Button variant="ghost" className="rounded-full bg-white/50 backdrop-blur-md hover:bg-white text-zinc-900 border border-white/20">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>
                    </Link>
                </div>

                {/* Background Image with Parallax & Fade */}
                <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0 z-0 h-[120%] -top-[10%] will-change-transform">
                    {/* Light Overlay */}
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/50 to-white" />
                </motion.div>

                <div className="relative z-50 container mx-auto px-6 text-center pt-20 pb-32"> {/* Added pb-32 to shift content up visually */}
                    <motion.div style={{ y: yText }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-rose-100 shadow-xl shadow-rose-500/10 mb-8"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                            <span className="text-sm font-bold text-zinc-600 tracking-wider uppercase">Made in Ville Rose</span>
                        </motion.div>

                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-zinc-900 mb-8 leading-[0.85]">
                            <StaggeredText text="L'immobilier" className="block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500">
                                <StaggeredText text="Ensoleillé." />
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed mb-12">
                            Transpareo réveille le marché immobilier avec la chaleur du sud. Plus de transparence, plus d'humain, zéro stress.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/register">
                                <MagneticButton className="h-16 px-12 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 font-bold text-xl shadow-2xl shadow-orange-500/20">
                                    Rejoindre l'aventure
                                </MagneticButton>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ---------------------------------------------------------------------- */}
            {/* 2. MASONRY GALLERY: "Life at Transpareo" */}
            {/* ---------------------------------------------------------------------- */}
            {/* Adjusted overlap and z-index */}
            <section className="py-20 relative z-10 -mt-20 md:-mt-32 pointer-events-none">
                <div className="container mx-auto px-6 pointer-events-auto">
                    <ParallaxGallery />
                </div>
            </section>

            {/* ---------------------------------------------------------------------- */}
            {/* 3. OUR STORY: Clean & Editorial */}
            {/* ---------------------------------------------------------------------- */}
            <section className="py-32 bg-white relative">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-16 items-start">
                        <div className="md:w-1/2 sticky top-32">
                            <h2 className="text-5xl md:text-7xl font-bold leading-[0.9] mb-8 text-zinc-900">
                                Du numérique,<br />
                                <span className="text-orange-500 italic font-serif">mais pas froid.</span>
                            </h2>
                            <div className="w-24 h-2 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full" />
                        </div>

                        <div className="md:w-1/2 prose prose-lg prose-zinc leading-loose text-zinc-500">
                            <p className="text-xl font-medium text-zinc-800">
                                Tout a commencé Place du Capitole, entre deux chocolatines.
                            </p>
                            <p>
                                Le constat était simple : pourquoi louer un appartement ressemble-t-il autant à un interrogatoire ? Où est passée la confiance ?
                            </p>
                            <p>
                                À Toulouse, on aime discuter, on aime savoir à qui on a affaire. C'est cette philosophie que nous avons codée dans Transpareo.
                            </p>
                            <p>
                                Nous ne sommes pas une multinationale sans visage. Nous sommes vos voisins, ceux qui connaissent les meilleures terrasses des Carmes et qui veulent que vous vous sentiez chez vous, avant même d'avoir les clés.
                            </p>

                            <div className="grid grid-cols-2 gap-8 mt-12 bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
                                <div>
                                    <p className="text-4xl font-black text-orange-500">15+</p>
                                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">Passionnés</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-rose-500">100%</p>
                                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">Occitanie</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------------- */}
            {/* 4. VALUES: Magnetic 3D Cards */}
            {/* ---------------------------------------------------------------------- */}
            <section className="py-32 bg-zinc-50/50 relative overflow-hidden">
                {/* Clean Background - Removed Topography */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />


                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-24">
                        <span className="text-sm font-bold tracking-widest text-orange-500 uppercase">Nos Piliers</span>
                        <h2 className="text-4xl md:text-6xl font-black mt-4 text-zinc-900">L'immobilier décomplexé</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 perspective-1000">
                        <Magnetic3DCard
                            icon={Shield}
                            title="Zero Blabla"
                            desc="Pas de frais cachés, pas de dossiers perdus. Tout est clair comme de l'eau de roche (ou de Garonne)."
                            color="bg-blue-50 text-blue-600"
                            delay={0.1}
                        />
                        <Magnetic3DCard
                            icon={Heart}
                            title="100% Humain"
                            desc="Derrière chaque profil, il y a une vraie personne. Nous vérifions tout pour que vous puissiez louer les yeux fermés."
                            color="bg-rose-50 text-rose-600"
                            delay={0.2}
                        />
                        <Magnetic3DCard
                            icon={Sparkles}
                            title="Tech Magique"
                            desc="Visites virtuelles, dossiers en un clic, matching intelligent. La technologie au service de votre tranquillité."
                            color="bg-amber-50 text-amber-600"
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------------- */}
            {/* 5. TEAM: Circle Avatars */}
            {/* ---------------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------------- */}
            {/* 5. TEAM: Professional Grid */}
            {/* ---------------------------------------------------------------------- */}
            <section className="py-32 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-32"> {/* Increased margin to mb-32 */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900"
                        >
                            L'Équipe Dirigeante
                        </motion.h2>
                        <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-light">
                            Des experts passionnés qui allient savoir-faire immobilier et excellence technologique.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto">
                        <ProTeamCard
                            name="Thomas Durand"
                            role="Fondateur & CEO"
                            img={IMG_PORTRAIT_1}
                            bio="Entrepreneur série, Thomas a pour vision de simplifier l'accès au logement pour tous."
                        />
                        <ProTeamCard
                            name="Sarah Martin"
                            role="Directrice Produit"
                            img={IMG_PORTRAIT_2}
                            bio="Ancienne architecte, Sarah conçoit des expériences utilisateurs fluides et humaines."
                        />
                        <ProTeamCard
                            name="Karim Benali"
                            role="CTO & Lead Tech"
                            img={IMG_PORTRAIT_3}
                            bio="Expert en cybersécurité, Karim veille sur vos données comme sur la prunelle de ses yeux."
                        />
                    </div>

                    <div className="border-t border-zinc-100 pt-16 overflow-hidden">
                        <p className="text-center text-sm font-bold tracking-widest text-zinc-400 uppercase mb-12">
                            Nos Partenaires de Confiance
                        </p>

                        <div className="relative w-full overflow-hidden">
                            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                            <motion.div
                                className="flex gap-24 w-max"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
                                style={{ display: "flex", alignItems: "center" }}
                            >
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex gap-24 items-center shrink-0 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer">
                                        <LogoPlaceholder text="French Tech" />
                                        <LogoPlaceholder text="La Dépêche" />
                                        <LogoPlaceholder text="Région Occitanie" />
                                        <LogoPlaceholder text="Toulouse Métropole" />
                                        <LogoPlaceholder text="Badi" />
                                        <LogoPlaceholder text="SeLoger" />
                                        <LogoPlaceholder text="Station F" />
                                        <LogoPlaceholder text="Bpifrance" />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------------- */}
            {/* 6. CTA: Big & Bold */}
            {/* ---------------------------------------------------------------------- */}
            <section className="py-32 bg-zinc-900 text-white relative overflow-hidden rounded-t-[3rem] mx-2">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/30 via-zinc-900 to-zinc-900" />

                <div className="container relative z-10 mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">
                        C'est parti ?
                    </h2>
                    <p className="text-2xl text-zinc-400 mb-12 max-w-xl mx-auto font-light">
                        Rejoignez le mouvement qui secoue l'immobilier toulousain.
                    </p>
                    <Link href="/register">
                        <Button className="h-20 px-16 rounded-full text-2xl font-bold bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-white/10">
                            Créer mon compte
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
}

// ----------------------------------------------------------------------
// COMPONENTS & ANIMATIONS
// ----------------------------------------------------------------------

function ParallaxGallery() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:h-[600px] overflow-hidden rounded-3xl">
            <GalleryColumn images={[GALLERY_1, GALLERY_3]} y={-50} speed={1} />
            <GalleryColumn images={[GALLERY_2, GALLERY_5]} y={0} speed={0.5} className="mt-20" />
            <GalleryColumn images={[GALLERY_4, GALLERY_1]} y={-100} speed={0.8} />
            <GalleryColumn images={[GALLERY_5, GALLERY_2]} y={50} speed={1.2} className="mt-10" />
        </div>
    )
}

function GalleryColumn({ images, y = 0, speed = 1, className = "" }: any) {
    const { scrollY } = useScroll();
    const yTransform = useTransform(scrollY, [0, 1000], [0, y * speed * -1]);

    return (
        <motion.div style={{ y: yTransform }} className={`flex flex-col gap-4 ${className}`}>
            {images.map((src: string, i: number) => (
                <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group">
                    <Image src={src} alt="Gallery" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
            ))}
        </motion.div>
    )
}

function StaggeredText({ text, className }: { text: string, className?: string }) {
    return (
        <span className={className}>
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.5, duration: 0.5 }}
                    className="inline-block"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </span>
    );
}

function MagneticButton({ children, className }: any) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set((clientX - centerX) / 3);
        y.set((clientY - centerY) / 3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            className={className}
            style={{ x, y }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
            {children}
        </motion.button>
    );
}

function Magnetic3DCard({ icon: Icon, title, desc, color, delay }: any) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
    }

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            onMouseMove={handleMouse}
            onMouseLeave={() => {
                x.set(0);
                y.set(0);
            }}
            className="group relative p-10 rounded-[2rem] bg-white shadow-xl shadow-zinc-200/50 border border-white hover:border-orange-100 transition-all duration-300 transform perspective-1000"
        >
            <div style={{ transform: "translateZ(50px)" }} className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 text-2xl shadow-sm transition-transform duration-300`}>
                <Icon className="w-8 h-8" />
            </div>
            <h3 style={{ transform: "translateZ(30px)" }} className="text-2xl font-bold mb-4 text-zinc-900 transition-transform duration-300">{title}</h3>
            <p style={{ transform: "translateZ(20px)" }} className="text-zinc-500 leading-relaxed font-medium transition-transform duration-300">
                {desc}
            </p>
        </motion.div>
    );
}

function ProTeamCard({ name, role, img, bio }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                <Image
                    src={img}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                <div className="absolute bottom-0 left-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-white">
                    <p className="text-orange-300 font-bold text-xs uppercase tracking-widest mb-1">{role}</p>
                    <h3 className="text-xl font-bold mb-2">{name}</h3>
                    <p className="text-sm text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-3">
                        {bio}
                    </p>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-blue-600 cursor-pointer">
                        <Linkedin className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function LogoPlaceholder({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2 font-bold text-xl text-zinc-800">
            <div className="w-8 h-8 rounded bg-zinc-200" />
            {text}
        </div>
    )
}
