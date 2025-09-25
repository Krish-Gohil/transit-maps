import React, { useState, useEffect, useCallback } from 'react';
import useLocationStore from "../stores/locationStore.js";
import useRouteStore from "../stores/routeStore.js";
import EtaDetailsBox from "./EtaDetailsBox.jsx";
import DestinationBox from "./DestinationBox.jsx";
import CurrentLocationBox from "./CurrentLocationBox.jsx";
import { FiArrowRight, FiClock, FiMapPin, FiX, FiAlertCircle } from 'react-icons/fi';
import { FaBus, FaSubway, FaTrain, FaTram } from 'react-icons/fa';

const InfoPanel = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const { location, error, denied, getLocation } = useLocationStore();
    const { tripData, setTripData, clearTripData, selectRoute, selectedRouteIndex } = useRouteStore();

    const initializeLocation = useCallback(() => {
        getLocation();
    }, [getLocation]);

    useEffect(() => {
        initializeLocation();
    }, [initializeLocation]);

    const [destinationCoordinates, setDestinationCoordinates] = React.useState(null);
    const [status, setStatus] = React.useState('idle'); // idle | loading | success | failed

    const handleRouteSearch = async () => {
        if (!location || !destinationCoordinates) {
            console.error("Missing origin or destination coordinates.");
            return;
        }
        setStatus('loading');
        clearTripData();

        const params = new URLSearchParams({
            originLat: location.lat,
            originLon: location.lng,
            destinationLat: destinationCoordinates.lat,
            destinationLon: destinationCoordinates.lon,
        });

        try {
            const url = `${import.meta.env.VITE_BACKEND_API}/trips?${params}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error finding direct trips");
            const data = await res.json();
            setTripData(data);
            setStatus('success');
            // don't auto-select a route — wait for user selection
        } catch (err) {
            console.error(err);
            setStatus('failed');
        }
    };

    // Toggle panel visibility
    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={togglePanel}
                className="fixed sm:hidden bottom-6 right-6 z-50 p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform hover:scale-105"
                aria-label={isPanelOpen ? 'Hide panel' : 'Show panel'}
            >
                {isPanelOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Main Panel */}
            <div
                className={`fixed sm:absolute top-4 left-1/2 sm:left-6 -translate-x-1/2 sm:translate-x-0 z-50 p-4 rounded-xl shadow-lg w-[calc(100%-2rem)] sm:w-[400px] max-h-[90vh] overflow-auto transition-all duration-300 ease-in-out
                    backdrop-blur-md bg-gradient-to-br from-gray-800/70 to-gray-900/80 border border-gray-700/50 shadow-2xl
                    ${isPanelOpen ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4 sm:opacity-100 sm:translate-y-0'}`}
                style={{ maxWidth: 'calc(100% - 2rem)' }}
            >
            <h1 className="text-lg font-bold mb-2 text-center sm:text-left text-white">TTC Transit Map</h1>

            {denied && (<div className="text-red-400 mb-2">Location access denied. Please enable location.</div>)}
            {error && !denied && (<div className="text-red-400 mb-2">{error}</div>)}

            <CurrentLocationBox />
            <DestinationBox
                onDestinationSelect={setDestinationCoordinates}
                onSearchClick={handleRouteSearch}
                status={status}
            />

            {/* Show ETA only when no tripData (i.e., not showing routes) */}
            {!tripData && <EtaDetailsBox />}

            {/* Search feedback */}
            {status === 'loading' && <div className="mt-3 text-sm text-gray-300">Searching for direct trips...</div>}
            {status === 'failed' && <div className="mt-3 text-sm text-red-400">Failed to find trips. Try again.</div>}

            {/* Routes list (when search succeeded) */}
            {status === 'loading' && (
                <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="h-6 w-6 rounded-full bg-gray-700"></div>
                                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                            </div>
                            <div className="h-3 bg-gray-700 rounded w-2/3 mb-2"></div>
                            <div className="flex justify-between items-center mt-3">
                                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                                <div className="h-8 bg-gray-700 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {status === 'success' && tripData && (
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-white">Available Routes</h2>
                        <button
                            onClick={() => { clearTripData(); setStatus('idle'); }}
                            className="p-1.5 rounded-full hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
                            aria-label="Close routes"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                    
                    {tripData.length === 0 ? (
                        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                            <FiAlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
                            <p className="text-gray-300">No direct routes found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your destination or check back later</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tripData.map((route, idx) => {
                                // Determine route type for icon
                                const getRouteIcon = () => {
                                    const routeType = route.route_type?.toLowerCase();
                                    if (routeType?.includes('subway')) return <FaSubway className="text-blue-400" size={16} />;
                                    if (routeType?.includes('streetcar') || routeType?.includes('tram')) return <FaTram className="text-red-400" size={16} />;
                                    return <FaBus className="text-green-400" size={16} />;
                                };

                                // Calculate travel time if available
                                const travelTime = route.duration ? `${Math.ceil(route.duration / 60)} min` : null;

                                return (
                                    <div
                                        key={`${route.route_short_name}-${idx}`}
                                        className={`p-4 rounded-lg transition-all ${selectedRouteIndex === idx ? 'bg-gray-700/80 border-blue-500' : 'bg-gray-800/50 border-gray-700'} border`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/70">
                                                        {getRouteIcon()}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-baseline gap-2">
                                                        <span className="font-medium text-white whitespace-nowrap">{route.route_short_name}</span>
                                                        {route.route_long_name && (
                                                            <span className="text-sm text-gray-300 truncate">{route.route_long_name}</span>
                                                        )}
                                                    </div>
                                                    {route.trip_headsign && (
                                                        <div className="mt-1 text-sm text-gray-300">
                                                            <div className="flex items-start">
                                                                <FiArrowRight className="mr-1.5 text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                                                                <span className="break-words line-clamp-2">{route.trip_headsign}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                                                        {travelTime && (
                                                            <span className="flex items-center">
                                                                <FiClock className="mr-1 flex-shrink-0" size={12} /> {travelTime}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center">
                                                            <FiMapPin className="mr-1 flex-shrink-0" size={12} /> {(route.path || []).length} stops
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 sm:self-center">
                                                <button
                                                    onClick={() => selectRoute(idx)}
                                                    className={`w-full sm:w-auto px-3 py-1.5 text-sm rounded-full transition-colors ${selectedRouteIndex === idx ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-white whitespace-nowrap`}
                                                >
                                                    {selectedRouteIndex === idx ? 'Selected' : 'Show'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            </div>
        </>
    );
};

export default InfoPanel;
