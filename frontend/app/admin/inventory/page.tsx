'use client';

import { useState, useEffect } from 'react';
import useApi from '@/hooks/use-api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

// TODO: Crear estos componentes en los siguientes pasos
import { InventoryTable } from '@/components/inventory/inventory-table';
import { AddLotModal } from '@/components/inventory/add-lot-modal';

interface Center {
    id_CentroVacunacion: number;
    Nombre: string;
}

interface Lot {
    id_LoteVacuna: number;
    NumeroLote: string;
    NombreVacuna: string;
    NombreFabricante: string;
    FechaCaducidad: string;
    FechaRecepcion: string;
    CantidadInicial: number;
    CantidadDisponible: number;
    Activo: boolean;
}

export default function InventoryManagementPage() {
    const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
    const [centers, setCenters] = useState<Center[]>([]);
    const [lots, setLots] = useState<Lot[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { request: fetchCenters, loading: loadingCenters } = useApi<Center[]>();
    const { request: fetchLots, loading: loadingLots } = useApi<Lot[]>();

    // Cargar centros de vacunación al montar el componente
    useEffect(() => {
        const loadCenters = async () => {
            const { data } = await fetchCenters('/vaccination-centers');
            if (data) {
                setCenters(data);
            }
        };
        loadCenters();
    }, [fetchCenters]);

    // Cargar lotes cuando se selecciona un centro
    useEffect(() => {
        if (selectedCenter) {
            const loadLots = async () => {
                const { data } = await fetchLots(`/inventory/lots/center/${selectedCenter}`);
                if (data) {
                    setLots(data);
                } else {
                    setLots([]); // Limpiar si no hay datos o hay error
                }
            };
            loadLots();
        } else {
            setLots([]); // Limpiar si no hay centro seleccionado
        }
    }, [selectedCenter, fetchLots]);

    const handleSuccess = () => {
        // Recargar lotes después de añadir uno nuevo
        if (selectedCenter) {
            const loadLots = async () => {
                const { data } = await fetchLots(`/inventory/lots/center/${selectedCenter}`);
                if (data) {
                    setLots(data);
                }
            };
            loadLots();
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Toaster />
            <h1 className="text-2xl font-bold mb-4">Gestión de Inventario de Vacunas</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Centro de Vacunación</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Select onValueChange={setSelectedCenter} value={selectedCenter || ''}>
                            <SelectTrigger className="w-[320px]">
                                <SelectValue placeholder="Seleccione un centro para ver su inventario..." />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingCenters ? (
                                    <SelectItem value="loading" disabled>Cargando centros...</SelectItem>
                                ) : (
                                    centers.map(center => (
                                        <SelectItem key={center.id_CentroVacunacion} value={String(center.id_CentroVacunacion)}>
                                            {center.Nombre}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => setIsModalOpen(true)} disabled={!selectedCenter}>
                            Añadir Nuevo Lote
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {selectedCenter && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Lotes en el Centro Seleccionado</h2>
                    <InventoryTable lots={lots} loading={loadingLots} />
                </div>
            )}

            {isModalOpen && selectedCenter && (
                <AddLotModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                    centerId={Number(selectedCenter)}
                />
            )}
        </div>
    );
}
