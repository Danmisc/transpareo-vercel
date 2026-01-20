import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getUserDocuments, getStorageStats, getDocumentCategories } from "@/lib/actions-documents";
import { DocumentsVault } from "@/components/p2p/DocumentsVault";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Cloud, FileText, FolderOpen } from "lucide-react";
import Link from "next/link";

export default async function DocumentsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Fetch real data
    const [documents, storageStats, categories] = await Promise.all([
        getUserDocuments(),
        getStorageStats(),
        getDocumentCategories()
    ]);

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12 relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-4 uppercase tracking-wider">
                            <Shield size={14} /> Coffre-fort Sécurisé
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-2">
                            Mes <span className="text-emerald-600">Documents</span>
                        </h1>
                        <p className="text-zinc-500 max-w-xl">
                            Contrats, relevés fiscaux et justificatifs. Tout est stocké de manière sécurisée et accessible à tout moment.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Storage Stats */}
                        <Card className="bg-zinc-900 text-white border-zinc-800">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center">
                                        <Cloud size={20} className="text-zinc-400" />
                                    </div>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px]">
                                        SÉCURISÉ
                                    </Badge>
                                </div>
                                <h3 className="font-bold text-lg mb-1">Stockage</h3>
                                <p className="text-3xl font-mono mb-4">
                                    {storageStats?.usedMB || 0} <span className="text-base text-zinc-500">/ {storageStats?.maxMB} Mo</span>
                                </p>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all"
                                        style={{ width: `${storageStats?.percentage || 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                    {storageStats?.documentCount || 0} documents
                                </p>
                            </CardContent>
                        </Card>

                        {/* Categories */}
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <FolderOpen size={16} /> Catégories
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="space-y-2">
                                    {Object.entries(categories || {}).map(([type, data]) => (
                                        data.count > 0 && (
                                            <div
                                                key={type}
                                                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">{data.label}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {data.count}
                                                </Badge>
                                            </div>
                                        )
                                    ))}
                                    {documents.length === 0 && (
                                        <p className="text-xs text-zinc-400 text-center py-2">
                                            Aucune catégorie
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Notice */}
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                            <div className="flex gap-3">
                                <Lock size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm text-blue-900 dark:text-blue-300">Confidentialité</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                        Vos documents sont protégés. Seul vous pouvez y accéder.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA if no documents */}
                        {documents.length === 0 && (
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="p-4 text-center">
                                    <FileText size={24} className="mx-auto mb-2 text-zinc-400" />
                                    <p className="text-sm text-zinc-500 mb-3">
                                        Complétez votre KYC pour générer vos premiers documents.
                                    </p>
                                    <Link href="/p2p/settings/kyc">
                                        <Button size="sm" className="w-full">
                                            Compléter KYC
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Main Content: Vault */}
                    <div className="lg:col-span-3">
                        <DocumentsVault documents={documents} />
                    </div>
                </div>
            </div>
        </div>
    );
}

