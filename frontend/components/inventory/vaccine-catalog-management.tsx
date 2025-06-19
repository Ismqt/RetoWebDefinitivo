'use client';

import { useState, useEffect, FormEvent } from 'react';
import useApi from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Interfaces
interface Manufacturer {
    id_Fabricante: number;
    Fabricante: string;
}

interface VaccineCatalogEntry {
    id_Vacuna: number;
    Nombre: string;
    DosisLimite?: number | null;
    Tipo?: string | null;
    Descripcion?: string | null;
    id_Fabricante: number;
    NombreFabricante?: string;
}

interface FormData {
    id_Fabricante: string;
    Nombre: string;
    DosisLimite: string;
    Tipo: string;
    Descripcion: string;
    perteneceAlEsquema: boolean;
    edadRecomendadaMeses: string;
    intervaloMesesSiguienteDosis: string;
    numeroDosisEsquema: string;
    esRefuerzo: boolean;
}

const initialFormData: FormData = {
    id_Fabricante: '',
    Nombre: '',
    DosisLimite: '',
    Tipo: '',
    Descripcion: '',
    perteneceAlEsquema: false,
    edadRecomendadaMeses: '',
    intervaloMesesSiguienteDosis: '',
    numeroDosisEsquema: '',
    esRefuerzo: false,
};

export function VaccineCatalogManagement() {
    const { toast } = useToast();
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [vaccineCatalog, setVaccineCatalog] = useState<VaccineCatalogEntry[]>([]);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // API hooks
    const { request: fetchManufacturers } = useApi<Manufacturer[]>();
    const { request: fetchVaccineCatalog } = useApi<VaccineCatalogEntry[]>();
    const { request: addVaccineRequest, loading: addingVaccine } = useApi<VaccineCatalogEntry>();

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [manufacturersData, catalogData] = await Promise.all([
                fetchManufacturers('/api/manufacturers'),
                fetchVaccineCatalog('/api/vaccine-catalog')
            ]);

            if (manufacturersData && Array.isArray(manufacturersData)) {
                setManufacturers(manufacturersData);
            } else {
                setManufacturers([]);
            }
            
            if (catalogData && Array.isArray(catalogData)) {
                setVaccineCatalog(catalogData);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los datos.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, id_Fabricante: value }));
    };

    const handleCheckboxChange = (checked: boolean, name: keyof FormData) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.id_Fabricante || !formData.Nombre) {
            toast({ variant: 'destructive', title: 'Error', description: 'Fabricante y Nombre son requeridos.' });
            return;
        }

        const payload = {
            id_Fabricante: parseInt(formData.id_Fabricante, 10),
            Nombre: formData.Nombre,
            DosisLimite: formData.DosisLimite ? parseInt(formData.DosisLimite, 10) : null,
            Tipo: formData.Tipo || null,
            Descripcion: formData.Descripcion || null,
            perteneceAlEsquema: formData.perteneceAlEsquema,
            edadRecomendadaMeses: formData.perteneceAlEsquema && formData.edadRecomendadaMeses ? parseInt(formData.edadRecomendadaMeses, 10) : null,
            intervaloMesesSiguienteDosis: formData.perteneceAlEsquema && formData.intervaloMesesSiguienteDosis ? parseInt(formData.intervaloMesesSiguienteDosis, 10) : null,
            numeroDosisEsquema: formData.perteneceAlEsquema && formData.numeroDosisEsquema ? parseInt(formData.numeroDosisEsquema, 10) : null,
            esRefuerzo: formData.perteneceAlEsquema ? formData.esRefuerzo : false,
        };

        try {
            const responseData = await addVaccineRequest('/api/vaccine-catalog', {
                method: 'POST',
                body: payload,
                headers: { 'Content-Type': 'application/json' },
            });

            if (responseData && responseData.vaccine) {
                toast({ title: 'Éxito', description: 'Vacuna añadida al catálogo correctamente.' });
                setFormData(initialFormData);
                setIsModalOpen(false);
                loadInitialData(); // Refresh catalog
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo añadir la vacuna.' });
            }
        } catch (error) {
            console.error('Error adding vaccine:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Hubo un problema al añadir la vacuna.' });
        }
    };

    if (isLoading) {
        return <p>Cargando catálogo de vacunas y fabricantes...</p>;
    }

    return (
        <div className="space-y-8">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Añadir Nueva Vacuna al Catálogo</DialogTitle>
                        <DialogDescription>Complete el formulario para registrar una nueva vacuna en el sistema.</DialogDescription>
                    </DialogHeader>
                    <form id="addVaccineForm" onSubmit={handleSubmit} className="space-y-4 py-4">
                        {/* Vaccine Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="Nombre">Nombre de la Vacuna <span className="text-red-500">*</span></Label>
                                <Input id="Nombre" name="Nombre" placeholder="Ej: COVID-19 mRNA" value={formData.Nombre} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="id_Fabricante">Fabricante <span className="text-red-500">*</span></Label>
                                <Select onValueChange={handleSelectChange} value={formData.id_Fabricante} required>
                                    <SelectTrigger id="id_Fabricante"><SelectValue placeholder="Seleccione un fabricante" /></SelectTrigger>
                                    <SelectContent>
                                        {manufacturers.map((m) => (
                                            <SelectItem key={m.id_Fabricante} value={String(m.id_Fabricante)}>{m.Fabricante}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="DosisLimite">Dosis Límite por Paciente</Label>
                                <Input id="DosisLimite" name="DosisLimite" type="number" placeholder="Ej: 2" value={formData.DosisLimite} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="Tipo">Tipo de Vacuna</Label>
                                <Input id="Tipo" name="Tipo" placeholder="Ej: ARNm" value={formData.Tipo} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Descripcion">Descripción</Label>
                            <Textarea id="Descripcion" name="Descripcion" placeholder="Información adicional sobre la vacuna..." value={formData.Descripcion} onChange={handleInputChange} />
                        </div>

                        {/* Vaccination Scheme Section */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="perteneceAlEsquema" checked={formData.perteneceAlEsquema} onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'perteneceAlEsquema')} />
                                <Label htmlFor="perteneceAlEsquema" className="font-medium">Pertenece al Esquema Nacional de Vacunación Infantil</Label>
                            </div>
                            {formData.perteneceAlEsquema && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-slate-50">
                                    <div className="space-y-2">
                                        <Label htmlFor="edadRecomendadaMeses">Edad Recomendada (Meses) <span className="text-red-500">*</span></Label>
                                        <Input id="edadRecomendadaMeses" name="edadRecomendadaMeses" type="number" placeholder="Ej: 2" value={formData.edadRecomendadaMeses} onChange={handleInputChange} required={formData.perteneceAlEsquema} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="numeroDosisEsquema">Número Total de Dosis <span className="text-red-500">*</span></Label>
                                        <Input id="numeroDosisEsquema" name="numeroDosisEsquema" type="number" placeholder="Ej: 3" value={formData.numeroDosisEsquema} onChange={handleInputChange} required={formData.perteneceAlEsquema} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="intervaloMesesSiguienteDosis">Intervalo Siguiente Dosis (Meses)</Label>
                                        <Input id="intervaloMesesSiguienteDosis" name="intervaloMesesSiguienteDosis" type="number" placeholder="Ej: 2" value={formData.intervaloMesesSiguienteDosis} onChange={handleInputChange} />
                                    </div>
                                    <div className="flex items-center pt-6 space-x-2">
                                        <Checkbox id="esRefuerzo" checked={formData.esRefuerzo} onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'esRefuerzo')} />
                                        <Label htmlFor="esRefuerzo">Es una dosis de refuerzo</Label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="addVaccineForm" disabled={addingVaccine}>
                            {addingVaccine ? 'Añadiendo...' : 'Añadir Vacuna'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Catálogo de Vacunas</CardTitle>
                        <CardDescription>Lista de todas las vacunas registradas en el sistema.</CardDescription>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>Añadir Nueva Vacuna</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Fabricante</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Dosis Límite</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vaccineCatalog.length > 0 ? (
                                vaccineCatalog.map((vaccine) => (
                                    <TableRow key={vaccine.id_Vacuna}>
                                        <TableCell>{vaccine.id_Vacuna}</TableCell>
                                        <TableCell>{vaccine.Nombre}</TableCell>
                                        <TableCell>{vaccine.NombreFabricante || manufacturers.find(m => m.id_Fabricante === vaccine.id_Fabricante)?.Fabricante || 'N/A'}</TableCell>
                                        <TableCell>{vaccine.Tipo || 'N/A'}</TableCell>
                                        <TableCell>{vaccine.DosisLimite ?? 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No hay vacunas en el catálogo.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
