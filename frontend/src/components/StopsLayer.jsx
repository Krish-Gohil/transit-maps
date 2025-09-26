import useLocationStore from "../stores/locationStore.js";
import {useEffect, useState} from "react";
import {CircleMarker, Popup} from "react-leaflet";
import useSelectedStopsStore from "../stores/selectedStopsStore.js"


export default function StopsLayer({lng, lat, radius = 1000}) {
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const {
        addSelectedStop,
    } = useSelectedStopsStore();

    useEffect(() => {
        const params = new URLSearchParams({lng, lat, radius})

        fetch(`${import.meta.env.BACKEND_API}/stops?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error("Error fetching nearbyStops")
                return res.json()
            })
            .then(data => {
                // console.log(data)
                setStops(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [lng, lat, radius]);

    if (loading) return null;
    if (error) return <p>{error.message}</p>;

    return (
        <>
            {stops.map((stop) => (
                <CircleMarker
                    key={stop.stop_id}
                    center={[stop.stop_lat, stop.stop_lon]}
                    radius={8}
                    fillColor="red"
                    color="darkred"
                    weight={1}
                    fillOpacity={0.8} >

                    <Popup><p className='text-blue-500 underline cursor-pointer' onClick={() => {
                        addSelectedStop(stop)
                    }}>{stop.stop_name}, {stop.stop_id}</p></Popup>

                </CircleMarker>
            ))}
        </>
    )
}