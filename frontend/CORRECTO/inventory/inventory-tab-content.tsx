'use client';

import { useState, useEffect } from 'react';
import useApi from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { AddLotModal } from '@/components/inventory/add-lot-modal';

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

export function InventoryTabContent() {
    const { user } = useAuth();
    const [lots, setLots] = useState<Lot[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { request: fetchLots, loading: loadingLots } = useApi<Lot[]>();

    const centerId = user?.id_CentroVacunacion;

    const loadLots = async () => {
        console.log('[Debug] User object in InventoryTab:', user);
        console.log('[Debug] Center ID from user object:', centerId);

        if (centerId) {
            try {
                const { data } = await fetchLots(`/inventory/lots/center/${centerId}`);
                if (data) {
                    setLots(data);
                } else {
                    setLots([]);
                }
            } catch (error) {
                console.error('[Debug] Error fetching lots in InventoryTab:', error);
            }
        }
    };

    useEffect(() => {
        loadLots();
    }, [centerId]); // Se ejecuta cuando centerId está disponible

    const handleSuccess = () => {
        // Recargar lotes después de añadir uno nuevo
        loadLots();
    };

    if (!centerId) {
        return <p>Cargando información del centro...</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <Toaster />
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Inventario del Centro</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    Añadir Nuevo Lote
                </Button>
            </div>

            <InventoryTable lots={lots} loading={loadingLots} />

            <AddLotModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                centerId={centerId}
            />
        </div>
    );
}
