"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import useApi from "@/hooks/use-api";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { PatientHistoryView } from "@/components/medical/patient-history-view";
import type { EnhancedChild } from "./child-card-enhanced";

export default function TutorHistoryTab() {
  const { user } = useAuth();
  const { request: fetchChildren, loading: loadingChildren } = useApi<EnhancedChild[]>();

  const [children, setChildren] = useState<EnhancedChild[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchChildren(`/api/ninos/tutor/${user.id}/detailed`).then((data) => {
        setChildren(data || []);
      });
    }
  }, [user?.id, fetchChildren]);

  const handleShowHistory = () => {
    if (selectedValue) {
      setShowHistory(true);
    }
  };

  if (!user) {
    return null;
  }

  if (loadingChildren) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const childOptions = children.map((c) => ({
    value: c.id_Nino.toString(),
    label: `${c.Nombres} ${c.Apellidos}`,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Paciente</CardTitle>
          <CardDescription>
            Elige a quién deseas ver su historial de vacunación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={selectedValue ?? undefined} onValueChange={(val) => setSelectedValue(val)}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Yo</SelectItem>
                {childOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleShowHistory} disabled={!selectedValue}>
              Mostrar Historial
            </Button>
          </div>
        </CardContent>
      </Card>

      {showHistory && selectedValue && (
        <PatientHistoryView
          patientId={user.id}
          childId={selectedValue !== "self" ? Number(selectedValue) : undefined}
        />
      )}
    </div>
  );
}
