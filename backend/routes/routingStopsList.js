import express from 'express';
import {trips} from "../controllers/trips.js";
const router = express.Router();

router.get('/', trips)

export default router;