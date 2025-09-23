import { pool } from "../db.js";

export const healthCheck = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM agency LIMIT 1");

        res.status(200).json({
            status: "OK",
            message: "Server is running and database is reachable",
            dbSample: result.rows,
        });
    } catch (error) {
        console.error("Health check failed:", error.message);
        res.status(500).json({
            status: "ERROR",
            message: "Server or database connection failed",
            error: error.message,
        });
    }
};
