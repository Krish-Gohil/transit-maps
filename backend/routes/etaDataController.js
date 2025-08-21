import express from 'express';
import {etaData} from "../controllers/etaData.js";

const router = express.Router();

router.get('/', etaData);

export default router