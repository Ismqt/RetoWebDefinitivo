'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import useApi from '@/hooks/use-api';
import { Loader2, User, ShieldCheck, ShieldAlert, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaces
interface ChildProfile {
    id_Nino: number;
    Nombres: string;
    Apellidos: string;
    FechaNacimiento: string;
    Genero: string;
}

interface VaccinationScheduleEntry {
    id_Vacuna: number;
    NombreVacuna: string;
    DosisPorAplicar: number;
    FechaSugerida: string;
    Estado: 'Vencida' | 'Proxima' | 'Pendiente';
    Criterio: string;
}

// Helper to get badge color based on status
const getStatusBadgeVariant = (status: VaccinationScheduleEntry['Estado']) => {
    switch (status) {
        case 'Vencida':
            return 'destructive';
        case 'Proxima':
            return 'secondary';
        default:
            return 'outline';
    }
};

// Helper to get icon based on status
const getStatusIcon = (status: VaccinationScheduleEntry['Estado']) => {
    switch (status) {
        case 'Vencida':
            return <ShieldAlert className="h-5 w-5 text-red-500" />;
        case 'Proxima':
            return <ShieldCheck className="h-5 w-5 text-yellow-500" />;
        default:
            return <Shield className="h-5 w-5 text-gray-500" />;
    }
};

export default function ChildProfilePage() {
    const params = useParams();
    const childId = params.id as string;
    
    const { data: childProfile, loading: loadingProfile, error: errorProfile, request: fetchProfile } = useApi<ChildProfile>();
    const { data: schedule, loading: loadingSchedule, error: errorSchedule, request: fetchSchedule } = useApi<VaccinationScheduleEntry[]>();

    useEffect(() => {
        if (childId) {
            fetchProfile(`/api/ninos/${childId}`);
            fetchSchedule(`/api/ninos/${childId}/vaccination-schedule`);
        }
    }, [childId, fetchProfile, fetchSchedule]);

    if (loadingProfile || loadingSchedule) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-xl">Cargando perfil del niño...</p>
            </div>
        );
    }

    if (errorProfile || !childProfile) {
        return <div className="text-center py-10">No se pudo cargar el perfil del niño. Por favor, inténtelo de nuevo.</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <User className="h-12 w-12 text-primary" />
                        <div>
                            <CardTitle className="text-3xl">{childProfile.Nombres} {childProfile.Apellidos}</CardTitle>
                            <CardDescription>
                                Nacido/a el: {format(new Date(childProfile.FechaNacimiento), 'dd MMMM yyyy', { locale: es })}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Esquema de Vacunación</CardTitle>
                    <CardDescription>Resumen de vacunas pendientes, próximas y vencidas para {childProfile.Nombres}.</CardDescription>
                </CardHeader>
                <CardContent>
                    {errorSchedule ? (
                        <div className="text-center py-10 text-red-500">No se pudo cargar el esquema de vacunación.</div>
                    ) : schedule && schedule.length > 0 ? (
                        <div className="space-y-6">
                            {/* Next Appointment Call to Action */}
                            <Alert className="bg-blue-50 border-blue-200">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                                <AlertTitle className="text-blue-800 font-bold">¡Próxima Vacuna!</AlertTitle>
                                <AlertDescription className="text-blue-700">
                                    La siguiente vacuna recomendada es <strong>{schedule[0].NombreVacuna} (Dosis {schedule[0].DosisPorAplicar})</strong> para el
                                    <strong> {format(new Date(schedule[0].FechaSugerida), 'dd/MM/yyyy')}</strong>.
                                    <Button asChild size="sm" className="mt-3 w-full md:w-auto">
                                        <Link href={`/appointments/new?childId=${childId}&vaccineId=${schedule[0].id_Vacuna}`}>
                                            Agendar Cita Ahora <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </AlertDescription>
                            </Alert>

                            {/* Full Schedule List */}
                            <div className="space-y-4 pt-4">
                                {schedule.map((item) => (
                                    <div key={`${item.id_Vacuna}-${item.DosisPorAplicar}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            {getStatusIcon(item.Estado)}
                                            <div>
                                                <p className="font-semibold">{item.NombreVacuna} (Dosis {item.DosisPorAplicar})</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Fecha sugerida: {format(new Date(item.FechaSugerida), 'dd/MM/yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(item.Estado)}>{item.Estado}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-green-500" />
                            <p>¡Felicidades! El esquema de vacunación de {childProfile.Nombres} está completo.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
