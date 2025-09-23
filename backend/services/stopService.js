import {pool} from '../db.js'

export async function getNearbyStops(lat, lon, radius = 500){
    try{
        const query = `
            SELECT stop_id, stop_name,
                   ST_Distance(
                       geography(ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)),
                       geography(ST_SetSRID(ST_MakePoint($1, $2), 4326))
                   ) AS distance_m
            FROM stops
            WHERE ST_DWithin(
                      geography(ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)),
                      geography(ST_SetSRID(ST_MakePoint($1, $2), 4326)),
                      $3
                  )
            ORDER BY distance_m
            `
        const {rows} = await pool.query(query, [lon, lat, radius]);
        return rows;
    }
    catch(err){
        console.error('Failed to get nearby stops:', err);
    }

}