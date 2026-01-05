"use client";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
    language: string;
    value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-md overflow-hidden my-2 border border-zinc-700/50">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
                <span className="text-[10px] uppercase text-zinc-400 font-mono">{language || 'text'}</span>
                <button
                    onClick={handleCopy}
                    className="text-zinc-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1rem', fontSize: '0.8rem', background: '#18181b' }} // zinc-900
                wrapLongLines={true}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
}
