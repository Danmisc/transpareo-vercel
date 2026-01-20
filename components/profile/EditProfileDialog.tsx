"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Upload, Image as ImageIcon, User, Palette, Globe, Linkedin, Instagram, Twitter, Briefcase, Phone, MessageCircle, Calendar, ChevronRight, CheckCircle2, TrendingUp, Building, Mail, Youtube, ShieldCheck, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarBuilderDialog } from "./AvatarBuilderDialog";
import { BannerLibraryDialog } from "./BannerLibraryDialog";
import { LanguageSelector } from "@/components/profile/LanguageSelector";
import { upsertExperience, deleteExperience } from "@/lib/actions-journey";
import { upsertSkill, deleteSkill } from "@/lib/actions-skills"; // NEW
import { updateSearchCriteria } from "@/lib/actions-search-criteria"; // NEW
import { Plus, Trash2, Pencil, Calendar as CalendarIcon, Loader2, Search, Brain, Sparkles } from "lucide-react"; // NEW Icons
import { ImageEditorDialog } from "./ImageEditorDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch"; // NEW
import { toast } from "sonner"; // NEW
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // NEW for Category switch
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { PRESET_SKILLS, SKILLS_PROFESSIONAL, SKILLS_PERSONAL } from "@/lib/data/skills";

import { motion } from "framer-motion";

interface EditProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string;
        bio?: string;
        location?: string;
        website?: string;
        coverImage?: string;
        avatar?: string;
        links?: string;
        email?: string;
        phone?: string;

        headline?: string;
        pronouns?: string;
        role?: string;
        company?: string;
        companyWebsite?: string;
        siren?: string;
        languages?: string;
        calendlyUrl?: string; // New
        whatsapp?: string; // New
        experienceYears?: number;
        dealsCount?: number;
        assetsUnderManagement?: string;
        specialities?: string;
        avatarDecoration?: string;
        currentStatus?: string; // "OPEN_TO_WORK", etc.
    };
    experiences?: any[];
    certifications?: any[];
    skills?: any[]; // NEW
    searchCriteria?: any;
    initialTab?: string;
}

const PRESET_COVERS = [
    { url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1080&q=80", name: "Gradient Orange" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80", name: "Modern Building" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1080&q=80", name: "Office Minimal" },
    { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80", name: "Tech Network" },
    { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80", name: "Nature Mountain" },
    { url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=80", name: "Urban Night" },
];



const STATUSES = [
    { value: "ACTIVE_HUNTING", label: "En chasse active", color: "bg-green-500" },
    { value: "OPEN_TO_WORK", label: "À l'écoute d'opportunités", color: "bg-blue-500" },
    { value: "HIRING", label: "Recrute", color: "bg-purple-500" },
    { value: "RAISING_FUNDS", label: "Levée de fonds", color: "bg-amber-500" }
];

export function EditProfileDialog({ isOpen, onClose, user, experiences = [], certifications = [], skills = [], searchCriteria, initialTab }: EditProfileDialogProps) {
    // const { isOpen, onClose, user } = props; // Original line

    // Parse socials safely
    const initialSocials = (() => {
        try {
            return user.links ? JSON.parse(user.links) : { twitter: "", linkedin: "", instagram: "", youtube: "", whatsapp: "", calendly: "" };
        } catch {
            return { twitter: "", linkedin: "", instagram: "", youtube: "", whatsapp: "", calendly: "" };
        }
    })();

    const [formData, setFormData] = useState({
        name: user.name,
        headline: user.headline || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        avatar: user.avatar || "",
        coverImage: user.coverImage || "",
        email: user.email || "",
        phone: user.phone || "",

        pronouns: user.pronouns || "",
        role: user.role || "INVESTOR",
        company: user.company || "",
        companyWebsite: user.companyWebsite || "",
        siren: user.siren || "",
        languages: user.languages || "",

        // Socials & Contact are now nested or flat, let's keep them usable
        socials: {
            ...initialSocials,
            whatsapp: user.whatsapp || initialSocials.whatsapp || "",
            calendly: user.calendlyUrl || initialSocials.calendly || ""
        },

        experienceYears: user.experienceYears || 0,
        dealsCount: user.dealsCount || 0,
        assetsUnderManagement: user.assetsUnderManagement || "",
        specialities: user.specialities || "",
        avatarDecoration: user.avatarDecoration || "none",
        currentStatus: user.currentStatus || ""
    });

    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isBannerLibraryOpen, setIsBannerLibraryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const { update } = useSession();
    const router = useRouter();

    const [editingImage, setEditingImage] = useState<string | null>(null);
    const [editingType, setEditingType] = useState<"avatar" | "banner">("avatar");


    const [previewAvatar, setPreviewAvatar] = useState(user.avatar || "/avatars/default.svg");

    // Navigation State
    const [activeTab, setActiveTab] = useState(initialTab || "identity");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]); // Keep original effect logic

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "unset";
            };
        }
    }, [isOpen]);

    // Journey State
    const [experiencesList, setExperiencesList] = useState(experiences || []);
    const [editingExperience, setEditingExperience] = useState<any>(null); // null = list mode, {} = new, {id...} = edit
    const [isJourneyLoading, setIsJourneyLoading] = useState(false);

    // Skills State
    const [skillsList, setSkillsList] = useState(skills || []);
    const [skillInput, setSkillInput] = useState("");
    const [skillCategory, setSkillCategory] = useState("PROFESSIONAL");

    useEffect(() => {
        if (skills) setSkillsList(skills);
    }, [skills]);

    const handleAddSkill = async () => {
        if (!skillInput.trim()) return;
        setIsJourneyLoading(true);
        try {
            const result = await upsertSkill({ name: skillInput, category: skillCategory });

            if (!result.success) {
                toast.error(result.error || "Erreur lors de l'ajout");
                return;
            }

            // Optimistic update would be better, but refresh is safer for ID
            const newSkill = { id: "temp-" + Date.now(), name: skillInput, category: skillCategory, endorsementsCount: 0 };
            setSkillsList(prev => [...prev, newSkill]); // Optimistic
            setSkillInput("");
            router.refresh();
            toast.success("Compétence ajoutée");
        } catch (err) {
            console.error(err);
            toast.error("Erreur inattendue");
        } finally {
            setIsJourneyLoading(false);
        }
    };

    const handleDeleteSkill = async (id: string) => {
        setIsJourneyLoading(true);
        try {
            const result = await deleteSkill(id);
            if (!result.success) {
                toast.error(result.error || "Erreur suppression");
                return;
            }

            setSkillsList(prev => prev.filter(s => s.id !== id));
            router.refresh();
            toast.success("Compétence supprimée");
        } catch (err) {
            console.error(err);
            toast.error("Erreur inattendue");
        } finally {
            setIsJourneyLoading(false);
            setDeletingItem(null);
        }
    };

    // Certifications State
    const [certificationsList, setCertificationsList] = useState(certifications || []);
    const [editingCertification, setEditingCertification] = useState<any>(null);
    const [deletingItem, setDeletingItem] = useState<{ id: string, type: 'experience' | 'certification' | 'skill' } | null>(null);
    const [certificationForm, setCertificationForm] = useState({
        name: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: ""
    });

    useEffect(() => {
        if (certifications) {
            setCertificationsList(certifications);
        }
    }, [certifications]);

    useEffect(() => {
        if (editingCertification) {
            setCertificationForm({
                name: editingCertification.name || "",
                issuer: editingCertification.issuer || "",
                issueDate: editingCertification.issueDate ? new Date(editingCertification.issueDate).toISOString().split('T')[0] : "",
                expiryDate: editingCertification.expiryDate ? new Date(editingCertification.expiryDate).toISOString().split('T')[0] : "",
                credentialId: editingCertification.credentialId || "",
                credentialUrl: editingCertification.credentialUrl || ""
            });
        } else {
            setCertificationForm({ name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" });
        }
    }, [editingCertification]);

    const handleCertificationSubmit = async () => {
        // Validation basic
        if (!certificationForm.name || !certificationForm.issuer || !certificationForm.issueDate) {
            toast.error("Veuillez remplir les champs obligatoires (Nom, Organisme, Date).");
            return;
        }

        setIsJourneyLoading(true);
        try {
            const { upsertCertification } = await import("@/lib/actions-certifications");
            await upsertCertification({
                id: editingCertification.id,
                name: certificationForm.name,
                issuer: certificationForm.issuer,
                issueDate: new Date(certificationForm.issueDate),
                expiryDate: certificationForm.expiryDate ? new Date(certificationForm.expiryDate) : null,
                credentialId: certificationForm.credentialId || undefined,
                credentialUrl: certificationForm.credentialUrl || undefined
            });
            setEditingCertification(null);
            router.refresh();
            toast.success("Licence enregistrée !");
        } catch (err) {
            console.error("Failed to save certification", err);
            toast.error("Erreur lors de l'enregistrement.");
        } finally {
            setIsJourneyLoading(false);
        }
    };

    const handleDeleteCertification = async (id: string) => {
        // Confirmation is now handled by AlertDialog
        setIsJourneyLoading(true);
        try {
            const { deleteCertification } = await import("@/lib/actions-certifications");
            await deleteCertification(id);
            const updated = certificationsList.filter((c: any) => c.id !== id);
            setCertificationsList(updated);
            router.refresh();
            toast.success("Licence supprimée.");
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la suppression.");
        } finally {
            setIsJourneyLoading(false);
            setDeletingItem(null);
        }
    };

    const handleDeleteExperience = async (id: string) => {
        setIsJourneyLoading(true);
        try {
            await deleteExperience(id);
            const updated = experiencesList.filter((e: any) => e.id !== id);
            setExperiencesList(updated);
            router.refresh();
            toast.success("Expérience supprimée.");
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la suppression.");
        } finally {
            setIsJourneyLoading(false);
            setDeletingItem(null);
        }
    };

    const confirmDelete = () => {
        if (!deletingItem) return;
        if (deletingItem.type === 'experience') {
            handleDeleteExperience(deletingItem.id);
        } else if (deletingItem.type === 'certification') {
            handleDeleteCertification(deletingItem.id);
        } else if (deletingItem.type === 'skill') {
            handleDeleteSkill(deletingItem.id);
        }
    };

    // Journey Form State
    const [experienceForm, setExperienceForm] = useState({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
    });
    const [isExperienceCurrent, setIsExperienceCurrent] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Sync experience form when editing
    useEffect(() => {
        if (editingExperience) {
            setExperienceForm({
                title: editingExperience.title || "",
                company: editingExperience.company || "",
                location: editingExperience.location || "",
                startDate: editingExperience.startDate ? new Date(editingExperience.startDate).toISOString().split('T')[0] : "",
                endDate: editingExperience.endDate ? new Date(editingExperience.endDate).toISOString().split('T')[0] : "",
                description: editingExperience.description || "",
            });
            setIsExperienceCurrent(!editingExperience.endDate && Object.keys(editingExperience).length > 0);
        } else {
            setExperienceForm({ title: "", company: "", location: "", startDate: "", endDate: "", description: "" });
            setIsExperienceCurrent(false);
        }
    }, [editingExperience]);

    const handleExperienceSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsJourneyLoading(true);
        try {
            await upsertExperience({
                id: editingExperience.id,
                title: experienceForm.title,
                company: experienceForm.company,
                location: experienceForm.location,
                startDate: new Date(experienceForm.startDate),
                endDate: isExperienceCurrent ? null : (experienceForm.endDate ? new Date(experienceForm.endDate) : null),
                description: experienceForm.description,
                type: "REAL_ESTATE"
            });
            setEditingExperience(null);
            router.refresh();
        } catch (err) {
            console.error("Failed to save experience", err);
        } finally {
            setIsJourneyLoading(false);
        }
    };

    // Sync preview with external changes (or initial)
    useEffect(() => {
        setPreviewAvatar(formData.avatar || user.avatar || "/avatars/default.svg");
    }, [formData.avatar, user.avatar]);

    useEffect(() => {
        if (experiences) {
            setExperiencesList(experiences);
        }
    }, [experiences]);

    // Search Criteria Form State
    const [searchForm, setSearchForm] = useState({
        isActive: searchCriteria?.isActive || false,
        type: searchCriteria?.type || "BUY",
        minBudget: searchCriteria?.minBudget || "",
        maxBudget: searchCriteria?.maxBudget || "",
        minSurface: searchCriteria?.minSurface || "",
        maxSurface: searchCriteria?.maxSurface || "",
        location: searchCriteria?.location || "",
        rooms: searchCriteria?.rooms || "",
        assetTypes: searchCriteria?.assetTypes || "",
    });

    // Sync state when props change
    useEffect(() => {
        if (isOpen) {
            setSearchForm({
                isActive: searchCriteria?.isActive || false,
                type: searchCriteria?.type || "BUY",
                minBudget: searchCriteria?.minBudget || "",
                maxBudget: searchCriteria?.maxBudget || "",
                minSurface: searchCriteria?.minSurface || "",
                maxSurface: searchCriteria?.maxSurface || "",
                location: searchCriteria?.location || "",
                rooms: searchCriteria?.rooms || "",
                assetTypes: searchCriteria?.assetTypes || "",
            });
        }
    }, [isOpen, searchCriteria]);

    // Filter Logic for Search
    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            // Simple keyword mapping to tabs
            if (query.match(/nom|pronom|headline|bio|statut|langue/)) setActiveTab("identity");
            else if (query.match(/photo|image|avatar|bannière|couverture/)) setActiveTab("appearance");
            else if (query.match(/siren|entreprise|site|expert/)) setActiveTab("expertise");
            else if (query.match(/parcours|expérience|poste/)) setActiveTab("journey");
            else if (query.match(/projet|recherche|budget|surface|localisation/)) setActiveTab("project"); // NEW
            else if (query.match(/contact|email|téléphone|whatsapp|calendly|réseau|linkedin|twitter/)) setActiveTab("contact");
        }
    }, [searchQuery]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "coverImage") => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input value to allow re-selecting same file
        e.target.value = "";

        // Read file for editor
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setEditingImage(reader.result);
                setEditingType(type === "avatar" ? "avatar" : "banner");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleEditorSave = async (file: File) => {
        setIsUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            const { uploadFile } = await import("@/lib/upload");
            const result = await uploadFile(formDataUpload);

            if (result && result.success && result.url) {
                const fieldName = editingType === "banner" ? "coverImage" : "avatar";
                setFormData(prev => ({ ...prev, [fieldName]: result.url }));
                if (editingType === "avatar") {
                    setPreviewAvatar(result.url);
                }
            } else {
                setError("Erreur lors de l'upload de l'image.");
            }
        } catch (error) {
            console.error("Error uploading:", error);
            setError("Erreur technique lors de l'upload de l'image.");
        } finally {
            setIsUploading(false);
            setEditingImage(null);
        }
    };

    const handleAvatarSave = async (dataUrl: string) => {
        setIsUploading(true);
        // Optimistic preview
        const originalAvatar = formData.avatar; // Store current avatar for potential revert
        setPreviewAvatar(dataUrl);

        try {
            // Convert to Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "avatar-3d.png", { type: "image/png" });

            const data = new FormData();
            data.append("file", file);

            const { uploadFile } = await import("@/lib/upload");
            const uploadRes = await uploadFile(data);

            if (uploadRes.success && uploadRes.url) {
                setFormData(prev => ({ ...prev, avatar: uploadRes.url }));
            } else {
                setError("L'upload de l'avatar a échoué.");
                setPreviewAvatar(originalAvatar); // Revert preview on failure
            }
        } catch (err) {
            console.error("Avatar upload failed", err);
            setError("Impossible de sauvegarder l'avatar 3D.");
            setPreviewAvatar(originalAvatar); // Revert preview on failure
        } finally {
            setIsUploading(false);
        }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        const container = scrollContainerRef.current;
        if (element && container) {
            container.scrollTo({
                top: element.offsetTop - 32, // Offset for padding
                behavior: 'smooth'
            });
        }
    };

    if (!isOpen) return null;

    const handleProfileSubmit = async () => {
        console.log("Submitting profile...", { isUploading, formData });

        if (isUploading) {
            console.warn("Upload in progress, blocking submit.");
            return;
        }

        // Safeguard against huge payloads
        if (formData.avatar?.startsWith("data:")) {
            console.error("Avatar is base64 data URL");
            setError("Erreur: L'avatar n'a pas été correctement uploadé. Veuillez réessayer.");
            return;
        }
        if (formData.coverImage?.startsWith("data:")) {
            console.error("Cover image is base64 data URL");
            setError("Erreur: L'image de couverture est trop lourde. Veuillez réessayer.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        // Sanitize socials to remove potential junk data
        const cleanSocials = {
            twitter: (formData.socials?.twitter || "").slice(0, 200),
            linkedin: (formData.socials?.linkedin || "").slice(0, 200),
            instagram: (formData.socials?.instagram || "").slice(0, 200),
            youtube: (formData.socials?.youtube || "").slice(0, 200),
            whatsapp: (formData.socials?.whatsapp || "").slice(0, 200),
            calendly: (formData.socials?.calendly || "").slice(0, 200),
            website: (formData.website || "").slice(0, 200) // Ensure website is also reasonable
        };

        const itemsToSubmit = {
            ...formData,
            links: JSON.stringify(cleanSocials),
            experienceYears: Number(formData.experienceYears),
            dealsCount: Number(formData.dealsCount),
            currentStatus: formData.currentStatus === "NONE" ? "" : formData.currentStatus
        };

        // DEBUG: Check sizes
        Object.entries(itemsToSubmit).forEach(([key, value]) => {
            if (typeof value === 'string') {
                console.log(`Field ${key}: length=${value.length}`);
                if (value.length > 1000) console.error(`⚠️ Huge field detected: ${key} (${value.length} chars)`);
            }
        });

        try {
            const res = await updateProfile(user.id, itemsToSubmit);
            console.log("Update response:", res);

            if (res.success) {
                await update({
                    name: itemsToSubmit.name,
                    image: itemsToSubmit.avatar
                });
                router.refresh();
                onClose();
            } else {
                setError(res.error || "Une erreur est survenue");
            }
        } catch (err) {
            console.error("Submission error:", err);
            setError(`Erreur critique: ${(err as Error).message || "Problème inconnu"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearchSubmit = async () => {
        console.log("handleSearchSubmit called", searchForm);
        setIsSubmitting(true);
        setError("");
        try {
            const payload = {
                userId: user.id, // Not used by updated action but kept for consistency
                isActive: searchForm.isActive,
                type: searchForm.type || "BUY",
                minBudget: searchForm.minBudget && searchForm.minBudget !== "" ? Number(searchForm.minBudget) : null,
                maxBudget: searchForm.maxBudget && searchForm.maxBudget !== "" ? Number(searchForm.maxBudget) : null,
                minSurface: searchForm.minSurface && searchForm.minSurface !== "" ? Number(searchForm.minSurface) : null,
                maxSurface: searchForm.maxSurface && searchForm.maxSurface !== "" ? Number(searchForm.maxSurface) : null,
                location: searchForm.location || null,
                rooms: searchForm.rooms || null,
                assetTypes: searchForm.assetTypes || null,
            };
            console.log("Payload prepared:", payload);
            const res = await updateSearchCriteria(payload);
            console.log("Server response:", res);
            if (res.success) {
                toast.success("Critères de recherche mis à jour !");
                router.refresh();
                onClose();
            } else {
                setError(res.error || "Erreur lors de la mise à jour des critères de recherche.");
            }
        } catch (err) {
            console.error("Search criteria submission error:", err);
            setError(`Erreur critique: ${(err as Error).message || "Problème inconnu"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === "identity" || activeTab === "appearance" || activeTab === "expertise" || activeTab === "contact") {
            await handleProfileSubmit();
        } else if (activeTab === "project") {
            await handleSearchSubmit();
        }
        // Journey tab has its own internal submit logic
    };

    // Simple completion calc
    const filledFields = Object.values(formData).filter(v => v !== "" && v !== 0).length;
    const completionPercentage = Math.round((filledFields / 18) * 100);

    const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => {
        const isActive = activeTab === id;
        return (
            <button
                type="button"
                onClick={() => { setActiveTab(id); setSearchQuery(""); }}
                className={cn(
                    "w-auto md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:px-3 md:py-2 text-sm font-medium rounded-full md:rounded-lg transition-all group whitespace-nowrap shrink-0",
                    isActive
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
            >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-current" : "text-muted-foreground group-hover:text-foreground")} />
                {label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto hidden md:block" />}
            </button>
        );
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            {/* Modal Container: Fullscreen on Mobile, Rounded on Desktop */}
            <div className="w-full md:max-w-5xl h-[100dvh] md:h-[85vh] bg-background md:rounded-2xl shadow-2xl border border-border/50 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">

                {/* --- SIDEBAR (Desktop) / HEADER (Mobile) --- */}
                <div className="w-full md:w-72 bg-zinc-50/80 dark:bg-zinc-900/80 border-b md:border-b-0 md:border-r border-border/50 p-4 md:p-6 flex flex-col shrink-0 backdrop-blur-xl z-20 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">

                    {/* Header Title & Close */}
                    <div className="flex items-center justify-between md:block mb-4 md:mb-6">
                        <div>
                            <h3 className="font-bold text-lg md:text-xl text-foreground tracking-tight">Édition Profil</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-2 leading-relaxed hidden md:block">Personnalisez vos informations publiques et votre image de marque.</p>
                        </div>
                        <Button variant="ghost" size="icon" className="md:hidden -mr-2 text-muted-foreground" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6 relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un réglage..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-white dark:bg-black/20 border-border/60 text-sm focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300"
                        />
                    </div>

                    {/* Navigation */}
                    <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:space-y-1.5 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
                        <SidebarItem id="identity" icon={User} label="Identité" />
                        <SidebarItem id="appearance" icon={Palette} label="Apparence" />
                        <SidebarItem id="expertise" icon={Brain} label="Compétences" />
                        <SidebarItem id="journey" icon={Building} label="Parcours" />
                        <SidebarItem id="project" icon={Search} label="Projet & Recherche" />
                        <SidebarItem id="licenses" icon={ShieldCheck} label="Licences" />
                        <SidebarItem id="contact" icon={Phone} label="Contact" />
                    </nav>

                    {/* Desktop Footer Actions */}
                    <div className="mt-auto pt-6 border-t border-border/50 space-y-3 hidden md:block">
                        {error && (
                            <div className="mb-3 p-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                {error}
                            </div>
                        )}
                        <Button variant="outline" className="w-full justify-center border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting || isUploading} className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-500/20 border-0">
                            {isSubmitting ? "Sauvegarde..." : isUploading ? "Envoi..." : "Enregistrer"}
                        </Button>
                    </div>
                </div>

                {/* --- MAIN CONTENT (Scrollable Form) --- */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-card relative scroll-smooth p-0 pb-20 md:pb-0">
                    <form onSubmit={handleSubmit} className="p-5 md:p-12 max-w-3xl mx-auto space-y-10 md:space-y-16 pb-32">


                        {/* === PROJECT TAB === */}
                        {activeTab === "project" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600">
                                            <Search className="w-6 h-6" />
                                        </div>
                                        Projet Immobilier
                                    </h2>
                                    <p className="text-muted-foreground ml-[52px]">Définissez vos critères de recherche pour des opportunités.</p>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <h3 className="font-medium text-zinc-900 dark:text-white">Recherche Active</h3>
                                        <p className="text-sm text-zinc-500">Rendre ces critères visibles sur votre profil.</p>
                                    </div>
                                    <Switch
                                        checked={searchForm.isActive}
                                        onCheckedChange={(checked) => setSearchForm({ ...searchForm, isActive: checked })}
                                    />
                                </div>

                                <div className={cn("space-y-6 transition-all duration-300", !searchForm.isActive && "opacity-50 pointer-events-none grayscale")}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="projectType" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Type de Projet</Label>
                                            <Select
                                                value={searchForm.type}
                                                onValueChange={(val) => setSearchForm({ ...searchForm, type: val })}
                                            >
                                                <SelectTrigger id="projectType" className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-purple-500/20 focus:border-purple-500">
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BUY">Achat</SelectItem>
                                                    <SelectItem value="RENT">Location</SelectItem>
                                                    <SelectItem value="INVEST">Investissement</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="projectLocation" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Localisation</Label>
                                            <Input
                                                id="projectLocation"
                                                placeholder="ex: Paris, Bordeaux..."
                                                value={searchForm.location}
                                                onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                                                className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-purple-500/20 focus:border-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Budget (€)</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">Min</span>
                                                <Input
                                                    type="number"
                                                    className="pl-12 h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-purple-500/20 focus:border-purple-500"
                                                    value={searchForm.minBudget}
                                                    onChange={(e) => setSearchForm({ ...searchForm, minBudget: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">Max</span>
                                                <Input
                                                    type="number"
                                                    className="pl-12 h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-purple-500/20 focus:border-purple-500"
                                                    value={searchForm.maxBudget}
                                                    onChange={(e) => setSearchForm({ ...searchForm, maxBudget: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Surface (m²)</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">Min</span>
                                                <Input
                                                    type="number"
                                                    className="pl-12 h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-purple-500/20 focus:border-purple-500"
                                                    value={searchForm.minSurface}
                                                    onChange={(e) => setSearchForm({ ...searchForm, minSurface: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">Max</span>
                                                <Input
                                                    type="number"
                                                    className="pl-12 h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-purple-500/20 focus:border-purple-500"
                                                    value={searchForm.maxSurface}
                                                    onChange={(e) => setSearchForm({ ...searchForm, maxSurface: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="projectDetails" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Détails (Optionnel)</Label>
                                        <Input
                                            id="projectDetails"
                                            placeholder="ex: T2 ou T3, balcon, parking..."
                                            value={searchForm.assetTypes}
                                            onChange={(e) => setSearchForm({ ...searchForm, assetTypes: e.target.value })}
                                            className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-purple-500/20 focus:border-purple-500"
                                        />
                                    </div>

                                </div>
                            </section>
                        )}

                        {/* 1. IDENTITY SECTION */}
                        {activeTab === "identity" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600">
                                            <User className="w-6 h-6" />
                                        </div>
                                        Identité & Informations
                                    </h2>
                                    <p className="text-muted-foreground ml-[52px]">Les informations fondamentales de votre profil.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Nom Complet</Label>
                                        <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pronouns" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Pronoms</Label>
                                        <Input id="pronouns" value={formData.pronouns} onChange={e => setFormData({ ...formData, pronouns: e.target.value })} placeholder="Il/Lui, Elle/Elle..." className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="headline" className="text-xs font-bold uppercase text-orange-600 tracking-wider flex justify-between">
                                        Headline (Votre Pitch)
                                        <span className="text-muted-foreground font-normal normal-case text-[10px] opacity-70">Recommandé</span>
                                    </Label>
                                    <Input
                                        id="headline"
                                        value={formData.headline}
                                        onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                        placeholder="Ex: Architecte DPLG | Expert Rénovation Énergétique"
                                        className="h-12 text-lg font-medium bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20 border-orange-200 dark:border-orange-900/30 focus:border-orange-500 focus:ring-orange-500/20 transition-all placeholder:text-muted-foreground/40"
                                    />
                                    <p className="text-[11px] text-muted-foreground">Une phrase d'accroche percutante qui apparaîtra sous votre nom.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Statut Actuel</Label>
                                    <Select
                                        value={formData.currentStatus || "NONE"}
                                        onValueChange={(val) => setFormData({ ...formData, currentStatus: val === "NONE" ? "" : val })}
                                    >
                                        <SelectTrigger className="h-11 w-full md:w-2/3 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-orange-500/20 focus:border-orange-500">
                                            <SelectValue placeholder="Aucun statut particulier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NONE">Aucun statut</SelectItem>
                                            {STATUSES.map(s => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full shadow-sm", s.color)} />
                                                        {s.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bio & Présentation</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="bio" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">À propos de vous</Label>
                                            <span className={cn("text-[10px] font-medium transition-colors",
                                                (formData.bio?.length || 0) > 400 ? "text-orange-500" : "text-muted-foreground"
                                            )}>
                                                {formData.bio?.length || 0}/500
                                            </span>
                                        </div>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={e => {
                                                const text = e.target.value;
                                                if (text.length <= 500) {
                                                    setFormData({ ...formData, bio: text });
                                                }
                                            }}
                                            placeholder="Décrivez votre parcours et vos expertises..."
                                            className="min-h-[150px] resize-y bg-zinc-50 dark:bg-zinc-900/50 focus:ring-orange-500/20 focus:border-orange-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="languages" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Langues parlées</Label>
                                        <LanguageSelector
                                            value={formData.languages}
                                            onChange={(val) => setFormData({ ...formData, languages: val })}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}



                        {/* 2. APPEARANCE SECTION */}
                        {activeTab === "appearance" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-500/10 text-pink-600">
                                            <Palette className="w-6 h-6" />
                                        </div>
                                        Apparence Visuelle
                                    </h2>
                                    <p className="text-muted-foreground ml-[52px]">Gérez l'impact visuel de votre profil.</p>
                                </div>

                                <div className="flex flex-col xl:flex-row gap-8">
                                    {/* Avatar */}
                                    <div className="flex-1 space-y-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Photo de profil</Label>
                                            <span className="text-[10px] text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full font-medium">Important</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-4 mt-2">
                                            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                                <Avatar className="h-32 w-32 border-4 border-white dark:border-zinc-950 shadow-xl transition-transform transform group-hover:scale-105">
                                                    <AvatarImage src={previewAvatar} className="object-cover" />
                                                    <AvatarFallback className="text-3xl bg-orange-100 text-orange-600">{formData.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                                    <Upload className="h-8 w-8 text-white drop-shadow-md" />
                                                </div>
                                                <div className="absolute bottom-0 right-0 bg-white dark:bg-zinc-950 p-1.5 rounded-full shadow-md border border-border">
                                                    <div className="bg-orange-600 rounded-full p-1.5 text-white">
                                                        <Upload className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <Button type="button" size="sm" variant="ghost" className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => setIsBuilderOpen(true)}>
                                                    Ouvrir l'éditeur 3D
                                                </Button>
                                            </div>
                                            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "avatar")} />
                                        </div>
                                    </div>

                                    {/* Cover */}
                                    <div className="flex-[2] space-y-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Image de couverture</Label>
                                        <div className="aspect-[3/1] w-full rounded-xl bg-muted relative overflow-hidden group border border-border/50 shadow-inner">
                                            {formData.coverImage ? (
                                                <img src={formData.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
                                                    <div className="text-center">
                                                        <ImageIcon className="h-10 w-10 opacity-20 mx-auto mb-2" />
                                                        <span className="text-xs opacity-50">Aucune image</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                                <Button type="button" size="sm" className="bg-white/90 text-black hover:bg-white border-0 z-10 font-medium shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300" onClick={() => coverInputRef.current?.click()}>
                                                    <Upload className="h-4 w-4 mr-2" /> Changer l'image
                                                </Button>
                                                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "coverImage")} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sélection rapide</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsBannerLibraryOpen(true)}
                                                    className="h-6 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 -mr-2"
                                                >
                                                    <ImageIcon className="w-3 h-3 mr-1.5" />
                                                    Ouvrir la bibliothèque complète
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2">
                                                {PRESET_COVERS.slice(0, 6).map((preset, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        className="aspect-video w-full rounded-lg overflow-hidden border border-border hover:ring-2 ring-orange-500 transition-all hover:scale-105 shadow-sm relative group"
                                                        onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                                                        title={preset.name}
                                                    >
                                                        <img src={preset.url} className="w-full h-full object-cover" />
                                                        {formData.coverImage === preset.url && (
                                                            <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                                                                <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AvatarBuilderDialog
                                    isOpen={isBuilderOpen}
                                    onClose={() => setIsBuilderOpen(false)}
                                    onSave={handleAvatarSave}
                                />

                                <BannerLibraryDialog
                                    isOpen={isBannerLibraryOpen}
                                    onClose={() => setIsBannerLibraryOpen(false)}
                                    onSelect={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                                />
                            </section>
                        )}



                        {/* 3. EXPERTISE SECTION */}

                        {activeTab === "expertise" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600">
                                            <Brain className="w-6 h-6" />
                                        </div>
                                        Compétences & Attributs
                                    </h2>
                                    <p className="text-muted-foreground ml-[52px]">Vos domaines d'expertise et vos qualités personnelles.</p>
                                </div>

                                <div className="h-px bg-border/50 my-6" />

                                {/* SKILLS EDITOR */}
                                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-border/50">
                                    <div className="w-full">
                                        <div className="flex justify-center mb-6">
                                            <div className="inline-flex items-center bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg w-full max-w-md relative">
                                                {["PROFESSIONAL", "PERSONAL"].map((tab) => {
                                                    const isActive = skillCategory === tab;
                                                    return (
                                                        <button
                                                            key={tab}
                                                            type="button"
                                                            onClick={() => setSkillCategory(tab)}
                                                            className={cn(
                                                                "flex-1 relative z-10 py-2 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2",
                                                                isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                            )}
                                                        >
                                                            {tab === "PROFESSIONAL" ? <Briefcase className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                            {tab === "PROFESSIONAL" ? "Expertises" : "Qualités"}
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="activeTabPill"
                                                                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-md shadow-sm z-[-1]"
                                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Autocomplete Input */}
                                        {/* Autocomplete Input (Native Implementation) */}
                                        <div className="relative mb-6 z-20 group">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    placeholder={skillCategory === "PROFESSIONAL" ? "Rechercher une expertise..." : "Rechercher une qualité..."}
                                                    value={skillInput}
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && !!skillInput.trim() && handleAddSkill()}
                                                    className="pl-9 h-11 bg-white dark:bg-zinc-950"
                                                />
                                            </div>

                                            {/* Only show list if there is input */}
                                            {skillInput.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border rounded-md shadow-xl max-h-[300px] overflow-auto z-50">
                                                    <div className="p-1">
                                                        {isJourneyLoading && <div className="p-2 text-sm text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>}

                                                        {/* Custom Add Option */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleAddSkill();
                                                                setSkillInput(""); // Clear input after adding custom
                                                            }}
                                                            className="flex items-center gap-2 p-2 w-full text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-md transition-colors text-left"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            <span>Ajouter "<strong>{skillInput}</strong>"</span>
                                                        </button>

                                                        {/* Suggestions Header */}
                                                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Suggestions</div>

                                                        {/* Suggestions List */}
                                                        {(skillCategory === "PROFESSIONAL" ? SKILLS_PROFESSIONAL : SKILLS_PERSONAL)
                                                            .filter(s =>
                                                                (skillInput ? s.toLowerCase().includes(skillInput.toLowerCase()) : true) &&
                                                                !skillsList.some(userSkill => userSkill.name === s) // Exclude already added
                                                            )
                                                            .slice(0, 5)
                                                            .map((skill) => (
                                                                <button
                                                                    key={skill}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const tempId = Math.random().toString();
                                                                        setSkillInput("");

                                                                        const doAdd = async () => {
                                                                            // Optimistic Update
                                                                            setSkillsList(prev => [...prev, { id: tempId, name: skill, category: skillCategory, endorsementsCount: 0, userId: user.id }]);

                                                                            try {
                                                                                const result = await upsertSkill({ name: skill, category: skillCategory });
                                                                                if (!result.success) {
                                                                                    toast.error(result.error);
                                                                                    setSkillsList(prev => prev.filter(s => s.id !== tempId));
                                                                                } else {
                                                                                    toast.success("Compétence ajoutée");
                                                                                    setSkillsList(prev => prev.map(s => s.id === tempId ? { ...s, id: result.id! } : s));
                                                                                }
                                                                            } catch (error) {
                                                                                console.error("Add Skill Error:", error);
                                                                                setSkillsList(prev => prev.filter(s => s.id !== tempId));
                                                                                toast.error("Erreur technique lors de l'ajout");
                                                                            }
                                                                        }
                                                                        doAdd();
                                                                    }}
                                                                    className="flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                                                                >
                                                                    <Plus className="mr-2 h-4 w-4 opacity-50" />
                                                                    {skill}
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* CONTENT (No TabsContent needed anymore since we control state) */}
                                        {skillCategory === "PROFESSIONAL" && (
                                            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50 animate-in fade-in slide-in-from-left-4 duration-300">
                                                {skillsList.filter(s => s.category === "PROFESSIONAL").length === 0 ? (
                                                    <div className="text-center text-zinc-400 py-12 text-sm flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                                            <Briefcase className="w-5 h-5 text-zinc-400" />
                                                        </div>
                                                        <p>Aucune compétence professionnelle.</p>
                                                    </div>
                                                ) : (
                                                    skillsList.filter(s => s.category === "PROFESSIONAL").map(skill => (
                                                        <div key={skill.id} className="flex items-center justify-between p-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors first:rounded-t-lg last:rounded-b-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700/50">
                                                                    <Briefcase className="w-4 h-4 text-zinc-500" />
                                                                </div>
                                                                <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">{skill.name}</span>
                                                            </div>
                                                            <button
                                                                type="button" // <--- Critical Fix
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // <--- Critical Fix
                                                                    setDeletingItem({ id: skill.id, type: 'skill' as any });
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-red-50 hover:text-red-500 text-zinc-400 transition-all"
                                                                title="Retirer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {skillCategory === "PERSONAL" && (
                                            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50 animate-in fade-in slide-in-from-right-4 duration-300">
                                                {skillsList.filter(s => s.category === "PERSONAL").length === 0 ? (
                                                    <div className="text-center text-zinc-400 py-12 text-sm flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center">
                                                            <Sparkles className="w-5 h-5 text-indigo-400" />
                                                        </div>
                                                        <p>Aucune qualité ajoutée.</p>
                                                    </div>
                                                ) : (
                                                    skillsList.filter(s => s.category === "PERSONAL").map(skill => (
                                                        <div key={skill.id} className="flex items-center justify-between p-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors first:rounded-t-lg last:rounded-b-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                                                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                                                </div>
                                                                <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">{skill.name}</span>
                                                            </div>
                                                            <button
                                                                type="button" // <--- Critical Fix
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // <--- Critical Fix
                                                                    setDeletingItem({ id: skill.id, type: 'skill' as any });
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-red-50 hover:text-red-500 text-zinc-400 transition-all"
                                                                title="Retirer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground text-center mt-4">
                                    Ces compétences enrichissent votre profil et aident les autres à vous trouver.
                                </div>
                            </section>
                        )}



                        {/* 4. JOURNEY SECTION */}
                        {activeTab === "journey" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600">
                                            <Building className="w-6 h-6" />
                                        </div>
                                        Parcours Immobilier
                                    </h2>
                                    <p className="text-muted-foreground ml-[52px]">Votre expérience dans l'immobilier.</p>
                                </div>

                                {/* LIST MODE */}
                                {!editingExperience && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-border/50">
                                            <div>
                                                <h4 className="font-semibold text-foreground">Expériences Professionnelles</h4>
                                                <p className="text-xs text-muted-foreground">Ajoutez vos expériences pour montrer votre expertise.</p>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => setEditingExperience({})}
                                                size="sm"
                                                variant="outline"
                                                className="border-dashed border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Ajouter
                                            </Button>
                                        </div>
                                        {experiencesList.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                                                <Building className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                                                <p className="text-muted-foreground text-sm">Aucune expérience renseignée.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {experiencesList.map((exp: any) => (
                                                    <div key={exp.id} className="group flex items-start justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-amber-500/30 hover:shadow-sm transition-all">
                                                        <div className="flex gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                                                                <Building className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-sm">{exp.title}</h5>
                                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                                                    <span className="font-medium text-foreground">{exp.company}</span>
                                                                    <span>•</span>
                                                                    <span>{exp.location}</span>
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                                    <CalendarIcon className="w-3 h-3" />
                                                                    {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} -
                                                                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : ' Poste actuel'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingExperience(exp)}>
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                                onClick={() => setDeletingItem({ id: exp.id, type: 'experience' })}
                                                            >
                                                                {isJourneyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {editingExperience && (
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-semibold">{editingExperience.id ? "Modifier l'expérience" : "Ajouter une expérience"}</h3>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingExperience(null)}>Annuler</Button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Rôle / Titre</Label>
                                                <Input id="title" value={experienceForm.title} onChange={e => setExperienceForm({ ...experienceForm, title: e.target.value })} placeholder="ex: Investisseur Immobilier" required className="bg-white dark:bg-zinc-950" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="company">Entité / Structure</Label>
                                                <Input id="company" value={experienceForm.company} onChange={e => setExperienceForm({ ...experienceForm, company: e.target.value })} placeholder="ex: SCI Familiale" required className="bg-white dark:bg-zinc-950" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="location">Lieu</Label>
                                                <Input id="location" value={experienceForm.location} onChange={e => setExperienceForm({ ...experienceForm, location: e.target.value })} placeholder="ex: Bordeaux" className="bg-white dark:bg-zinc-950" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="startDate">Date de début</Label>
                                                    <Input id="startDate" type="date" value={experienceForm.startDate} onChange={e => setExperienceForm({ ...experienceForm, startDate: e.target.value })} required className="bg-white dark:bg-zinc-950" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="endDate" className={isExperienceCurrent ? "opacity-50" : ""}>Date de fin</Label>
                                                    <Input id="endDate" type="date" value={experienceForm.endDate} onChange={e => setExperienceForm({ ...experienceForm, endDate: e.target.value })} disabled={isExperienceCurrent} className="bg-white dark:bg-zinc-950" />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="current" checked={isExperienceCurrent} onCheckedChange={(c) => setIsExperienceCurrent(!!c)} />
                                                <Label htmlFor="current" className="font-normal cursor-pointer">C'est mon poste actuel</Label>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea id="description" value={experienceForm.description} onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })} rows={3} className="bg-white dark:bg-zinc-950" />
                                            </div>

                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button type="button" variant="ghost" onClick={() => setEditingExperience(null)}>Annuler</Button>
                                                <Button type="button" onClick={() => handleExperienceSubmit()} disabled={isJourneyLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                                                    {isJourneyLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                    Enregistrer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                        {/* 4.5. LICENSES SECTION */}
                        {activeTab === "licenses" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        Licences & Certifications
                                    </h2>
                                    <p className="text-muted-foreground ml-[52px]">Vos accréditations officielles et diplômes.</p>
                                </div>

                                {/* LIST MODE */}
                                {!editingCertification && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-border/50">
                                            <div>
                                                <h4 className="font-semibold text-foreground">Vos Licences</h4>
                                                <p className="text-xs text-muted-foreground">Ajoutez vos cartes professionnelles et certifications.</p>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => setEditingCertification({})}
                                                size="sm"
                                                variant="outline"
                                                className="border-dashed border-blue-500/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Ajouter
                                            </Button>
                                        </div>
                                        {certificationsList.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                                                <ShieldCheck className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                                                <p className="text-muted-foreground text-sm">Aucune certification renseignée.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {certificationsList.map((cert: any) => (
                                                    <div key={cert.id} className="group flex items-start justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-blue-500/30 hover:shadow-sm transition-all">
                                                        <div className="flex gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                                                                <FileCheck className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-sm">{cert.name}</h5>
                                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                                                    <span className="font-medium text-foreground">{cert.issuer}</span>
                                                                    {cert.credentialId && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">{cert.credentialId}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground mt-1">
                                                                    Délivré le {new Date(cert.issueDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                                                    {cert.expiryDate && ` · Expire le ${new Date(cert.expiryDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingCertification(cert)}>
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                                onClick={() => setDeletingItem({ id: cert.id, type: 'certification' })}
                                                            >
                                                                {isJourneyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {editingCertification && (
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-semibold">{editingCertification.id ? "Modifier la licence" : "Ajouter une licence"}</h3>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingCertification(null)}>Annuler</Button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="certName">Nom de la Certification / Licence</Label>
                                                <Input id="certName" value={certificationForm.name} onChange={e => setCertificationForm({ ...certificationForm, name: e.target.value })} placeholder="ex: Carte Professionnelle (T)" required className="bg-white dark:bg-zinc-950" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="certIssuer">Organisme de délivrance</Label>
                                                <Input id="certIssuer" value={certificationForm.issuer} onChange={e => setCertificationForm({ ...certificationForm, issuer: e.target.value })} placeholder="ex: CCI France" required className="bg-white dark:bg-zinc-950" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="certIssueDate">Date d'émission</Label>
                                                    <Input id="certIssueDate" type="date" value={certificationForm.issueDate} onChange={e => setCertificationForm({ ...certificationForm, issueDate: e.target.value })} required className="bg-white dark:bg-zinc-950" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="certExpiryDate">Date d'expiration (Optionnel)</Label>
                                                    <Input id="certExpiryDate" type="date" value={certificationForm.expiryDate} onChange={e => setCertificationForm({ ...certificationForm, expiryDate: e.target.value })} className="bg-white dark:bg-zinc-950" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="certID">ID du justificatif (Optionnel)</Label>
                                                <Input id="certID" value={certificationForm.credentialId} onChange={e => setCertificationForm({ ...certificationForm, credentialId: e.target.value })} placeholder="ex: CPI 7501 2018..." className="bg-white dark:bg-zinc-950" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="certURL">URL de vérification (Optionnel)</Label>
                                                <Input id="certURL" value={certificationForm.credentialUrl} onChange={e => setCertificationForm({ ...certificationForm, credentialUrl: e.target.value })} placeholder="https://..." className="bg-white dark:bg-zinc-950" />
                                            </div>

                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button type="button" variant="ghost" onClick={() => setEditingCertification(null)}>Annuler</Button>
                                                <Button type="button" onClick={handleCertificationSubmit} disabled={isJourneyLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                    {isJourneyLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                    Enregistrer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}



                        {/* 5. CONTACT SECTION */}
                        {activeTab === "contact" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/10 text-green-600">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        Contact & Réseaux
                                    </h2>
                                    <p className="text-muted-foreground ml-[52px]">Comment les autres peuvent vous contacter et vous suivre.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Email Public</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="votre.email@exemple.com" className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Téléphone Public</Label>
                                        <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+33 6 12 34 56 78" className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Réseaux Sociaux & Liens</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="website" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Site Web Personnel</Label>
                                            <Input id="website" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://mon-site.com" className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">LinkedIn URL</Label>
                                            <Input id="linkedin" value={formData.socials.linkedin} onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, linkedin: e.target.value } }))} placeholder="https://linkedin.com/in/..." className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="twitter" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Twitter URL</Label>
                                            <Input id="twitter" value={formData.socials.twitter} onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, twitter: e.target.value } }))} placeholder="https://twitter.com/..." className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="instagram" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Instagram URL</Label>
                                            <Input id="instagram" value={formData.socials.instagram} onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, instagram: e.target.value } }))} placeholder="https://instagram.com/..." className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="youtube" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">YouTube URL</Label>
                                            <Input id="youtube" value={formData.socials.youtube} onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, youtube: e.target.value } }))} placeholder="https://youtube.com/..." className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">WhatsApp URL</Label>
                                            <Input id="whatsapp" value={formData.socials.whatsapp} onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, whatsapp: e.target.value } }))} placeholder="https://wa.me/..." className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="calendly" className="text-xs font-bold uppercase text-muted-foreground/80 tracking-wider">Calendly URL</Label>
                                            <Input id="calendly" value={formData.socials.calendly} onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, calendly: e.target.value } }))} placeholder="https://calendly.com/..." className="h-11 bg-zinc-50 dark:bg-zinc-900/50 focus:ring-green-500/20 focus:border-green-500" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="pb-8 text-center hidden md:block">
                            <p className="text-xs text-muted-foreground">Vos données sont protégées et conformes au RGPD.</p>
                        </div>

                    </form>
                </div>
            </div>

            {/* --- MOBILE FIXED FOOTER --- */}
            <div className="md:hidden p-4 border-t border-border bg-background/95 backdrop-blur shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex gap-3 z-50 fixed bottom-0 left-0 right-0">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                    Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || isUploading} className="flex-[2] bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/20">
                    {isSubmitting ? "..." : "Enregistrer"}
                </Button>
            </div>

            <ImageEditorDialog
                isOpen={!!editingImage}
                onClose={() => setEditingImage(null)}
                imageSrc={editingImage}
                aspectRatio={editingType === "avatar" ? 1 : 3}
                type={editingType}
                onSave={handleEditorSave}
            />

            <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                            {deletingItem?.type === 'experience' && "Cette expérience sera définitivement supprimée de votre profil."}
                            {deletingItem?.type === 'certification' && "Cette certification sera définitivement supprimée de votre profil."}
                            {deletingItem?.type === 'skill' && "Cette compétence sera supprimée de votre profil."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isJourneyLoading}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isJourneyLoading}
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                        >
                            {isJourneyLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
