import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

export default function PrivacyPage() {
    return (
        <InfoPageLayout
            title="Politique de Confidentialité"
            subtitle="Vos données, vos règles. Nous prenons votre vie privée très au sérieux."
        >
            <h3>1. Collecte des Données</h3>
            <p>
                Nous collectons uniquement les données nécessaires au bon fonctionnement du service : informations de profil,
                documents justificatifs pour le dossier locatif, et données de navigation pour améliorer l'expérience.
            </p>

            <h3>2. Utilisation des Données</h3>
            <p>
                Vos documents (payslips, avis d'imposition) sont chiffrés et stockés dans un environnement sécurisé ("Coffre-fort").
                Ils ne sont jamais vendus à des tiers. Ils sont partagés uniquement avec les propriétaires ou agences auxquels vous donnez explicitement accès.
            </p>

            <h3>3. Vos Droits (RGPD)</h3>
            <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                Vous pouvez exercer ce droit directement depuis votre espace "Paramètres" ou en contactant notre DPO.
            </p>

            <h3>4. Cookies</h3>
            <p>
                Nous utilisons des cookies pour maintenir votre session active et mémoriser vos préférences.
                Aucun cookie publicitaire tiers intrusif n'est utilisé sur la plateforme.
            </p>

            <h3>5. Sécurité</h3>
            <p>
                Toutes les communications sont chiffrées (HTTPS). Les documents sensibles bénéficient d'un chiffrement au repos (AES-256).
            </p>
        </InfoPageLayout>
    );
}

