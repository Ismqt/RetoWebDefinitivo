export interface MedicalAppointment {
  id_Cita: number;
  NombrePaciente: string;
  Fecha: string;
  Hora: string;
  NombreVacuna: string;
  DosisLimite: number;
  id_Vacuna: number;
  NombreCentro: string;
  EstadoCita: string;
  id_EstadoCita: number;
  RequiereTutor: boolean;
  EdadPaciente?: number;
  TelefonoPaciente?: string;
  EmailPaciente?: string;
  DosisAplicadas?: number;
  id_UsuarioRegistraCita: number;
  id_Nino?: number;
  TieneHistorial?: number;
}
