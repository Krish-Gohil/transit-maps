// src/components/MapPanel.jsx
import {MapContainer, Marker, Popup, TileLayer, ZoomControl} from 'react-leaflet';
import useLocationStore from "../stores/locationStore.js";
import 'leaflet/dist/leaflet.css';
import StopsLayer from "./StopsLayer.jsx";


export default function MapPanel() {

    const { location, denied } = useLocationStore();

    if (!location && !denied) {
        return <div>Loading map...</div>;  // TODO add a spinner animation
    }

    const defaultCenter = [43.65107, -79.347015];
    const center = location && !denied ? [location.lat, location.lng] : defaultCenter;
    const zoom = location && !denied ? 16 : 12;

    return (
        <div className="w-full h-full">
            <MapContainer className='z-0'
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

                {/* Marker for current user location */}
                {location && !denied && (
                    <Marker position={[location.lat, location.lng]}>
                        <Popup>Your location</Popup>
                    </Marker>
                )}

                {location && !denied && (
                    <StopsLayer lng={location.lng} lat={location.lat} radius={2000} />
                )}

            </MapContainer>
        </div>
    );
}
