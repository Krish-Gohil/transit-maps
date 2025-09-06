import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import nearbyStops from "./routes/nearbyStops.js";
import etaDataController from "./routes/etaDataController.js";
import routingStopsList from "./routes/routingStopsList.js";
import healthCheck from "./routes/healthCheck.js";
dotenv.config()
const app = express()
app.use(cors())

app.use('/api/stops', nearbyStops)
app.use('/api/eta', etaDataController)
app.use('/api/health', healthCheck)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})