import './App.css'
import InfoPanel from "./components/InfoPanel.jsx";
import MapPanel from "./components/MapPanel.jsx";
import 'leaflet/dist/leaflet.css';
import {useEffect} from "react";

function App() {


    // useEffect(() => {
    //     fetch('http://localhost:3000/api/stops')
    //         .then(res => {
    //             if (!res.ok) throw new Error(`Network response was not ok while getting nearby stops (status ${res.status})`);
    //             return res.json()
    //         })
    //         .then(data => {
    //             console.log(data)
    //         })
    //         .catch(err => console.log(err))
    // })

  return (
    <div className="relative w-screen h-screen">
        <InfoPanel />
        <MapPanel />
    </div>
  )
}

export default App
