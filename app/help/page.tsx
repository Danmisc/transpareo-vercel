import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function HelpPage() {
    return (
        <InfoPageLayout
            title="Centre d'Aide"
            subtitle="Une question ? Nous avons probablement la réponse."
        >
            <div className="not-prose">
                <Accordion type="single" collapsible className="w-full mb-10">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="font-bold text-lg">Comment certifier mon dossier ?</AccordionTrigger>
                        <AccordionContent className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Pour certifier votre dossier, rendez-vous dans la section "Mon Dossier" du menu.
                            Téléchargez vos pièces justificatives (identié, revenus, garants).
                            Notre système de vérification (Watermarking Service) analysera et protégera vos documents automatiquement.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="font-bold text-lg">Est-ce que Transpareo est gratuit ?</AccordionTrigger>
                        <AccordionContent className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            <strong>Oui, pour les locataires !</strong> La création de compte, le dossier numérique et la recherche sont 100% gratuits.
                            Nous proposons des options "Premium" pour les propriétaires et les agences souhaitant une visibilité accrue.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="font-bold text-lg">Comment contacter un propriétaire ?</AccordionTrigger>
                        <AccordionContent className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Une fois connecté, allez sur une annonce et cliquez sur "Contacter".
                            Vous pourrez envoyer un message direct ou partager votre dossier en un clic ("One-Click Apply").
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger className="font-bold text-lg">Mes données sont-elles sécurisées ?</AccordionTrigger>
                        <AccordionContent className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Absolument. Nous utilisons un chiffrement de niveau bancaire pour votre coffre-fort numérique.
                            Vous gardez le contrôle total : vous pouvez révoquer l'accès à vos documents à tout moment via le "Kill Switch".
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 text-center border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold mb-2">Vous ne trouvez pas votre réponse ?</h3>
                    <p className="text-zinc-500 mb-6 text-sm">Notre équipe support est disponible du lundi au vendredi.</p>
                    <Button>
                        <Mail className="w-4 h-4 mr-2" />
                        Contacter le Support
                    </Button>
                </div>
            </div>
        </InfoPageLayout>
    );
}
