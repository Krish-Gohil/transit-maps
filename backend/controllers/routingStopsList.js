import {getNearbyStops} from "../services/stopService.js";

export const routingStopsList = async (req, res) => {
    const {originLat, originLon, destinationLat, destinationLon} = req.query;

    if(!originLon || !destinationLon || !originLat || !destinationLat) {
        return res.status(400).json({error: "origin or destination co-oridnates not found"})
    }

    try{
        const originStops = await getNearbyStops(parseFloat(originLat), parseFloat(originLon))
        const destinationStops = await getNearbyStops(parseFloat(destinationLat), parseFloat(destinationLon))

        res.json({
            origin: originStops,
            destination: destinationStops
        })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}