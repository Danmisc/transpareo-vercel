"use client";

import { useState, useEffect } from "react";
import {
    Send,
    Bot,
    FileText,
    Shield,
    Scale,
    Sparkles,
    Search,
    AlertCircle,
    Check,
    Pencil,
    X,
    History,
    MessageSquarePlus,
    Trash,
    RefreshCw,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    askLegalAI,
    getRecentConversations,
    createNewConversation,
    getConversationMessages,
    getAllConversations,
    updateConversationTitle,
    deleteConversation,
    restoreConversation
} from "@/lib/actions-legal";
import { ContractWizard } from "./legal/ContractWizard";

// Define simplified types for the UI
interface UIConversation {
    id: string;
    title: string | null;
    updatedAt: Date;
}

export function OwnerLegal() {
    // --- STATE ---
    const [messages, setMessages] = useState<any[]>([
        { role: "system", content: "Bonjour ! Je suis votre Expert Juridique IA. Je suis entraîné sur le Code Civil, la Loi de 1989 et la Loi Alur. Une question sur un contrat ou un droit ?" }
    ]);
    const [conversations, setConversations] = useState<UIConversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

    const [input, setInput] = useState("");
    const [complianceScore, setComplianceScore] = useState(85); // Mock
    const [isTyping, setIsTyping] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [allConversations, setAllConversations] = useState<UIConversation[]>([]);

    // Title Editing State
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
    const [editTitleInput, setEditTitleInput] = useState("");

    // Law Search State
    const [isSearchLawOpen, setIsSearchLawOpen] = useState(false);
    const [searchLawQuery, setSearchLawQuery] = useState("");

    // Alerts State
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);

    // --- EFFECTS ---
    useEffect(() => {
        loadRecentConversations();
    }, []);

    const loadRecentConversations = async () => {
        try {
            const recents = await getRecentConversations();
            setConversations(recents);
        } catch (error) {
            console.error("Failed to load conversations", error);
        }
    };

    const handleOpenArchives = async () => {
        try {
            setIsArchiveOpen(true);
            const all = await getAllConversations();
            setAllConversations(all);
        } catch (error) {
            console.error("Failed to load archives", error);
        }
    };

    // --- ACTIONS ---
    const handleNewChat = async () => {
        try {
            const newConv = await createNewConversation();
            setCurrentConversationId(newConv.id);
            setMessages([{ role: "system", content: "Bonjour ! Je suis votre Expert Juridique IA. Une nouvelle conversation commence." }]);
            await loadRecentConversations();
        } catch (error) {
            console.error("Failed to create conversation", error);
        }
    };

    const handleUpdateTitle = async () => {
        if (!editingConversationId || !editTitleInput.trim()) {
            setEditingConversationId(null);
            return;
        }

        try {
            const success = await updateConversationTitle(editingConversationId, editTitleInput);
            if (success) {
                // Optimistic Update
                setConversations(prev => prev.map(c =>
                    c.id === editingConversationId ? { ...c, title: editTitleInput } : c
                ));
                setAllConversations(prev => prev.map(c =>
                    c.id === editingConversationId ? { ...c, title: editTitleInput } : c
                ));
            }
        } catch (error) {
            console.error("Failed to update title", error);
        } finally {
            setEditingConversationId(null);
        }
    };

    const loadConversation = async (conversationId: string) => {
        try {
            setIsTyping(true);
            setCurrentConversationId(conversationId);
            const msgs = await getConversationMessages(conversationId);

            const uiMessages = msgs.map((m: any) => ({
                role: m.role === 'assistant' ? 'system' : m.role,
                content: m.content
            }));

            setMessages(uiMessages);
        } catch (error) {
            console.error("Failed to load conversation", error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        let targetConversationId = currentConversationId;
        if (!targetConversationId) {
            try {
                const newConv = await createNewConversation();
                targetConversationId = newConv.id;
                setCurrentConversationId(newConv.id);
            } catch (e) {
                console.error("Auto-create conv failed", e);
            }
        }

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await askLegalAI(input, targetConversationId || undefined);
            setMessages(prev => [...prev, response]);
            loadRecentConversations();
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "system", content: "Désolé, je rencontre une erreur de connexion au cerveau juridique." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in duration-500">

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">

                {/* LEFT: SIDEBAR (History + Tools) */}
                <div className="hidden lg:flex flex-col gap-4 min-h-0 col-span-1">
                    <Button onClick={handleNewChat} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" size="lg">
                        <MessageSquarePlus size={18} className="mr-2" />
                        Nouvelle conversation
                    </Button>

                    {/* HISTORY CARD */}
                    <Card className="flex-1 border-zinc-200 shadow-sm bg-white overflow-hidden flex flex-col min-h-0">
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="font-bold text-zinc-700 text-sm flex items-center gap-2">
                                <History size={16} className="text-zinc-400" />
                                Récemment
                            </h3>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {conversations.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-zinc-400">
                                        Aucune conversation
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <div key={conv.id} className="relative group">
                                            {editingConversationId === conv.id ? (
                                                <div className="flex items-center gap-1 p-2 bg-indigo-50 rounded-xl border border-indigo-200">
                                                    <Input
                                                        value={editTitleInput}
                                                        onChange={(e) => setEditTitleInput(e.target.value)}
                                                        className="h-7 text-xs bg-white border-indigo-100"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateTitle();
                                                            if (e.key === 'Escape') setEditingConversationId(null);
                                                        }}
                                                    />
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleUpdateTitle}>
                                                        <Check size={14} />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100" onClick={() => setEditingConversationId(null)}>
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => loadConversation(conv.id)}
                                                    className={`w-full text-left p-3 rounded-xl text-sm transition-all border relative pr-16 ${currentConversationId === conv.id
                                                        ? 'bg-indigo-50 border-indigo-100 text-indigo-900 shadow-sm'
                                                        : 'hover:bg-zinc-50 border-transparent text-zinc-600 hover:text-zinc-900'
                                                        }`}
                                                >
                                                    <div className="font-medium truncate">{conv.title || "Nouvelle conversation"}</div>
                                                    <div className="text-[10px] text-zinc-400 mt-1">
                                                        {new Date(conv.updatedAt).toLocaleDateString()}
                                                    </div>

                                                    {/* Hover Actions */}
                                                    <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 backdrop-blur-sm rounded-md p-0.5">
                                                        <div
                                                            className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-indigo-600 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingConversationId(conv.id);
                                                                setEditTitleInput(conv.title || "");
                                                            }}
                                                        >
                                                            <Pencil size={12} />
                                                        </div>
                                                        <div
                                                            className="p-1 hover:bg-red-100 rounded text-zinc-400 hover:text-red-600 cursor-pointer"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (confirm("Supprimer cette conversation ?")) {
                                                                    await deleteConversation(conv.id);
                                                                    loadRecentConversations();
                                                                    if (currentConversationId === conv.id) setCurrentConversationId(null);
                                                                }
                                                            }}
                                                        >
                                                            <Trash size={12} />
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-3 border-t border-zinc-100 bg-zinc-50/30">
                            <Button variant="ghost" size="sm" onClick={handleOpenArchives} className="w-full text-xs text-zinc-400 hover:text-zinc-600">
                                Voir les archives
                            </Button>
                        </div>
                    </Card>

                    {/* MOVED TOOLS SECTION: SMALLER VARIANT */}
                    <div className="grid grid-cols-2 gap-2">
                        <Card className="border-zinc-200 shadow-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setIsWizardOpen(true)}>
                            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Sparkles size={14} />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-700 leading-tight">Générateur<br />Contrats</span>
                            </CardContent>
                        </Card>
                        <Card
                            className="border-red-200 shadow-sm bg-red-50 cursor-pointer hover:bg-red-100 transition-colors group"
                            onClick={() => setIsAlertsOpen(true)}
                        >
                            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2 relative">
                                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <div className="h-8 w-8 rounded-full bg-white text-red-500 flex items-center justify-center border border-red-100">
                                    <AlertCircle size={14} />
                                </div>
                                <span className="text-[10px] font-bold text-red-800 leading-tight">2 Actions<br />Requises</span>
                            </CardContent>
                        </Card>
                    </div>

                </div>

                {/* CENTER: AI CHAT (EXPANDED) */}
                <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-indigo-100">
                                <AvatarImage src="/ai-lawyer.png" />
                                <AvatarFallback className="bg-indigo-100 text-indigo-600"><Bot size={20} /></AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-zinc-900 text-sm">Maître IA</h3>
                                <p className="text-[11px] text-zinc-500 uppercase font-medium tracking-wide">Expert Droit Immobilier</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 text-xs"
                            onClick={() => setIsSearchLawOpen(true)}
                        >
                            <Search size={14} /> Rechercher une loi
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-zinc-900 text-white rounded-tr-none'
                                        : 'bg-white border border-zinc-100 text-zinc-700 rounded-tl-none'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            msg.content
                                        ) : (
                                            <div className="space-y-2">
                                                <ReactMarkdown
                                                    components={{
                                                        strong: ({ node, ...props }) => <span className="font-bold text-indigo-700" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="marker:text-indigo-400" {...props} />,
                                                        h1: ({ node, ...props }) => <h3 className="font-bold text-lg text-indigo-900 mt-2" {...props} />,
                                                        h2: ({ node, ...props }) => <h4 className="font-bold text-base text-indigo-800 mt-1" {...props} />,
                                                        h3: ({ node, ...props }) => <h5 className="font-bold text-sm text-indigo-700" {...props} />,
                                                        p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-zinc-100 text-zinc-400 rounded-2xl rounded-tl-none p-4 text-sm shadow-sm flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 bg-zinc-50/50 border-t border-zinc-100">
                        <div className="relative">
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Posez une question juridique..."
                                className="pr-12 bg-white border-zinc-200 shadow-sm rounded-xl py-6"
                                disabled={isTyping}
                            />
                            <Button size="icon" onClick={handleSend} disabled={isTyping} className="absolute right-2 top-1.5 h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                                <Send size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* WIZARD DIALOG */}
            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
                <DialogContent className="sm:max-w-[700px] p-6">
                    <DialogHeader>
                        <DialogTitle>Création de Bail</DialogTitle>
                        <CardDescription>Remplissez les informations pour générer un contrat conforme.</CardDescription>
                    </DialogHeader>
                    <ContractWizard onClose={() => setIsWizardOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* LAW SEARCH DIALOG */}
            <Dialog open={isSearchLawOpen} onOpenChange={setIsSearchLawOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Recherche Juridique</DialogTitle>
                        <CardDescription>
                            Accédez directement aux articles de loi et à la jurisprudence.
                        </CardDescription>
                    </DialogHeader>
                    <div className="flex gap-2 mt-2">
                        <Input
                            placeholder="Ex: Article 22 loi 1989, Expulsion..."
                            value={searchLawQuery}
                            onChange={(e) => setSearchLawQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setIsSearchLawOpen(false);
                                    const query = `Que dit la loi concernant : ${searchLawQuery} ?`;
                                    const userMsg = { role: "user", content: query };
                                    setMessages(prev => [...prev, userMsg]);
                                    setIsTyping(true);
                                    askLegalAI(query, currentConversationId || undefined).then(response => {
                                        setMessages(prev => [...prev, response]);
                                        setIsTyping(false);
                                        loadRecentConversations();
                                    });
                                    setSearchLawQuery("");
                                }
                            }}
                        />
                        <Button onClick={() => {
                            setIsSearchLawOpen(false);
                            const query = `Que dit la loi concernant : ${searchLawQuery} ?`;
                            const userMsg = { role: "user", content: query };
                            setMessages(prev => [...prev, userMsg]);
                            setIsTyping(true);
                            askLegalAI(query, currentConversationId || undefined).then(response => {
                                setMessages(prev => [...prev, response]);
                                setIsTyping(false);
                                loadRecentConversations();
                            });
                            setSearchLawQuery("");
                        }}>
                            <Search size={16} />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ALERTS DIALOG */}
            <Dialog open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle size={20} />
                            Actions Requises
                        </DialogTitle>
                        <CardDescription>
                            Ces éléments nécessitent votre attention pour garantir la conformité de votre parc.
                        </CardDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                        {/* Item 1: DPE */}
                        <div className="flex items-start justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                            <div className="flex gap-3">
                                <div className="mt-1 bg-white p-2 rounded-full border border-red-100 text-red-500">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-800 text-sm">DPE Manquant</h4>
                                    <p className="text-xs text-zinc-500 mb-1">Appartement Victor Hugo</p>
                                    <Badge variant="outline" className="bg-white text-red-600 border-red-200 text-[10px]">Urgence Élevée</Badge>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                                onClick={() => {
                                    setIsAlertsOpen(false);
                                    const query = "Je dois régulariser le DPE de l'appartement Victor Hugo, quelles sont les étapes et les délais ?";
                                    setInput(query);
                                    // Trigger AI
                                    const userMsg = { role: "user", content: query };
                                    setMessages(prev => [...prev, userMsg]);
                                    setIsTyping(true);
                                    askLegalAI(query, currentConversationId || undefined).then(response => {
                                        setMessages(prev => [...prev, response]);
                                        setIsTyping(false);
                                        loadRecentConversations();
                                    });
                                }}
                            >
                                Régulariser
                            </Button>
                        </div>

                        {/* Item 2: Assurance */}
                        <div className="flex items-start justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <div className="flex gap-3">
                                <div className="mt-1 bg-white p-2 rounded-full border border-orange-100 text-orange-500">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-800 text-sm">Assurance PNO à renouveler</h4>
                                    <p className="text-xs text-zinc-500 mb-1">Échéance : 15 Janvier 2026</p>
                                    <Badge variant="outline" className="bg-white text-orange-600 border-orange-200 text-[10px]">Moyenne</Badge>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8"
                                onClick={() => {
                                    setIsAlertsOpen(false);
                                    const query = "Mon assurance PNO arrive à échéance pour l'appartement Victor Hugo. Est-elle obligatoire et comment la renouveler au meilleur tarif ?";
                                    setInput(query);
                                    // Trigger AI
                                    const userMsg = { role: "user", content: query };
                                    setMessages(prev => [...prev, userMsg]);
                                    setIsTyping(true);
                                    askLegalAI(query, currentConversationId || undefined).then(response => {
                                        setMessages(prev => [...prev, response]);
                                        setIsTyping(false);
                                        loadRecentConversations();
                                    });
                                }}
                            >
                                Renouveler
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ARCHIVES DIALOG */}
            <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                        <DialogTitle className="text-base flex items-center gap-2">
                            <History size={18} className="text-indigo-600" />
                            Historique des conversations
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[400px]">
                        <div className="p-2 space-y-1">
                            {allConversations.length === 0 ? (
                                <div className="p-8 text-center text-sm text-zinc-500">
                                    Chargement...
                                </div>
                            ) : (
                                allConversations.map((conv) => {
                                    const daysRemaining = 30 - Math.floor((new Date().getTime() - new Date(conv.updatedAt).getTime()) / (1000 * 3600 * 24));
                                    return (
                                        <div key={conv.id} className="relative group">
                                            {editingConversationId === conv.id ? (
                                                <div className="flex items-center gap-1 p-2 bg-indigo-50 rounded-xl border border-indigo-200 mb-1">
                                                    <Input
                                                        value={editTitleInput}
                                                        onChange={(e) => setEditTitleInput(e.target.value)}
                                                        className="h-7 text-xs bg-white border-indigo-100"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateTitle();
                                                            if (e.key === 'Escape') setEditingConversationId(null);
                                                        }}
                                                    />
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleUpdateTitle}>
                                                        <Check size={14} />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100" onClick={() => setEditingConversationId(null)}>
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        loadConversation(conv.id);
                                                        setIsArchiveOpen(false);
                                                    }}
                                                    className={`w-full text-left p-4 rounded-xl text-sm transition-all border relative pr-16 group mb-1 hover:bg-zinc-50 hover:border-indigo-100 ${currentConversationId === conv.id
                                                        ? 'bg-indigo-50 border-indigo-100 text-indigo-900'
                                                        : 'border-transparent text-zinc-600'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <div className="font-medium truncate pr-2 group-hover:text-indigo-700 flex-1">{conv.title || "Nouvelle conversation"}</div>
                                                        <Badge variant="secondary" className={`text-[9px] h-4 px-1 ${daysRemaining < 5 ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                                            J-{daysRemaining > 0 ? daysRemaining : 0}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-zinc-400 mt-1 flex justify-between">
                                                        <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                                                        <span>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>

                                                    {/* Hover Actions */}
                                                    <div className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 backdrop-blur-sm rounded-md p-0.5">
                                                        <div
                                                            className="p-1 hover:bg-emerald-100 rounded text-zinc-400 hover:text-emerald-600 cursor-pointer"
                                                            title="Restaurer (Prolonger 30 jours)"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                await restoreConversation(conv.id);
                                                                handleOpenArchives(); // Reload list
                                                            }}
                                                        >
                                                            <RefreshCw size={12} />
                                                        </div>
                                                        <div
                                                            className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-indigo-600 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingConversationId(conv.id);
                                                                setEditTitleInput(conv.title || "");
                                                            }}
                                                        >
                                                            <Pencil size={12} />
                                                        </div>
                                                        <div
                                                            className="p-1 hover:bg-red-100 rounded text-zinc-400 hover:text-red-600 cursor-pointer"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (confirm("Supprimer définitivement ?")) {
                                                                    await deleteConversation(conv.id);
                                                                    handleOpenArchives(); // Reload list
                                                                }
                                                            }}
                                                        >
                                                            <Trash size={12} />
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

        </div>
    );
}
