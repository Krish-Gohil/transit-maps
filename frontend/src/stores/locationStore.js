import {create} from 'zustand'

const useLocationStore = create(set => ({
    location: null,
    manualLocation: '',
    error: null,
    denied: false,
    getLocation: () => {
        if (!navigator.geolocation) {
            set({error: 'Geolocation is not supported', denied: true})
            return;
        }
        // getCurrentPosition(successCallback, errorCallback)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                set({
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    },
                    error: null,
                    denied: false,
                    manualLocation: '',
                })
            },
            (err) => {
                set({
                    error: err.message,
                    denied: true,
                    location: null})
            })
    },
    setManualLocation: (value) => {set({manualLocation: value})},
    destinationLocation: null,
    setDestinationLocation: (destinationLocation) => set({ destinationLocation })
}))

export default useLocationStore;