"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText, ExternalLink } from "lucide-react";
import { useState } from "react";

interface ReceiptProps {
    data: {
        tenantName: string;
        tenantAddress: string;
        ownerName: string;
        propertyAddress: string;
        period: string;
        paymentDate: string;
        rentAmount: number;
        chargesAmount: number;
        totalAmount: number;
    };
    trigger?: React.ReactNode;
}

export function ReceiptGenerator({ data, trigger }: ReceiptProps) {
    const [open, setOpen] = useState(false);

    const handlePrintNewWindow = () => {
        const myWindow = window.open('', '', 'width=1000,height=1200');
        if (!myWindow) return;

        myWindow.document.write('<html><head><title>Quittance de Loyer - ' + data.period + '</title>');
        // Inject standardized styles for A4
        myWindow.document.write('<style>');
        myWindow.document.write(`
            @media print {
                @page { margin: 0; size: A4; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { 
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                margin: 0; 
                background: #555; 
                display: flex; 
                justify-content: center; 
                padding: 40px;
            }
            .page {
                background: white;
                width: 210mm;
                min-height: 297mm;
                box-shadow: 0 0 15px rgba(0,0,0,0.2);
                padding: 20mm;
                box-sizing: border-box;
                position: relative;
            }
            .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #111; margin: 0; }
            .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
            
            .row { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 30px; }
            .col { flex: 1; }
            
            .box { 
                background: #f8f9fa; 
                border: 1px solid #e9ecef; 
                padding: 20px; 
                border-radius: 4px; 
            }
            .box-title { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #888; margin-bottom: 8px; letter-spacing: 1px; }
            .box-content { font-size: 14px; font-weight: 600; color: #000; line-height: 1.4; }
            
            .body-text { font-size: 13px; line-height: 1.6; color: #333; margin-bottom: 40px; text-align: justify; }
            
            table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; border-bottom: 2px solid #000; padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #555; }
            td { padding: 15px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #111; }
            .total-row td { border-bottom: none; border-top: 2px solid #000; font-weight: bold; font-size: 18px; padding-top: 20px; }
            
            .legal { font-size: 10px; color: #888; margin-top: 60px; line-height: 1.4; border-top: 1px solid #eee; padding-top: 20px; }
            
            .signature-section { display: flex; justify-content: flex-end; margin-top: 40px; }
            .signature-box { border: 1px solid #ddd; padding: 20px 40px; text-align: center; }
            .stamp { color: #ccc; font-size: 24px; font-weight: bold; transform: rotate(-10deg); border: 3px solid #ccc; display: inline-block; padding: 10px; margin-top: 10px; opacity: 0.5; }
        `);
        myWindow.document.write('</style>');
        myWindow.document.write('</head><body>');
        myWindow.document.write('<div class="page">');

        // Header
        myWindow.document.write(`
                <div class="header">
                    <div>
                        <h1 class="title">Quittance de Loyer</h1>
                        <p class="subtitle">Période du ${data.period}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-weight: bold; margin:0;">Transpareo Agency</p>
                        <p style="font-size: 12px; color: #666; margin:0;">Gestion locative certifiée</p>
                    </div>
                </div>
            `);

        // Parties
        myWindow.document.write(`
                <div class="row">
                    <div class="col">
                        <div class="box">
                            <div class="box-title">Bailleur / Propriétaire</div>
                            <div class="box-content">
                                ${data.ownerName}<br/>
                                <span style="font-weight: 400; font-size: 12px; color: #666;">Gestion via Transpareo</span>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="box">
                            <div class="box-title">Locataire</div>
                            <div class="box-content">
                                ${data.tenantName}<br/>
                                <span style="font-weight: 400; font-size: 12px; color: #666;">${data.tenantAddress}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);

        // Info Logement
        myWindow.document.write(`
                <div style="margin-bottom: 30px;">
                    <div class="box-title">Adresse du logement concerné</div>
                    <div style="font-weight: bold; font-size: 14px;">${data.propertyAddress}</div>
                </div>
            `);

        // Text
        myWindow.document.write(`
                <div class="body-text">
                    <p>Je soussigné, <strong>${data.ownerName}</strong>, propriétaire du logement désigné ci-dessus, déclare avoir reçu de <strong>${data.tenantName}</strong>, locataire, la somme de <strong>${data.totalAmount.toFixed(2)} euros</strong>.</p>
                    <p>Cette somme correspond au loyer et aux charges pour la période de <strong>${data.period}</strong>, le paiement ayant été effectué le <strong>${data.paymentDate}</strong>.</p>
                    <p>Cette quittance annule tous les reçus de "à valoir à ce jour" qui auraient pu être donnés pour acompte versé sur le présent terme, même si le paiement a été fait en plusieurs fois.</p>
                </div>
            `);

        // Table
        myWindow.document.write(`
                <table>
                    <thead>
                        <tr>
                            <th>Détail du règlement</th>
                            <th style="text-align: right;">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Loyer Nu</td>
                            <td style="text-align: right;">${data.rentAmount.toFixed(2)} €</td>
                        </tr>
                         <tr>
                            <td>Provision pour charges</td>
                            <td style="text-align: right;">${data.chargesAmount.toFixed(2)} €</td>
                        </tr>
                        <tr class="total-row">
                            <td>Total Payé / Perçu</td>
                            <td style="text-align: right;">${data.totalAmount.toFixed(2)} €</td>
                        </tr>
                    </tbody>
                </table>
            `);

        // Signature
        myWindow.document.write(`
                <div class="signature-section">
                    <div class="signature-box">
                        <div style="font-size: 10px; text-transform: uppercase;">Pour valoir ce que de droit</div>
                        <div style="margin: 20px 0; font-family: 'Courier New', courier, monospace; font-weight: bold;">${data.ownerName}</div>
                        <div style="font-size: 10px; color: #888;">Signature électronique certifiée</div>
                    </div>
                </div>
            `);

        // Legal Footer
        myWindow.document.write(`
                <div class="legal">
                    <p>Conformément à l'article 21 de la loi n° 89-462 du 6 juillet 1989 tendant à améliorer les rapports locatifs : Le bailleur est tenu de transmettre gratuitement une quittance au locataire qui en fait la demande. La quittance porte le détail des sommes versées par le locataire en distinguant le loyer, le droit de bail et les charges.</p>
                    <p>Document généré le ${new Date().toLocaleDateString()} via la plateforme <strong>Transpareo</strong>.</p>
                </div>
            `);

        myWindow.document.write('</div></body></html>'); // End Page/Body/Html
        myWindow.document.close();
        myWindow.focus();
        // setTimeout(() => myWindow.print(), 500); // Small delay to ensure styles load
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="ghost" size="icon"><Printer size={16} /></Button>}
            </DialogTrigger>
            <DialogContent className="max-w-[400px]">
                <div className="text-center py-6">
                    <FileText className="mx-auto text-zinc-300 mb-4" size={48} />
                    <h3 className="font-bold text-lg mb-2">Générer la Quittance</h3>
                    <p className="text-zinc-500 text-sm mb-6">
                        Une quittance conforme (Loi 1989) sera générée dans une nouvelle fenêtre prête à l'impression.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={handlePrintNewWindow} className="w-full bg-zinc-900 text-white gap-2">
                            <ExternalLink size={16} /> Ouvrir et Imprimer
                        </Button>
                        <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
                            Annuler
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


