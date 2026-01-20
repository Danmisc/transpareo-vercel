"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Comprehensive list of languages
const LANGUAGES = [
    { value: "français", label: "Français" },
    { value: "anglais", label: "Anglais" },
    { value: "espagnol", label: "Espagnol" },
    { value: "allemand", label: "Allemand" },
    { value: "italien", label: "Italien" },
    { value: "portugais", label: "Portugais" },
    { value: "néerlandais", label: "Néerlandais" },
    { value: "russe", label: "Russe" },
    { value: "chinois (mandarin)", label: "Chinois (Mandarin)" },
    { value: "japonais", label: "Japonais" },
    { value: "arabe", label: "Arabe" },
    { value: "hindi", label: "Hindi" },
    { value: "coréen", label: "Coréen" },
    { value: "turc", label: "Turc" },
    { value: "polonais", label: "Polonais" },
    { value: "suédois", label: "Suédois" },
    { value: "danois", label: "Danois" },
    { value: "norvégien", label: "Norvégien" },
    { value: "finnois", label: "Finnois" },
    { value: "grec", label: "Grec" },
    { value: "tchèque", label: "Tchèque" },
    { value: "hongrois", label: "Hongrois" },
    { value: "roumain", label: "Roumain" },
    { value: "thaï", label: "Thaï" },
    { value: "vietnamien", label: "Vietnamien" },
    { value: "indonésien", label: "Indonésien" },
    { value: "hébreu", label: "Hébreu" },
    { value: "ukrainien", label: "Ukrainien" },
    { value: "croate", label: "Croate" },
    { value: "serbe", label: "Serbe" },
    { value: "slovaque", label: "Slovaque" },
    { value: "bulgare", label: "Bulgare" },
];

interface LanguageSelectorProps {
    value?: string; // Comma separated string
    onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    const [open, setOpen] = React.useState(false);

    // Convert comma string to array and trim whitespace
    const selectedLanguages = React.useMemo(() => {
        return value ? value.split(',').map(l => l.trim()).filter(Boolean) : [];
    }, [value]);

    const handleSelect = (selectedValue: string) => {
        // Find the language object to get the correct label casing
        const language = LANGUAGES.find(l => l.value.toLowerCase() === selectedValue.toLowerCase());
        if (!language) return;

        const currentLabel = language.label;
        let updatedLanguages;

        if (selectedLanguages.includes(currentLabel)) {
            updatedLanguages = selectedLanguages.filter(l => l !== currentLabel);
        } else {
            updatedLanguages = [...selectedLanguages, currentLabel];
        }
        onChange(updatedLanguages.join(', '));
        // Keep open for multiple selection
    };

    const handleRemove = (langToRemove: string) => {
        const updated = selectedLanguages.filter(l => l !== langToRemove);
        onChange(updated.join(', '));
    };

    return (
        <div className="space-y-3">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-11 bg-zinc-50 dark:bg-zinc-900/50 border-input hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <span className="text-muted-foreground font-normal truncate">
                            {selectedLanguages.length > 0 ? "Ajouter une langue..." : "Sélectionner des langues..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 z-[100]" align="start">
                    <Command>
                        <CommandInput placeholder="Rechercher une langue..." />
                        <CommandList>
                            <CommandEmpty>Aucune langue trouvée.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                                {LANGUAGES.map((language) => {
                                    const isSelected = selectedLanguages.includes(language.label);
                                    return (
                                        <CommandItem
                                            key={language.value}
                                            value={language.value}
                                            onSelect={(val) => handleSelect(val)}
                                            className="cursor-pointer data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {language.label}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {selectedLanguages.map((lang, i) => (
                    <Badge
                        key={i}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 h-7 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors animate-in fade-in zoom-in-95 duration-200"
                    >
                        {lang}
                        <button
                            type="button"
                            className="ml-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full p-0.5 transition-colors cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(lang);
                            }}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}
