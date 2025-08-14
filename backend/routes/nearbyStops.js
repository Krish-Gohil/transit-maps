import express from 'express'
import {getAllStops} from "../controllers/nearbyStops.js";

const router = express.Router();

router.get('/', getAllStops);

export default router;