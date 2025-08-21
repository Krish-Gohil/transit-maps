import React from 'react';
import TextBox from "./TextBox.jsx";
import useLocationStore from "../stores/locationStore.js";
import {useEffect} from "react";
import EtaDetailsBox from "./EtaDetailsBox.jsx";

const InfoPanel = () => {

    const {
        location,
        manualLocation,
        error,
        denied,
        getLocation,
        setManualLocation,
    } = useLocationStore();

    useEffect(() => {getLocation()}, [getLocation]);
    const locationToString = location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : manualLocation;

    // TODO: make destination zustand store
    const [destination, setDestination] = React.useState('');

    return (
        <div
            className="absolute top-5 left-6 z-50 bg-white bg-opacity-90 p-4 rounded-xl shadow-lg w-[400px] max-h-[90vh] overflow-auto">
            <h1 className="text-lg font-bold mb-2">App Name with Logo</h1>

            {/* Show error if denied or geolocation not supported */}
            {denied && (
                <div className="text-red-600 mb-2">
                    Location access denied. Please enable location for full app functionality.
                </div>
            )}
            {error && !denied && (
                <div className="text-red-600 mb-2">{error}</div>
            )}

            {/*search-currentlocation textbox*/}
            <TextBox
            id='currentLocation'
            placeholder='Current Location'
            value={denied ? ``:`Current Location: (${locationToString})`}
            onChange={(e) => setManualLocation(e.target.value)}
            />

            {/*destination textbox*/}
            <TextBox
                id='destination'
                placeholder='Destination'
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
            />

        <EtaDetailsBox></EtaDetailsBox>
        </div>

    )
}

export default InfoPanel;