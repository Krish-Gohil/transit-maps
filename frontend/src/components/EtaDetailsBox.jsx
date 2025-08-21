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
                fetch(`http://localhost:3000/api/eta?${params}`)
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
            <h2 className="text-lg font-bold mt-4 mb-2">Upcoming Buses</h2>

            {selectedStops.length === 0 ? (
                <div className="p-4 text-center text-gray-500 border rounded-lg bg-gray-50">
                    <p className="text-sm">No stops selected yet</p>
                    <p className="text-xs">Choose a stop on the map to see real-time arrivals</p>
                </div>
            ) : (
                <>
                    {selectedStops.map(stop => (
                        // main div
                        <div key={stop.stop_id} className='border-2 shadow mb-2 p-2'>
                        <div className='flex items-center justify-between mb-2'>
                                <span className='font-semibold'>{stop.stop_name}</span>
                                <button className='text-red-500 hover:text-red-700'
                                    onClick={() => removeSelectedStop(stop)}>✕
                                </button>
                            </div>

                            {/*    bus eta info*/}
                            <div className='text-sm text-gray-700'>
                                {eta[stop.stop_id]?.map(bus => (
                                    <div
                                        key={bus.trip_id}
                                        className="flex justify-between items-center bg-gray-50 border rounded-lg p-2 mb-2"
                                    >
                                        <div className="flex flex-col">
                                            <span
                                                className="font-semibold text-blue-700">{bus.bus_name.split(" - ")[0]}</span>
                                            <span className="text-xs text-gray-500  max-w-[200px]">
                                                {bus.bus_name.split(" - ")[1]}
                                            </span>
                                        </div>
                                        <span className="font-bold text-green-600">
                                            {bus.mins_from_now} min
                                        </span>
                                    </div>
                                ))}
                            </div>


                        </div>
                    ))}
                    <button
                        className="mt-2 w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
                        onClick={clearSelectedStop}
                    >
                        Clear All Stops
                    </button>
                </>
            )}
        </>
    )
}