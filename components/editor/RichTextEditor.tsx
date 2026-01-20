"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Bold, Italic, Link2, Code, List, ListOrdered,
    Quote, Heading1, Heading2, Undo, Redo,
    AlignLeft, AlignCenter, AlignRight,
    Strikethrough, Underline as UnderlineIcon,
    AtSign, Hash, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    contentFormat?: "TEXT" | "MARKDOWN" | "RICHTEXT";
    onFormatChange?: (format: "TEXT" | "MARKDOWN" | "RICHTEXT") => void;
    minHeight?: string;
    maxHeight?: string;
    disabled?: boolean;
}

interface ToolbarButton {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    action: () => void;
    isActive?: boolean;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Écrivez votre contenu...",
    contentFormat = "MARKDOWN",
    onFormatChange,
    minHeight = "120px",
    maxHeight = "400px",
    disabled = false,
}: RichTextEditorProps) {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useCallback((node: HTMLTextAreaElement | null) => {
        if (node) {
            node.style.height = "auto";
            node.style.height = `${Math.min(node.scrollHeight, parseInt(maxHeight))}px`;
        }
    }, [value, maxHeight]);

    // Insert formatting at cursor position
    const insertFormat = (before: string, after: string = "") => {
        const textarea = document.querySelector<HTMLTextAreaElement>("#rich-editor");
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.substring(start, end);

        const newValue =
            value.substring(0, start) +
            before + selected + after +
            value.substring(end);

        onChange(newValue);

        // Reset cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
        }, 0);
    };

    const insertAtCursor = (text: string) => {
        const textarea = document.querySelector<HTMLTextAreaElement>("#rich-editor");
        if (!textarea) return;

        const start = textarea.selectionStart;
        const newValue = value.substring(0, start) + text + value.substring(start);
        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
    };

    // Format detection for active states
    const hasFormat = (pattern: RegExp) => {
        const textarea = document.querySelector<HTMLTextAreaElement>("#rich-editor");
        if (!textarea) return false;
        const selected = value.substring(textarea.selectionStart, textarea.selectionEnd);
        return pattern.test(selected);
    };

    const toolbarButtons: ToolbarButton[] = [
        { icon: Bold, label: "Gras (Ctrl+B)", action: () => insertFormat("**", "**") },
        { icon: Italic, label: "Italique (Ctrl+I)", action: () => insertFormat("*", "*") },
        { icon: Strikethrough, label: "Barré", action: () => insertFormat("~~", "~~") },
        { icon: Code, label: "Code inline", action: () => insertFormat("`", "`") },
        { icon: Link2, label: "Lien", action: () => insertFormat("[", "](url)") },
        { icon: Heading1, label: "Titre 1", action: () => insertAtCursor("\n# ") },
        { icon: Heading2, label: "Titre 2", action: () => insertAtCursor("\n## ") },
        { icon: List, label: "Liste", action: () => insertAtCursor("\n- ") },
        { icon: ListOrdered, label: "Liste numérotée", action: () => insertAtCursor("\n1. ") },
        { icon: Quote, label: "Citation", action: () => insertAtCursor("\n> ") },
        { icon: AtSign, label: "Mentionner", action: () => insertAtCursor("@") },
        { icon: Hash, label: "Hashtag", action: () => insertAtCursor("#") },
    ];

    // Keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case "b":
                    e.preventDefault();
                    insertFormat("**", "**");
                    break;
                case "i":
                    e.preventDefault();
                    insertFormat("*", "*");
                    break;
                case "k":
                    e.preventDefault();
                    insertFormat("[", "](url)");
                    break;
            }
        }
    };

    return (
        <div className={cn(
            "rounded-xl border transition-all duration-200",
            isFocused
                ? "border-orange-500/50 ring-2 ring-orange-500/20 bg-white dark:bg-zinc-900"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50",
            disabled && "opacity-50 pointer-events-none"
        )}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-1.5 md:p-2 border-b border-zinc-100 dark:border-zinc-800">
                <TooltipProvider delayDuration={200}>
                    {toolbarButtons.map((btn, i) => (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={btn.action}
                                    className={cn(
                                        "p-1.5 rounded-md transition-colors text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
                                        "dark:hover:text-white dark:hover:bg-zinc-800",
                                        btn.isActive && "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                    )}
                                >
                                    <btn.icon size={14} className="md:w-4 md:h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {btn.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>

                {/* Format selector - hidden on very small screens */}
                <div className="hidden sm:flex ml-auto items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-700">
                    {["TEXT", "MARKDOWN"].map((format) => (
                        <button
                            key={format}
                            onClick={() => onFormatChange?.(format as "TEXT" | "MARKDOWN")}
                            className={cn(
                                "px-2 py-1 text-[10px] font-medium rounded-md transition-colors",
                                contentFormat === format
                                    ? "bg-orange-500 text-white"
                                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            {format}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor area */}
            <textarea
                id="rich-editor"
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "w-full resize-none bg-transparent px-4 py-3",
                    "text-[15px] leading-relaxed",
                    "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                    "focus:outline-none",
                    "scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700"
                )}
                style={{ minHeight, maxHeight }}
            />

            {/* Footer with character count */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                <span>
                    Markdown activé • Ctrl+B pour <strong>gras</strong>, Ctrl+I pour <em>italique</em>
                </span>
                <span className={cn(
                    value.length > 1000 && "text-orange-500",
                    value.length > 2000 && "text-red-500"
                )}>
                    {value.length} caractères
                </span>
            </div>
        </div>
    );
}

// --- Markdown Preview Component ---
export function MarkdownPreview({ content }: { content: string }) {
    // Simple markdown to HTML conversion
    const parseMarkdown = (text: string): string => {
        return text
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Strikethrough
            .replace(/~~(.*?)~~/gim, '<del class="text-zinc-500">$1</del>')
            // Code inline
            .replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono">$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-orange-500 hover:underline" target="_blank" rel="noopener">$1</a>')
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-orange-500 pl-4 italic text-zinc-600 dark:text-zinc-400 my-2">$1</blockquote>')
            // List items
            .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
            // Line breaks
            .replace(/\n/gim, '<br />');
    };

    return (
        <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
        />
    );
}

