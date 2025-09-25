import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapVisualization = ({ observations, selectedSpecies, loading }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Poland bounds
  const polandBounds = [
    [49.0, 14.0], // Southwest
    [54.8, 24.2]  // Northeast
  ];

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [52.0, 19.0], // Center of Poland
        zoom: 6,
        maxBounds: polandBounds,
        maxBoundsViscosity: 1.0
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when observations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    if (observations.length === 0) return;

    // Create custom icon
    const createCustomIcon = (color = '#0ea5e9') => {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
    };

    // Add markers for observations
    observations.forEach((obs, index) => {
      if (obs.decimalLatitude && obs.decimalLongitude) {
        const marker = L.marker([obs.decimalLatitude, obs.decimalLongitude], {
          icon: createCustomIcon()
        });

        // Create popup content
        const popupContent = `
          <div class="p-2">
            <div class="font-semibold text-gray-900 mb-2">
              ${selectedSpecies ? selectedSpecies.scientificName : 'Species Observation'}
            </div>
            <div class="text-sm text-gray-600 space-y-1">
              ${obs.eventDate ? `<div><strong>Date:</strong> ${obs.eventDate}</div>` : ''}
              ${obs.locality ? `<div><strong>Location:</strong> ${obs.locality}</div>` : ''}
              ${obs.stateProvince ? `<div><strong>Province:</strong> ${obs.stateProvince}</div>` : ''}
              ${obs.individualCount ? `<div><strong>Count:</strong> ${obs.individualCount}</div>` : ''}
              ${obs.basisOfRecord ? `<div><strong>Basis:</strong> ${obs.basisOfRecord}</div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers
    if (observations.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    } else {
      // Reset to Poland view
      mapInstanceRef.current.setView([52.0, 19.0], 6);
    }
  }, [observations, selectedSpecies]);

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full rounded-b-lg" />
      
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-b-lg">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="loading-spinner"></div>
            <span>Loading observations...</span>
          </div>
        </div>
      )}

      {!loading && observations.length === 0 && selectedSpecies && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center rounded-b-lg">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">No observations found</div>
            <div className="text-sm">This species has no recorded observations in the dataset</div>
          </div>
        </div>
      )}

      {!loading && !selectedSpecies && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center rounded-b-lg">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">Welcome to the Biodiversity Dashboard</div>
            <div className="text-sm">Search for a species to view its observations on the map</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;
