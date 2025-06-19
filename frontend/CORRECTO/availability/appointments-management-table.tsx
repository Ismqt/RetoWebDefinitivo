"use client"

import { useEffect, useState, useCallback } from "react";
import useApi from "@/hooks/use-api";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Syringe } from "lucide-react";

// We will create this component in the next step
import { RecordVaccinationModal } from "./record-vaccination-modal";

interface Appointment {
  id_Cita: number;
  NombreNino: string;
  Fecha: string;
  Hora: string;
  NombreCentro: string;
  Estado: string;
}

export const AppointmentsManagementTable = ({ onDataRefresh }: { onDataRefresh: () => void }) => {
  const { toast } = useToast();
  const { request: fetchAppointments, loading } = useApi();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await fetchAppointments('/appointments');
      setAppointments(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al cargar las citas' });
    }
  }, [fetchAppointments, toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleRecordVaccination = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    loadAppointments(); // Refresh data after modal closes
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="p-4 border rounded-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Citas Agendadas</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Fecha y Hora</TableHead>
            <TableHead>Centro</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.filter(a => ['Agendada', 'Confirmada'].includes(a.Estado)).map((appointment) => (
            <TableRow key={appointment.id_Cita}>
              <TableCell>{appointment.NombreNino}</TableCell>
              <TableCell>{new Date(appointment.Fecha).toLocaleDateString()} {appointment.Hora}</TableCell>
              <TableCell>{appointment.NombreCentro}</TableCell>
              <TableCell>{appointment.Estado}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecordVaccination(appointment)}
                >
                  <Syringe className="mr-2 h-4 w-4" />
                  Registrar Vacunación
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* The modal will be rendered here. We will create it in the next step. */}
      {selectedAppointment && (
        <RecordVaccinationModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          appointment={selectedAppointment}
          onFormSubmit={handleModalClose}
        />
      )}
    </div>
  );
};
