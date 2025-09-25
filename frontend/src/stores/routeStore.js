// import {create} from 'zustand'
//
// const useRouteStore = create(set => ({
//     /**
//      * backend api raw response
//      */
//     tripData: null,
//     /**
//      * geometry of the route
//      */
//     routeGeoJson: null,
//     /**
//      * all the stops
//      */
//     stops: [],
//     setTripData: (data) => { set({tripData: data}) },
//     clearTripData: () => { set({tripData: null})}
// }))
//
// export default useRouteStore;
// src/stores/routeStore.js
import { create } from 'zustand';

// helper: flatten and dedupe stops (optional)
const dedupeStops = (tripData) => {
    if (!tripData) return [];
    const map = new Map();
    tripData.forEach(route => {
        (route.path || []).forEach(s => {
            if (!map.has(s.stop_id)) {
                map.set(s.stop_id, {
                    stop_id: s.stop_id,
                    stop_name: s.stop_name,
                    lat: s.stop_lat,
                    lon: s.stop_lon,
                });
            }
        });
    });
    return Array.from(map.values());
};

const useRouteStore = create((set) => ({
    tripData: null,            // raw API response array
    stops: [],                 // deduped stops across routes (optional)
    selectedRouteIndex: null,  // index into tripData
    setTripData: (data) => set({ tripData: data, stops: dedupeStops(data) }),
    selectRoute: (index) => set({ selectedRouteIndex: index }),
    clearTripData: () => set({ tripData: null, stops: [], selectedRouteIndex: null }),
}));

export default useRouteStore;
