import { Suspense } from "react";
import { ReviewCreationWizard } from "@/components/marketplace/reviews/ReviewCreationWizard";

export default function CreateReviewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <ReviewCreationWizard />
        </Suspense>
    );
}
