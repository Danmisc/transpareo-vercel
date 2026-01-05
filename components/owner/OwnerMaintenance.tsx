"use client";

import { MaintenanceCockpit } from "./maintenance/MaintenanceCockpit";

export function OwnerMaintenance() {
    return (
        <div className="h-[calc(100vh-120px)]">
            <MaintenanceCockpit />
        </div>
    );
}
