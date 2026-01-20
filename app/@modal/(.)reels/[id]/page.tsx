import { ReelsViewer } from "@/components/reels/ReelsViewer";


export default function ReelModal({ params }: { params: { id: string } }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            {/* This is a bespoke "Instagram" modal, so we just overlay the viewer */}
            <div className="w-full h-full md:w-full md:h-full relative">
                <ReelsViewer initialReelId={params.id} isModal={true} />
            </div>
        </div>
    );
}
