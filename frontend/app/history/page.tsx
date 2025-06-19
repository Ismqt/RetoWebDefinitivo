"use client";

import TutorHistoryTab from "@/components/children/tutor-history-tab";

export default function HistoryPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Historial de Vacunación</h1>
      <TutorHistoryTab />
    </div>
  );
}
