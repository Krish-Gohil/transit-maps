import express from 'express';
import {routingStopsList} from "../controllers/routingStopsList.js";
const router = express.Router();

router.get('/', routingStopsList)

export default router;