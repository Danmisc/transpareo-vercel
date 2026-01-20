"use client";

import { useState } from "react";
import { Code, Copy, Check, X, ChevronDown, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockInputProps {
    value?: {
        language: string;
        code: string;
        filename?: string;
    };
    onChange: (value: { language: string; code: string; filename?: string }) => void;
    onRemove?: () => void;
}

const LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "scss", label: "SCSS" },
    { value: "sql", label: "SQL" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
    { value: "bash", label: "Bash" },
    { value: "shell", label: "Shell" },
    { value: "dockerfile", label: "Dockerfile" },
    { value: "text", label: "Plain Text" },
];

export function CodeBlockInput({ value, onChange, onRemove }: CodeBlockInputProps) {
    const [language, setLanguage] = useState(value?.language || "javascript");
    const [code, setCode] = useState(value?.code || "");
    const [filename, setFilename] = useState(value?.filename || "");
    const [showLanguageSelect, setShowLanguageSelect] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleChange = (updates: Partial<{ language: string; code: string; filename?: string }>) => {
        const newValue = {
            language: updates.language ?? language,
            code: updates.code ?? code,
            filename: updates.filename ?? filename,
        };

        if (updates.language !== undefined) setLanguage(updates.language);
        if (updates.code !== undefined) setCode(updates.code);
        if (updates.filename !== undefined) setFilename(updates.filename);

        onChange(newValue);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-[#1e1e1e]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 md:px-3 py-2 bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                    <Code size={14} className="text-zinc-400" />

                    {/* Language selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-700 hover:bg-zinc-600 text-xs text-zinc-200 transition-colors"
                        >
                            {LANGUAGES.find(l => l.value === language)?.label || language}
                            <ChevronDown size={12} />
                        </button>

                        {showLanguageSelect && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowLanguageSelect(false)}
                                />
                                <div className="absolute top-full left-0 mt-1 z-20 w-40 max-h-60 overflow-y-auto rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl py-1">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.value}
                                            onClick={() => {
                                                handleChange({ language: lang.value });
                                                setShowLanguageSelect(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition-colors",
                                                language === lang.value ? "text-orange-400" : "text-zinc-300"
                                            )}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Filename input */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-700/50">
                        <File size={12} className="text-zinc-500" />
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => handleChange({ filename: e.target.value })}
                            placeholder="filename.js"
                            className="bg-transparent text-xs text-zinc-300 placeholder:text-zinc-500 w-24 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Preview toggle */}
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={cn(
                            "px-2 py-1 rounded-md text-xs transition-colors",
                            showPreview
                                ? "bg-orange-500/20 text-orange-400"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                        )}
                    >
                        {showPreview ? "Éditer" : "Aperçu"}
                    </button>

                    {/* Copy button */}
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                        title="Copier"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>

                    {/* Remove button */}
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
                            title="Supprimer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Code area */}
            {showPreview ? (
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.8rem',
                        background: '#1e1e1e',
                        minHeight: '150px'
                    }}
                    showLineNumbers
                    wrapLongLines
                >
                    {code || "// Votre code ici..."}
                </SyntaxHighlighter>
            ) : (
                <textarea
                    value={code}
                    onChange={(e) => handleChange({ code: e.target.value })}
                    placeholder="// Écrivez ou collez votre code ici..."
                    className="w-full min-h-[120px] md:min-h-[150px] p-3 md:p-4 bg-transparent text-zinc-100 font-mono text-xs md:text-sm resize-none focus:outline-none placeholder:text-zinc-600"
                    spellCheck={false}
                />
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800/50 border-t border-zinc-700/50 text-[10px] text-zinc-500">
                <span>{code.split('\n').length} lignes</span>
                <span>{code.length} caractères</span>
            </div>
        </div>
    );
}

// --- Display-only Code Block (for PostCard) ---
interface CodeBlockDisplayProps {
    language: string;
    code: string;
    filename?: string;
}

export function CodeBlockDisplay({ language, code, filename }: CodeBlockDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg overflow-hidden my-3 border border-zinc-700/50">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-zinc-400 font-mono">
                        {language || 'text'}
                    </span>
                    {filename && (
                        <>
                            <span className="text-zinc-600">•</span>
                            <span className="text-[10px] text-zinc-400">{filename}</span>
                        </>
                    )}
                </div>
                <button
                    onClick={handleCopy}
                    className="text-zinc-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '0.75rem',
                    background: '#18181b',
                    maxHeight: '300px',
                    overflow: 'auto'
                }}
                wrapLongLines
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

