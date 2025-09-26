import React, {useEffect} from 'react';
import TextBox from "./TextBox.jsx";
import useLocationStore from "../stores/locationStore.js";

export default function CurrentLocationBox(props) {
    const {
        //current location coordinates
        /**
         *  location: {
         *      lat: user location latitude
         *      lng: user location longitude
         *  }
         */
        location,
        setManualLocation,
    } = useLocationStore();

    // TODO: make destination zustand store
    //current location as string from geoapify
    const [currentLocation, setCurrentLocation] = React.useState('');

    //converting the current locations coordinates to string address
    useEffect(() => {
        if(location && typeof location.lat === 'number' && typeof location.lng === 'number'){
            const params = new URLSearchParams({
                lat: location.lat,
                lon: location.lng,
                apiKey: import.meta.env.GEO_APIFY_KEY
            })

            const url = `https://api.geoapify.com/v1/geocode/reverse?${params.toString()}`
            fetch(url)
                .then(res => {
                    if(!res.ok) throw new Error("Error getting the current location")
                    return res.json()
                })
                .then(data => {
                    if(data && data.features && data.features.length > 0){
                        setCurrentLocation(data.features[0].properties.address_line1)
                        // setDestinationLocation({
                        //     lat: data.features[0].properties.lat,
                        //     lng: data.features[0].properties.lon,
                        // });
                    }
                })
                .catch(err => console.log(err));
        }

    }, [location]);

    return(
        <div>
            {/*search-currentlocation textbox*/}
            <div className="mb-2">
                <TextBox
                    id='currentLocation'
                    placeholder='Current Location'
                    value={currentLocation ? currentLocation : "Enter Location Manually"}
                    onChange={(e) => setManualLocation(e.target.value)}
                />
            </div>

        </div>
    )
}