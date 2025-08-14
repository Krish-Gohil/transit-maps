import {pool} from '../db.js'


export const getAllStops = async (req, res) => {

    try {
        const {lng, lat, radius} = req.query;

        if(!lat || !lng){
            return res.status(400).json("Missing co-ordinates while fetching nearby stops");
        }

        const radiusMeters = radius ? parseInt(radius) : 1000;

        const query = `SELECT stop_id, stop_name, stop_lon, stop_lat FROM stops
                WHERE ST_DWithin(
                  stop_location::geography, 
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                  $3
                )
                ORDER BY ST_Distance(
                  stop_location::geography,
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                )
                ;`

        const values = [lng, lat, radiusMeters]

        const result = await pool.query(query, values)

        res.json(result.rows)
    }
    catch(err) {
        console.log(err)
        res.status(500).send("Error fetching nearby stops")
    }
}
