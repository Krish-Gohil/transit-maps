import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import useLocationStore from "../stores/locationStore.js";
import useRouteStore from "../stores/routeStore.js";
import 'leaflet/dist/leaflet.css';
import StopsLayer from "./StopsLayer.jsx";

// Fix Leaflet's default marker icons (needed for Vite/Webpack builds)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

function MapViewController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, zoom);
    }, [center?.[0], center?.[1], zoom, map]);
    return null;
}

export default function MapPanel() {
    const { location, denied } = useLocationStore();
    const { tripData, selectedRouteIndex } = useRouteStore();

    if (!location && !denied) {
        return <div>Loading map...</div>;
    }

    const defaultCenter = [43.65107, -79.347015];
    const center = location && !denied ? [location.lat, location.lng] : defaultCenter;
    const zoom = location && !denied ? 16 : 12;

    const selectedRoute = tripData && selectedRouteIndex != null ? tripData[selectedRouteIndex] : null;

    // Smooth route using turf.js
    let smoothedCoords = null;
    if (selectedRoute && selectedRoute.path) {
        const rawCoords = selectedRoute.path.map(s => [s.stop_lon, s.stop_lat]); // turf needs [lon,lat]
        if (rawCoords.length > 1) {
            const line = turf.lineString(rawCoords);
            const curved = turf.bezierSpline(line, { resolution: 10000, sharpness: 0.85 });
            smoothedCoords = curved.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        }
    }

    const firstStopCenter = selectedRoute && selectedRoute.path.length > 0
        ? [selectedRoute.path[0].stop_lat, selectedRoute.path[0].stop_lon]
        : null;

    return (
        <div className="w-full h-full">
            <MapContainer
                className="z-0"
                center={center}
                zoom={zoom}
                zoomControl={false}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                preferCanvas={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <ZoomControl position="bottomright" />

                {location && !denied && (
                    <Marker position={[location.lat, location.lng]}>
                        <Popup>Your location</Popup>
                    </Marker>
                )}

                {location && !denied && (
                    <StopsLayer lng={location.lng} lat={location.lat} radius={2000} />
                )}

                {selectedRoute && smoothedCoords && (
                    <>
                        <MapViewController center={firstStopCenter} zoom={15} />

                        {/* smoothed polyline */}
                        <Polyline positions={smoothedCoords} pathOptions={{ weight: 4, color: '#2b8cff' }} />

                        {/* CircleMarkers for bus stops */}
                        {selectedRoute.path.map(stop => (
                            <CircleMarker
                                key={stop.stop_id}
                                center={[stop.stop_lat, stop.stop_lon]}
                                radius={6}
                                color="#fff"
                                fillColor="#ff3333"
                                fillOpacity={0.9}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <strong>{stop.stop_name}</strong>
                                        <div className="text-xs">Stop ID: {stop.stop_id}</div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </>
                )}
            </MapContainer>
        </div>
    );
}
