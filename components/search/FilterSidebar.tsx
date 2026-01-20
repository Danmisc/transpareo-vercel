"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Map as MapIcon, Filter } from "lucide-react";

export function FilterSidebar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // State synced with URL mostly, but local for sliders until commit
    const [priceRange, setPriceRange] = useState([500, 2000]);
    const currentTab = searchParams.get("tab") || "all";

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <Card className="border-0 shadow-none bg-transparent lg:bg-white lg:dark:bg-zinc-900 lg:border lg:shadow-sm h-full">
            <CardHeader className="px-4 py-4 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                        Filtres & Options
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => router.push(pathname)}
                    >
                        <RefreshCcw className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Accordion type="multiple" defaultValue={["role", "location", "status"]} className="w-full">

                    {/* ROLE FILTER (Only for Users/All) */}
                    {(currentTab === "all" || currentTab === "users") && (
                        <AccordionItem value="role" className="px-4 border-b">
                            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                                Rôle
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="role-tenant"
                                        checked={searchParams.get("role") === "TENANT"}
                                        onCheckedChange={(c) => updateFilter("role", c ? "TENANT" : null)}
                                    />
                                    <Label htmlFor="role-tenant">Locataire</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="role-owner"
                                        checked={searchParams.get("role") === "OWNER"}
                                        onCheckedChange={(c) => updateFilter("role", c ? "OWNER" : null)}
                                    />
                                    <Label htmlFor="role-owner">Propriétaire / Bailleur</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="role-agency"
                                        checked={searchParams.get("role") === "AGENCY"}
                                        onCheckedChange={(c) => updateFilter("role", c ? "AGENCY" : null)}
                                    />
                                    <Label htmlFor="role-agency">Agence Immobilière</Label>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* LOCATION (Universal) */}
                    <AccordionItem value="location" className="px-4 border-b">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                            Localisation
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                            <div className="flex flex-wrap gap-2">
                                {["Paris", "Lyon", "Marseille", "Bordeaux"].map(city => (
                                    <Badge
                                        key={city}
                                        variant={searchParams.get("location") === city ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => updateFilter("location", searchParams.get("location") === city ? null : city)}
                                    >
                                        {city}
                                    </Badge>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* LINKEDIN FILTERS (Users) */}
                    {(currentTab === "all" || currentTab === "users") && (
                        <>
                            <AccordionItem value="company" className="px-4 border-b">
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline">Entreprise</AccordionTrigger>
                                <AccordionContent className="pt-2">
                                    <div className="space-y-2">
                                        {["Transpareo", "Google", "Airbnb", "Freelance"].map(c => (
                                            <div key={c} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`c-${c}`}
                                                    checked={searchParams.get("company") === c}
                                                    onCheckedChange={(val) => updateFilter("company", val ? c : null)}
                                                />
                                                <Label htmlFor={`c-${c}`}>{c}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="school" className="px-4 border-b">
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline">École / Université</AccordionTrigger>
                                <AccordionContent className="pt-2">
                                    <div className="space-y-2">
                                        {["HEC Paris", "ESSEC", "Polytechnique", "42"].map(s => (
                                            <div key={s} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`s-${s}`}
                                                    checked={searchParams.get("school") === s}
                                                    onCheckedChange={(val) => updateFilter("school", val ? s : null)}
                                                />
                                                <Label htmlFor={`s-${s}`}>{s}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </>
                    )}

                    {/* MARKETPLACE FILTERS */}
                    {(currentTab === "marketplace") && (
                        <AccordionItem value="price" className="px-4 border-b">
                            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                                Loyer / Prix
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 px-2">
                                <Slider
                                    defaultValue={[500, 2000]}
                                    max={5000}
                                    step={100}
                                    onValueCommit={(val) => {
                                        setPriceRange(val);
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set("minPrice", val[0].toString());
                                        params.set("maxPrice", val[1].toString());
                                        router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                    }}
                                />
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>{priceRange[0]}€</span>
                                    <span>{priceRange[1]}€+</span>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                </Accordion>

                {/* SAVED SEARCHES ALERT */}
                <div className="p-4 mt-4 bg-zinc-50 dark:bg-zinc-800/50 m-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-xs font-bold uppercase mb-2">Alerte Recherche</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                        Recevez une notif quand un résultat correspond.
                    </p>
                    <Button size="sm" variant="secondary" className="w-full text-xs h-8">
                        Créer une alerte
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

