"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useApi from "@/hooks/use-api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Zod schema for form validation
const formSchema = z.object({
  id_CentroVacunacion: z.coerce.number().positive({ message: "Debe seleccionar un centro de vacunación." }),
  Fecha: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "La fecha no es válida." }),
  HoraInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato de hora inválido (HH:MM)." }),
  HoraFin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato de hora inválido (HH:MM)." }),
  CuposTotales: z.coerce.number().int().positive({ message: "Los cupos deben ser un número positivo." }),
});

interface VaccinationCenter {
    id_CentroVacunacion: number;
    Nombre: string;
}

export const AvailabilityForm = ({ onFormSubmit }: { onFormSubmit: () => void }) => {
  const { toast } = useToast();
  const { request: submitForm, loading: isSubmitting } = useApi();
  const { request: fetchCenters } = useApi();
  const [centers, setCenters] = useState<VaccinationCenter[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id_CentroVacunacion: 0,
        Fecha: new Date().toISOString().split('T')[0],
        HoraInicio: "08:00",
        HoraFin: "17:00",
        CuposTotales: 50,
    },
  });

  useEffect(() => {
    const loadCenters = async () => {
        try {
            const data = await fetchCenters('/api/vaccination-centers');
            setCenters(data || []);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error al cargar centros de vacunación' });
        }
    };
    loadCenters();
  }, [fetchCenters, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await submitForm("/api/availability", {
        method: "POST",
        body: values,
      });
      toast({ title: "Disponibilidad creada", description: "El nuevo horario ha sido guardado exitosamente." });
      form.reset();
      onFormSubmit(); // Callback to refresh data in parent component
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al crear disponibilidad", description: error.message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md">
        <FormField
          control={form.control}
          name="id_CentroVacunacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Centro de Vacunación</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Seleccione un centro" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {centers.map(c => <SelectItem key={c.id_CentroVacunacion} value={String(c.id_CentroVacunacion)}>{c.Nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="Fecha" render={({ field }) => (<FormItem><FormLabel>Fecha</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="CuposTotales" render={({ field }) => (<FormItem><FormLabel>Cupos Totales</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="HoraInicio" render={({ field }) => (<FormItem><FormLabel>Hora de Inicio</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="HoraFin" render={({ field }) => (<FormItem><FormLabel>Hora de Fin</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
          Agregar Disponibilidad
        </Button>
      </form>
    </Form>
  );
};
