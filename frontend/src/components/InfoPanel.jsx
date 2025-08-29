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
        destinationLocation,
        setDestinationLocation,
    } = useLocationStore();

    // getting users location on load
    useEffect(() => {
        getLocation();
    }, [])

    //converting the current locations coordinates to string address
    useEffect(() => {
        if(location && typeof location.lat === 'number' && typeof location.lng === 'number'){
            const params = new URLSearchParams({
                lat: location.lat,
                lon: location.lng,
                apiKey: import.meta.env.VITE_GEO_APIFY
            })

            const url = `https://api.geoapify.com/v1/geocode/reverse?${params.toString()}`
            fetch(url)
                .then(res => {
                    if(!res.ok) throw new Error("Error getting the current location")
                    return res.json()
                })
                .then(data => {
                    console.log(data)
                    if(data && data.features && data.features.length > 0){
                        setCurrentLocation(data.features[0].properties.address_line1)
                        setDestinationLocation({
                            lat: data.features[0].properties.lat,
                            lng: data.features[0].properties.lon,
                        });
                    }
                })
                .catch(err => console.log(err));
        }

    }, [location]);
    const locationToString = location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : manualLocation;

    // TODO: make destination zustand store
    const [currentLocation, setCurrentLocation] = React.useState('')
    const [destination, setDestination] = React.useState('');
    const [destinationCoordinates, setDestinationCoordinates] = React.useState({});
    const [suggestions, setSuggestions] = React.useState([]);
    const [destinationClicked, setDestinationClicked] = React.useState(false)

    // searching destination
    useEffect(() => {
        if(destinationClicked){
            setDestinationClicked(false)
            return
        }
        if(destination.length > 3){
            let debounce = setTimeout(() => {
                const params = new URLSearchParams({
                    text: destination,
                    filter: "rect:-79.6393,43.5810,-79.1153,43.8555",
                    apiKey: import.meta.env.VITE_GEO_APIFY,
                    limit: "5"
                })
                const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`
                console.log(url)

                fetch(url)
                    .then(res => {
                        if(!res.ok) throw new Error("failed to search the destination from geoapify")
                        return res.json()
                    })
                    .then(data => {
                        if(data.features.length > 0){
                            const results = data.features.map(features => ({
                                label: features.properties.formatted,
                                lat: features.properties.lat,
                                lon: features.properties.lon,
                            }))
                            setSuggestions(results)
                            console.log(results)
                        } else{
                            setSuggestions([{label: 'No suggestions found'}])
                        }
                    })
                    .catch(err => console.log("geoapify error", err));
            },500)
            return () => clearTimeout(debounce)
        }

    }, [destination])

    return (
        <div
            className="fixed sm:absolute top-4 left-1/2 sm:left-6 -translate-x-1/2 sm:translate-x-0 z-50 p-4 rounded-xl shadow-lg w-[calc(100%-2rem)] sm:w-[400px] max-h-[90vh] overflow-auto 
            backdrop-blur-md bg-gradient-to-br from-gray-800/70 to-gray-900/80 border border-gray-700/50 shadow-2xl"
            style={{ maxWidth: 'calc(100% - 2rem)' }}>
            <h1 className="text-lg font-bold mb-2 text-center sm:text-left text-white">TTC Transit Map</h1>

            {/* Show error if denied or geolocation not supported */}
            {denied && (
                <div className="text-red-400 mb-2">
                    Location access denied. Please enable location for full app functionality.
                </div>
            )}
            {error && !denied && (
                <div className="text-red-400 mb-2">{error}</div>
            )}

            {/*search-currentlocation textbox*/}
            <div className="mb-2">
                <TextBox
                    id='currentLocation'
                    placeholder='Current Location'
                    value={currentLocation ? currentLocation : "Enter Location Manually"}
                    onChange={(e) => setManualLocation(e.target.value)}
                />
            </div>

            {/*destination textbox*/}
            <div className="mb-2">
                <TextBox
                    id='destination'
                    placeholder='Destination'
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
            </div>

            {/* suggestions box */}
            {suggestions.length > 0 && (
                <ul className='bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto shadow-md text-sm sm:text-base text-white'>
                    {suggestions.map(s => (
                    <li className='p-2 cursor-pointer hover:bg-gray-600'
                    onClick={() => {
                        setDestinationClicked(true)
                        setDestination(s.label)
                        setDestinationCoordinates({lat: s.lat, lon: s.lon})
                        setSuggestions([])
                    }}
                    >{s.label}</li>
                    ))}
                </ul>
            )}
        <EtaDetailsBox/>
        </div>

    )
}

export default InfoPanel;