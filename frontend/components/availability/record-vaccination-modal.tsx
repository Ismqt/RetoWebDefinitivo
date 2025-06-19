"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useApi from "@/hooks/use-api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Zod schema for form validation
const formSchema = z.object({
  id_LoteAplicado: z.coerce.number().positive({ message: "Debe seleccionar un lote de vacuna." }),
  NombreCompletoPersonalAplicado: z.string().min(3, { message: "El nombre del personal es requerido." }),
  DosisAplicada: z.string().min(1, { message: "La dosis es requerida." }),
  EdadAlMomento: z.string().min(1, { message: "La edad es requerida." }),
  NotasAdicionales: z.string().optional(),
  Alergias: z.string().optional(),
});

interface VaccineLot {
  id_LoteVacuna: number;
  NumeroLote: string;
  NombreVacuna: string;
}

interface RecordVaccinationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
  onFormSubmit: () => void;
}

export const RecordVaccinationModal = ({ open, onOpenChange, appointment, onFormSubmit }: RecordVaccinationModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { request: submitForm, loading: isSubmitting } = useApi();
  const { request: fetchLots, loading: isLoadingLots } = useApi();
  const [lots, setLots] = useState<VaccineLot[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      NombreCompletoPersonalAplicado: user?.name || "",
      DosisAplicada: "1ra Dosis",
      EdadAlMomento: "", // This could be pre-calculated
      NotasAdicionales: "",
      Alergias: "Ninguna conocida",
    },
  });

  useEffect(() => {
    const loadLots = async () => {
      try {
        const data = await fetchLots('/api/vaccine-lots/active');
        setLots(data || []);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error al cargar lotes de vacunas' });
      }
    };
    if (open) {
      loadLots();
    }
  }, [open, fetchLots, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!appointment || !user) return;

    const payload = {
        ...values,
        id_PersonalSalud_Usuario: user.id,
    };

    try {
      await submitForm(`/api/appointments/${appointment.id_Cita}/record`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({ title: "Vacunación Registrada", description: "La vacunación ha sido registrada exitosamente." });
      onFormSubmit();
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al registrar la vacunación", description: error.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Vacunación</DialogTitle>
          <DialogDescription>Paciente: {appointment?.NombrePaciente}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id_LoteAplicado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lote de Vacuna</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} disabled={isLoadingLots}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un lote..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {lots.map(lot => <SelectItem key={lot.id_LoteVacuna} value={String(lot.id_LoteVacuna)}>{lot.NombreVacuna} - {lot.NumeroLote}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="DosisAplicada" render={({ field }) => (<FormItem><FormLabel>Dosis Aplicada</FormLabel><FormControl><Input placeholder="Ej: 1ra Dosis, Refuerzo" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="EdadAlMomento" render={({ field }) => (<FormItem><FormLabel>Edad del Paciente al Momento</FormLabel><FormControl><Input placeholder="Ej: 2 años, 5 meses" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="NombreCompletoPersonalAplicado" render={({ field }) => (<FormItem><FormLabel>Personal que Aplica</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="NotasAdicionales" render={({ field }) => (<FormItem><FormLabel>Notas Adicionales</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="Alergias" render={({ field }) => (<FormItem><FormLabel>Alergias Conocidas</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
