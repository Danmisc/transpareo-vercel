import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

export default function TermsPage() {
    return (
        <InfoPageLayout
            title="Conditions Générales d'Utilisation"
            subtitle="Les règles du jeu pour une communauté saine et respectueuse."
        >
            <h3>1. Acceptation des CGU</h3>
            <p>
                En accédant à Transpareo, vous acceptez sans réserve les présentes conditions générales d'utilisation.
                Si vous n'êtes pas d'accord avec l'une de ces conditions, nous vous invitons à ne pas utiliser nos services.
            </p>

            <h3>2. Compte Utilisateur</h3>
            <p>
                Vous êtes responsable de maintenir la confidentialité de votre mot de passe.
                Toute action effectuée depuis votre compte est réputée être effectuée par vous.
                Les faux profils ou usurpations d'identité entraîneront une suspension immédiate.
            </p>

            <h3>3. Règles de Bonne Conduite</h3>
            <p>
                Transpareo est un espace communautaire. Les comportements suivants sont interdits :
            </p>
            <ul>
                <li>Discrimination, haine raciale, harcèlement.</li>
                <li>Publication de fausses annonces immobilières.</li>
                <li>Spam ou démarchage commercial non sollicité.</li>
            </ul>

            <h3>4. Responsabilité</h3>
            <p>
                Transpareo agit en tant qu'hébergeur de contenu. Nous ne pouvons être tenus responsables de la véracité
                des annonces publiées par les utilisateurs, bien que nous mettions tout en œuvre pour modérer la plateforme.
            </p>

            <h3>5. Modification des Services</h3>
            <p>
                Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment pour maintenance ou amélioration.
            </p>
        </InfoPageLayout>
    );
}

