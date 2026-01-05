import { jsPDF } from "jspdf";

export const generateDocument = (type: string, data: any): Blob => {
    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();

    // Helper for header
    const addHeader = (title: string) => {
        doc.setFillColor(20, 20, 20);
        doc.rect(0, 0, width, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text(title, 20, 25);
        doc.setFontSize(10);
        doc.text("Document Certifié - Transpareo Secure Storage", 20, 35);
        doc.setTextColor(0, 0, 0);
    };

    if (type === 'Identité') {
        addHeader("CARTE NATIONALE D'IDENTITÉ");
        doc.setFontSize(12);
        doc.text(`Nom : ${data.tenantName.split(' ')[1] || 'DOE'}`, 20, 60);
        doc.text(`Prénom : ${data.tenantName.split(' ')[0] || 'John'}`, 20, 70);
        doc.text(`Né(e) le : 12/05/1990 à PARIS (75)`, 20, 80);
        doc.text(`Sexe : M`, 20, 90);

        // Mock visual ID card
        doc.setDrawColor(200);
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(20, 110, 80, 50, 3, 3, 'FD');
        doc.text("[PHOTO]", 45, 135);
        doc.text("ID: 9820938209382", 20, 170);
    }
    else if (type === 'Emploi') {
        addHeader("CONTRAT DE TRAVAIL");
        doc.setFontSize(12);
        doc.text("ENTRE LES SOUSSIGNÉS :", 20, 60);
        doc.setFont("helvetica", "bold");
        doc.text("Société TECH SOLUTIONS SAS", 20, 70);
        doc.setFont("helvetica", "normal");
        doc.text("Et", 20, 80);
        doc.setFont("helvetica", "bold");
        doc.text(`M. ${data.tenantName}`, 20, 90);

        doc.setFont("helvetica", "normal");
        doc.text("Il a été convenu ce qui suit :", 20, 110);
        doc.text(`M. ${data.tenantName} est engagé en qualité de ${data.jobType}`, 20, 120);
        doc.text("Type de contrat : CDI (Durée Indéterminée)", 20, 130);
        doc.text(`Rémunération mensuelle brute : ${(data.income * 1.3).toFixed(2)} €`, 20, 140);
        doc.text("Date de début : 01/01/2023", 20, 150);

        doc.text("Fait à Paris, le 15 Décembre 2022", 120, 200);
    }
    else if (type === 'Revenus') {
        addHeader("BULLETIN DE PAIE");
        doc.setFontSize(10);
        doc.text("Période : Décembre 2024", 20, 50);

        // Table Header
        doc.setFillColor(230);
        doc.rect(20, 60, 170, 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.text("Libellé", 25, 66);
        doc.text("Base", 100, 66);
        doc.text("Taux", 130, 66);
        doc.text("Montant", 160, 66);

        // Rows
        doc.setFont("helvetica", "normal");
        let y = 80;
        doc.text("Salaire de base", 25, y); doc.text("151.67", 100, y); doc.text("25.00", 130, y); doc.text(`${(data.income).toFixed(2)}`, 160, y);
        y += 10;
        doc.text("Prime d'ancienneté", 25, y); doc.text("-", 100, y); doc.text("-", 130, y); doc.text("150.00", 160, y);
        y += 10;
        doc.text("Heures supplémentaires", 25, y); doc.text("4.00", 100, y); doc.text("37.50", 130, y); doc.text("150.00", 160, y);

        y += 20;
        doc.setFont("helvetica", "bold");
        doc.text("NET À PAYER", 120, y);
        doc.setFontSize(14);
        doc.text(`${(data.income + 300).toFixed(2)} €`, 160, y);
    }
    else if (type === 'Fiscal') {
        addHeader("AVIS D'IMPÔT 2024");
        doc.setFontSize(10);
        doc.text("Direction Générale des Finances Publiques", 20, 60);
        doc.setFontSize(12);
        doc.text(`Déclarant 1 : ${data.tenantName}`, 20, 80);

        doc.rect(20, 100, 170, 40);
        doc.text("Revenu fiscal de référence :", 30, 115);
        doc.setFont("helvetica", "bold");
        doc.text(`${(data.income * 12).toFixed(0)} €`, 150, 115);

        doc.setFont("helvetica", "normal");
        doc.text("Impôt sur le revenu net :", 30, 130);
        doc.setFont("helvetica", "bold");
        doc.text(`${(data.income * 1.5).toFixed(0)} €`, 150, 130);
    }
    else {
        addHeader(type.toUpperCase());
        doc.text("Document certifié conforme.", 20, 60);
    }

    // Watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.text("COPIE", 60, 150, { angle: 45 });

    return doc.output('blob');
};

export const generateFullDossier = (data: any): Blob => {
    // For Full Dossier, we'd ideally merge PDFs or create a multi-page PDF.
    // Simplifying: generate a summary page + key docs on subsequent pages.
    const doc = new jsPDF();

    // Page 1: Summary
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255);
    doc.setFontSize(30);
    doc.text(`DOSSIER LOCATAIRE`, 105, 100, { align: 'center' });
    doc.setFontSize(16);
    doc.text(data.tenantName, 105, 120, { align: 'center' });
    doc.text(`Ref: LOC-${new Date().getFullYear()}-001`, 105, 130, { align: 'center' });

    // Page 2: ID
    doc.addPage();
    doc.setTextColor(0);
    doc.text("Pièce d'Identité", 20, 20);
    // ... add content similar to above ...

    // Page 3: Income
    doc.addPage();
    doc.text("Justificatifs de Revenus", 20, 20);

    return doc.output('blob');
}
