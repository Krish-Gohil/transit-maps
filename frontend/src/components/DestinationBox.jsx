import React, {useEffect} from "react";
import TextBox from "./TextBox.jsx";

export default function DestinationBox({onDestinationSelect, onSearchClick, status}) {

    const [destination, setDestination] = React.useState('');
    // lat/lon of chosen destination
    /**
     * destination: {lat: destination lat, lon: destination lon}
     */
    // suggestions from geoapify autocomplete implementation
    const [suggestions, setSuggestions] = React.useState([]);
    // tracks if user clicked on destination suggestion
    const [destinationClicked, setDestinationClicked] = React.useState(false)

    const setDestinationProp = (object) => {
        onDestinationSelect(object);
    }

    useEffect(() => {
        if(destinationClicked){
            setDestinationClicked(false)
            return
        }
        if(destination.length > 3){
            let debounce = setTimeout(() => {
                const params = new URLSearchParams({
                    text: destination,
                    // approximate greater toronto area bounds
                    filter: "rect:-79.6393,43.5810,-79.1153,43.8555",
                    apiKey: import.meta.env.GEO_APIFY_KEY,
                    limit: "5"
                })
                const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`
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
                        } else{
                            setSuggestions([{label: 'No suggestions found'}])
                        }
                    })
                    .catch(err => console.log("geoapify error", err));
            },500)
            return () => clearTimeout(debounce)
        }

    }, [destination])

    return(
        <div>
            {/*destination textbox*/}
            <div className="mb-2 relative">
                <TextBox
                    id='destination'
                    placeholder='Destination'
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
                <button
                    type="button"
                    aria-label="Search"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white"
                    onClick={onSearchClick}
                    disabled={status === 'loading'}
                >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* suggestions box */}
            {suggestions.length > 0 && (
                <ul className='bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto shadow-md text-sm sm:text-base text-white'>
                    {suggestions.map(s => (
                    <li className='p-2 cursor-pointer hover:bg-gray-600'
                    onClick={() => {
                           setDestinationClicked(true)
                        setDestination(s.label)
                        setDestinationProp({lat: s.lat, lon: s.lon})
                        setSuggestions([])
                    }}
                    >{s.label}</li>
                    ))}
                </ul>
            )}
        </div>
    )

}