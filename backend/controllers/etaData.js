import {pool} from '../db.js'

export const etaData = async (req, res) => {
    try{

        const {stop_id} = req.query;
        if(!stop_id){
            return res.status(400).json("Missing stop_id query param")
        }

        const query = `SELECT 
                s.trip_id,s.stop_id,
                t.trip_headsign AS bus_name,
                (
                    (split_part(s.arrival_time, ':', 1)::int * 60 +
                     split_part(s.arrival_time, ':', 2)::int +
                     split_part(s.arrival_time, ':', 3)::int / 60.0) 
                    - (EXTRACT(EPOCH FROM CURRENT_TIME)::int / 60.0)
                )::int AS mins_from_now
            FROM stop_times s
            JOIN trips t ON s.trip_id = t.trip_id
            WHERE s.stop_id = $1
              AND (
                (split_part(s.arrival_time, ':', 1)::int * 3600 +
                 split_part(s.arrival_time, ':', 2)::int * 60 +
                 split_part(s.arrival_time, ':', 3)::int)
                > EXTRACT(EPOCH FROM CURRENT_TIME)::int
              )
            ORDER BY mins_from_now
            LIMIT 3;`

        const result =  await pool.query(query, [stop_id])
        res.json(result.rows)
    }
    catch(err){
        console.log(err)
        res.status(500).send("Error calculating eta from stop_id")
    }
}