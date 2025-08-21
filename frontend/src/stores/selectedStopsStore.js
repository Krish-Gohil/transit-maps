import {create} from 'zustand'

const useSelectedStopsStore = create(set => ({
    selectedStops: [],
    addSelectedStop: (stop) => {
        set((state) => {
            if(!state.selectedStops.some(s => s.stop_id === stop.stop_id)){
                if(state.selectedStops.length >= 5){
                    console.log('Selected Stops:', state.selectedStops);  // <-- debugging log

                    return {selectedStops: [...state.selectedStops, stop].slice(-5)};
                }
                return {selectedStops: [...state.selectedStops, stop]}
            }
            return state
        })
    },
    removeSelectedStop: (stop) => {
        set((state) => ({
            selectedStops: state.selectedStops.filter(s => s.stop_id !== stop.stop_id)
        }))

    },
    clearSelectedStop: () => {set(() => ({selectedStops: []}) )},

}))

export default useSelectedStopsStore