"use client";
import { Calendar, Clock, UserCheck, Stethoscope, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { combineDateTime, formatDisplayDate, formatTimeString, formatDateString } from "@/utils/format-time";

export interface Appointment {
  id_Cita: number;
  NombrePaciente: string;
  Fecha: string;
  Hora: string;
  NombreVacuna: string;
  NombreCentro: string;
  EstadoCita: string;
  id_EstadoCita?: number;
  RequiereTutor: boolean;
  NombreCompletoPersonalAplicado: string | null;
  id_PersonalSalud: number | null;
  NombrePersonalSalud: string | null;
}

type Variant = "list" | "detail";
interface Props {
  appointment: Appointment;
  className?: string;
  variant?: Variant;
}

export default function AppointmentCard({ appointment, className, variant = "list" }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-6",
        variant === "detail" ? "space-y-4" : "flex items-center justify-between p-4",
        className
      )}
    >
      <div className="space-y-1 flex-1">
        {/* Title & badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium">{appointment.NombreVacuna}</p>
          {variant === "list" && appointment.RequiereTutor && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
              👶 Niño
            </span>
          )}
          {variant === "list" && appointment.EstadoCita === "Confirmada" && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
              <UserCheck className="h-3 w-3" /> Confirmada
            </span>
          )}
        </div>

        {/* Fecha / hora / centro */}
        <div className="flex items-center text-sm text-muted-foreground gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDateString(appointment.Fecha)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTimeString(appointment.Hora)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{appointment.NombreCentro}</p>
        <p className="text-sm font-medium text-gray-700">
          Paciente: {appointment.NombrePaciente}
        </p>

        {/* Médico asignado / pendiente */}
        {(appointment.NombreCompletoPersonalAplicado || appointment.NombrePersonalSalud) && (
          <div className="flex items-center text-sm text-green-700 bg-green-50 px-2 py-1 rounded-md mt-2 w-max">
            <Stethoscope className="mr-1 h-4 w-4" />
            <span className="font-medium">Dr(a). {appointment.NombreCompletoPersonalAplicado || appointment.NombrePersonalSalud}</span>
          </div>
        )}
        {appointment.EstadoCita === "Confirmada" && !(appointment.NombreCompletoPersonalAplicado || appointment.NombrePersonalSalud) && (
          <div className="flex items-center text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded-md mt-2 w-max">
            <AlertCircle className="mr-1 h-4 w-4" />
            <span>Confirmada - Médico por asignar</span>
          </div>
        )}
      </div>

      {variant === "list" && (
        <div className="flex items-center gap-2 ml-4">
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            appointment.EstadoCita === "Confirmada"
              ? "bg-green-100 text-green-800"
              : appointment.EstadoCita === "Agendada"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-primary/10 text-primary"
          )}
        >
          {appointment.EstadoCita}
        </span>
        <Link
          href={`/dashboard/appointments/${appointment.id_Cita}`}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          Ver Detalles
        </Link>
        </div>
      )}
      {variant === "detail" && (
      <div className="flex justify-end gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            appointment.EstadoCita === "Confirmada"
              ? "bg-green-100 text-green-800"
              : appointment.EstadoCita === "Agendada"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-primary/10 text-primary"
          )}
        >
          {appointment.EstadoCita}
        </span>
      </div>
    )}
  </div>
  );
}
