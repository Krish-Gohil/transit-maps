import './App.css'
import InfoPanel from "./components/InfoPanel.jsx";
import MapPanel from "./components/MapPanel.jsx";
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <div className="relative w-screen h-screen">
        <InfoPanel />
        <MapPanel />
    </div>
  )
}

export default App
