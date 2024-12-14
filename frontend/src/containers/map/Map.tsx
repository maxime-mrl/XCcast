import { useEffect, useRef, useState } from 'react';
// leflet
import "leaflet/dist/leaflet.js";
import "leaflet/dist/leaflet.css";
import L, { LatLng } from 'leaflet';
import "leaflet-geotiff-2/src/leaflet-geotiff";
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

import { GeotiffLayer, TimeSelector } from '@components';
import { useForecastStore } from '@store/useForecastStore';
import './Map.css';

export default function Map() {
  const [baseUrl, setBaseUrl] = useState("");
  const [geotiffs, setGeotiffs] = useState<string[]>([]);

  const userSettings = useForecastStore.use.userSettings();
  const position = useForecastStore.use.position();
  const mapCapabilities = useForecastStore.use.forecastCapabilities();

  useEffect(() => {
    // check that zustand is well initialized
    const dataset = mapCapabilities?.data[userSettings.model].dataset[userSettings.selected].names;
    if (!userSettings.time || userSettings.model === "" || userSettings.selected === "" || !dataset) return;
    // make sur wind direction is at the ends (so it's rendered last)
    const dirIndex = dataset.findIndex(file => /dir/.test(file));
    if (dirIndex !== -1) {
      const [wdir] = dataset.splice(dirIndex, 1);
      dataset.push(wdir);
    }
    
    // Construct base URL
    const newBaseUrl = `${process.env.REACT_APP_API_URL}/map/${userSettings.model}/${userSettings.time.replace(":", "_")}/${userSettings.selected}`;
    // set state if there're updated
    setBaseUrl(prev => (prev !== newBaseUrl ? newBaseUrl : prev));
    setGeotiffs((prev) => (JSON.stringify(prev) !== JSON.stringify(dataset) ? dataset : prev));
  }, [userSettings.time, userSettings.model, userSettings.selected, mapCapabilities]);

  return (
    <div className="map">
      <MapContainer center={[-31, 148]} zoom={7} scrollWheelZoom={true} zoomControl={false}>
          <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Esri Japan, Esri China (Hong Kong), Esri (Thailand), DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />
          { baseUrl !== "" && geotiffs.length !== 0 && geotiffs.map(file => (
            <GeotiffLayer
              renderer={/dir/.test(file) ? "arrows" : "rgb"}
              url={`${baseUrl}/${file}-${userSettings.level}.tif`}
              name={userSettings.selected}
              level={userSettings.level}
              key={file}
            />
          ))
          
        }

          
          {position && 
            <Marker position={position} icon={L.icon({
              iconUrl: "/images/marker.png",
              iconSize: [38, 57],
              iconAnchor: [19, 57],
            })}>
            </Marker>
          }
        <ClickHandler />
      </MapContainer>
      <TimeSelector />  
    </div>
  )
}


function ClickHandler() {
  const position = useForecastStore.use.position();
  const setPosition = useForecastStore.use.setPosition();
  // used to check last position state and only pan when forecast is oppened
  const memoryPos = useRef(false as false | LatLng);
  const map = useMapEvents({});

  // listen for clicks
  map.addEventListener("click", e => setPosition(e.latlng));

  // update map sizing with or without forecast
  useEffect(() => {
    map.invalidateSize();
    if (!memoryPos.current && position) map.panTo(position);
    memoryPos.current = position;
  }, [position, map])

  return null;
}
