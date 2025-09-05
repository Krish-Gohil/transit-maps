import useSelectedStopsStore from "../stores/selectedStopsStore.js";
import { useEffect, useState } from "react";

export default function EtaDetailsBox() {
    const {
        selectedStops,
        removeSelectedStop,
        clearSelectedStop
    } = useSelectedStopsStore();

    const [eta, setEta] = useState({});

    useEffect(() => {
        if (selectedStops.length === 0) {
            setEta({});
            return;
        }

        const fetchEta = () => {
            selectedStops.forEach(stop => {
                const params = new URLSearchParams({ stop_id: stop.stop_id });
                fetch(`${import.meta.env.VITE_BACKEND_API}/eta?${params}`)
                    .then(res => {
                        if (!res.ok) throw new Error("Error fetching eta from stop_id");
                        return res.json();
                    })
                    .then(data => {
                        setEta(prev => ({ ...prev, [stop.stop_id]: data }));
                    })
                    .catch(err => console.log(err));
            });
        };

        fetchEta();

        const interval = setInterval(fetchEta, 60 * 1000);

        return () => clearInterval(interval);

    }, [selectedStops]);

    return (
        <>
            <h2 className="text-lg font-bold mt-4 mb-2 text-white">Upcoming Buses</h2>

            {selectedStops.length === 0 ? (
                <div className="p-4 text-center text-gray-300 border border-gray-600 rounded-lg bg-gray-700">
                    <p className="text-sm">No stops selected yet</p>
                    <p className="text-xs text-gray-300">Choose a stop on the map to see real-time arrivals</p>
                </div>
            ) : (
                <>
                    {selectedStops.map(stop => (
                        // main div
                        <div key={stop.stop_id} className='border-2 border-gray-600 shadow-lg mb-2 p-3 bg-gray-800 rounded-lg'>
                            <div className='flex items-center justify-between mb-2'>
                                <span className='font-semibold text-white'>{stop.stop_name}</span>
                                <button className='text-red-400 hover:text-red-300 transition-colors'
                                    onClick={() => removeSelectedStop(stop)}>✕
                                </button>
                            </div>

                            {/*    bus eta info */}
                            <div className='text-sm text-gray-200'>
                                {eta[stop.stop_id]?.map(bus => (
                                    <div
                                        key={bus.trip_id}
                                        className="flex justify-between items-center bg-gray-700 border border-gray-600 rounded-lg p-3 mb-2 hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-blue-300">
                                                {bus.bus_name.split(" - ")[0]}
                                            </span>
                                            <span className="text-xs text-gray-300 max-w-[200px] truncate">
                                                {bus.bus_name.split(" - ")[1]}
                                            </span>
                                        </div>
                                        <span className="font-bold text-green-400 text-lg">
                                            {bus.mins_from_now} min
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button
                        className="mt-3 w-full py-2.5 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all"
                        onClick={clearSelectedStop}
                    >
                        Clear All Stops
                    </button>
                </>
            )}
        </>
    )
}