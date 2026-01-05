"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface BankStatementButtonProps {
    holderName: string;
    iban: string;
    bic: string;
    balance: number;
}

export function BankStatementButton({ holderName, iban, bic, balance }: BankStatementButtonProps) {

    const generatePDF = () => {
        const doc = new jsPDF();

        // --- Header ---
        doc.setFillColor(255, 102, 0); // Orange Brand Color
        doc.rect(0, 0, 210, 40, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Transpareo Bank", 20, 25);

        doc.setFontSize(10);
        doc.text("Relevé d'Identité Bancaire & Situation", 20, 32);

        // --- Client Info ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Titulaire du compte:", 20, 60);
        doc.setFont("helvetica", "normal");
        doc.text(holderName, 70, 60);

        doc.setFont("helvetica", "bold");
        doc.text("Date d'édition:", 20, 70);
        doc.setFont("helvetica", "normal");
        doc.text(new Date().toLocaleDateString("fr-FR"), 70, 70);

        // --- Account Details Box ---
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(20, 85, 170, 50, 3, 3, "FD");

        doc.setFontSize(11);
        doc.text("IBAN (International Bank Account Number)", 30, 95);
        doc.setFont("courier", "bold");
        doc.setFontSize(14);
        doc.text(iban, 30, 105);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("Code BIC / SWIFT", 30, 120);
        doc.setFont("courier", "bold");
        doc.text(bic, 30, 128);

        // --- Balance ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Solde Actuel:", 130, 128);
        doc.setTextColor(0, 128, 0); // Green
        doc.text(`${balance.toFixed(2)} €`, 170, 128, { align: "right" });

        // --- Footer ---
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Ce document est certifié conforme par Transpareo Financial Services.", 105, 280, { align: "center" });
        doc.text("Transpareo Bank - Agrément ACPR N°12345 - 12 Rue de la Bourse, 75002 Paris", 105, 285, { align: "center" });

        // Save
        doc.save(`Releve_Bancaire_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("Document téléchargé");
    };

    return (
        <Button
            variant="outline"
            onClick={generatePDF}
            className="w-full justify-start gap-2 h-12 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:border-zinc-700"
        >
            <FileText size={18} className="text-zinc-500" />
            <span className="text-zinc-700 dark:text-zinc-300">Télécharger RIB (PDF)</span>
            <Download size={14} className="ml-auto text-zinc-400" />
        </Button>
    );
}
