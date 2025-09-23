import { pool } from '../db.js';
import { getNearbyStops } from "../services/stopService.js";

export const trips = async (req, res) => {
    const { originLat, originLon, destinationLat, destinationLon } = req.query;

    if (!originLon || !destinationLon || !originLat || !destinationLat) {
        return res.status(400).json({ error: "Origin or destination co-ordinates not found" });
    }

    try {
        const originStops = await getNearbyStops(parseFloat(originLat), parseFloat(originLon));
        const destinationStops = await getNearbyStops(parseFloat(destinationLat), parseFloat(destinationLon));

        if (originStops.length === 0 || destinationStops.length === 0) {
            return res.json([]);
        }

        // The query now accepts JSON arrays of the full stop objects
        const query = `
            WITH OriginStops AS (
                -- 1. Unnest the JSON input of origin stops into a temporary table
                SELECT stop_id, distance_m FROM jsonb_to_recordset($1) AS x(stop_id text, distance_m float)
            ),
                 DestinationStops AS (
                     -- 2. Do the same for destination stops
                     SELECT stop_id, distance_m FROM jsonb_to_recordset($2) AS x(stop_id text, distance_m float)
                 ),
                 RankedConnections AS (
                     -- 3. Find all valid trips and rank them by distance
                     SELECT
                         t.trip_id,
                         r.route_short_name,
                         r.route_long_name,
                         t.trip_headsign,
                         origin_st.stop_sequence AS origin_sequence,
                         destination_st.stop_sequence AS destination_sequence,
                         -- This ROW_NUMBER() function is the key. It finds the best trip for each route.
                         ROW_NUMBER() OVER(
                             PARTITION BY r.route_id, t.trip_headsign
                             ORDER BY os.distance_m ASC, ds.distance_m ASC
                             ) as rn
                     FROM
                         stop_times AS origin_st
                             JOIN stop_times AS destination_st ON origin_st.trip_id = destination_st.trip_id
                             JOIN OriginStops AS os ON os.stop_id = origin_st.stop_id
                             JOIN DestinationStops AS ds ON ds.stop_id = destination_st.stop_id
                             JOIN trips AS t ON t.trip_id = origin_st.trip_id
                             JOIN routes AS r ON r.route_id = t.route_id
                     WHERE
                         origin_st.stop_sequence < destination_st.stop_sequence
                 )
            -- 4. Build the path ONLY for the best-ranked trips (rn = 1)
            SELECT
                rc.route_short_name,
                rc.route_long_name,
                rc.trip_headsign,
                jsonb_agg(
                        jsonb_build_object(
                                'stop_id', s.stop_id,
                                'stop_name', s.stop_name,
                                'stop_lat', s.stop_lat,
                                'stop_lon', s.stop_lon
                        ) ORDER BY st.stop_sequence
                ) AS path
            FROM
                RankedConnections rc
                    JOIN
                stop_times st ON rc.trip_id = st.trip_id
                    JOIN
                stops s ON s.stop_id = st.stop_id
            WHERE
                rc.rn = 1 -- Select only the #1 ranked trip for each route
              AND st.stop_sequence BETWEEN rc.origin_sequence AND rc.destination_sequence
            GROUP BY
                rc.route_short_name, rc.route_long_name, rc.trip_headsign;
        `;

        // Pass the arrays as stringified JSON to the query
        const { rows } = await pool.query(query, [
            JSON.stringify(originStops),
            JSON.stringify(destinationStops)
        ]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while finding trips." });
    }
};