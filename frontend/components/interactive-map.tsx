"use client";

import React, { useEffect, useRef } from 'react';
import L, { LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface Centro {
  id: string;
  nombre: string;
  direccion: string;
  coordenadas?: { lat: number; lng: number };
  // other properties as needed by the map
}

interface InteractiveMapProps {
  centros: Centro[];
  selectedCentroId?: string | null;
  onCentroSelect?: (id: string) => void;
  defaultPosition?: LatLngExpression;
  defaultZoom?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  centros,
  selectedCentroId,
  onCentroSelect,
  defaultPosition = [18.7357, -70.1627], // Default to Dominican Republic center
  defaultZoom = 8,
}) => {
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Configure Leaflet's default icon paths
    // @ts-ignore This is a common workaround for Webpack/Next.js path issues with Leaflet icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl.src,
      iconUrl: iconUrl.src,
      shadowUrl: shadowUrl.src,
    });
  }, []);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(defaultPosition, defaultZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Cleanup map instance on component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [defaultPosition, defaultZoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    centros.forEach(centro => {
      if (centro.coordenadas) {
        const marker = L.marker([centro.coordenadas.lat, centro.coordenadas.lng])
          .bindPopup(`<b>${centro.nombre}</b><br>${centro.direccion}`);

        if (onCentroSelect) {
          marker.on('click', () => {
            onCentroSelect(centro.id);
            // The view centering will be handled by the selectedCentroId effect
          });
        }
        markersLayerRef.current?.addLayer(marker);
      }
    });
  }, [centros, onCentroSelect]); 

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectedCentroId) {
      const selected = centros.find(c => c.id === selectedCentroId);
      if (selected && selected.coordenadas) {
        mapInstanceRef.current.flyTo([selected.coordenadas.lat, selected.coordenadas.lng], 15);
        
        // Find and open popup for the selected marker
        markersLayerRef.current?.eachLayer((layer: L.Layer) => {
          if (layer instanceof L.Marker) {
            const centroData = centros.find(c => 
                c.coordenadas?.lat === layer.getLatLng().lat && 
                c.coordenadas?.lng === layer.getLatLng().lng
            );
            if (centroData?.id === selectedCentroId) {
              layer.openPopup();
            }
          }
        });
      }
    } else {
      // Optional: Fly back to default view if no center is selected and map is zoomed in
      if (mapInstanceRef.current.getZoom() > defaultZoom + 2) { 
         mapInstanceRef.current.flyTo(defaultPosition, defaultZoom);
      }
    }
  }, [selectedCentroId, centros, defaultPosition, defaultZoom]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
};

export default InteractiveMap;
