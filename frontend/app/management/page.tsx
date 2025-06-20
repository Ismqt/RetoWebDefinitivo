'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagementPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/management/availability');
    }, [router]);

    return <div>Redirigiendo a la gestión de disponibilidad...</div>;
}
