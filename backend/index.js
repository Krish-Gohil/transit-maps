import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import nearbyStops from "./routes/nearbyStops.js";
import etaData from "./routes/etaData.js";
import routingStopsList from "./routes/routingStopsList.js";
import healthCheck from "./routes/healthCheck.js";
dotenv.config()
const app = express()

app.use(cors())
app.use(morgan('dev'));

app.use('/api/stops', nearbyStops)
app.use('/api/eta', etaData)
app.use('/api/health', healthCheck)
    // ?originLat=43.651070&originLon=-79.347015&destinationLat=43.651070&destinationLon=-79.347015
app.use('/api/trips', routingStopsList)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})