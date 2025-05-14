/* RouteScreen.jsx - Updated to use Leaflet with OpenStreetMap */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import polyline from "polyline";
import { Geolocation } from "@capacitor/geolocation";
import { App } from "@capacitor/app";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { Input } from "@nextui-org/react";
import Button from "../pages/button";
import { useNavigate } from "react-router-dom";

import "../styles/RouteScreen.css";

const RouteScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const speak = useCallback(async (text) => {
    try {
      await TextToSpeech.speak({ text, lang: "en-US", rate: 0.9, pitch: 1.2, volume: 1.0 });
    } catch (error) {
      console.error("Text-to-Speech error:", error);
    }
  }, []);

  useEffect(() => {
    const handler = App.addListener("backButton", () => {
      navigate("/screenPage");
    });
    return () => {
      handler.remove();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const position = await Geolocation.getCurrentPosition();
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        speak("Location detected successfully");
      } catch (error) {
        console.error("Geolocation error:", error);
        setError("Unable to get your location");
        speak("Could not detect your location");
      }
    };
    fetchLocation();
  }, [speak]);

  const formatDuration = (minutes) => {
    return minutes >= 60
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
      : `${minutes}m`;
  };

  const getCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      throw new Error("Geocoding failed");
    } catch (error) {
      console.error("Geocoding error:", error);
      setError("Could not find destination coordinates.");
      speak("Could not find your destination.");
      return null;
    }
  };

  const getRoute = async (origin, destination) => {
    setIsLoading(true);
    speak("Calculating your route");
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=polyline`
      );
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) throw new Error("No route found");

      const route = data.routes[0];
      const coordinates = polyline.decode(route.geometry).map(([lat, lng]) => [lat, lng]);
      setRouteCoordinates(coordinates);

      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationText = formatDuration(Math.round(route.duration / 60));
      setRouteDetails({ distance: distanceKm, duration: durationText });

      speak(`Your route is ${distanceKm} kilometers long and will take approximately ${durationText}.`);
    } catch (error) {
      console.error("Routing error:", error);
      setError("Error calculating route");
      speak("Route cannot be calculated. Please check the spelling or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateRoute = async () => {
    if (!currentLocation || !destination) {
      setError("Please enter a destination");
      speak("Please enter a destination");
      return;
    }
    const destinationCoords = await getCoordinates(destination);
    if (destinationCoords) await getRoute(currentLocation, destinationCoords);
  };

  const handleBack = () => navigate("/screenPage");

  return (
    <div className="route-screen">
      {currentLocation && (
        <MapContainer center={currentLocation} zoom={13} scrollWheelZoom={true} className="map-container">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={currentLocation} icon={L.icon({ iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png", iconSize: [38, 38] })} />
          {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} color="#E63946" weight={4} />}
        </MapContainer>
      )}

      <div className="route-content">
        <Input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter your destination"
          fullWidth
          style={{ backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
        />
        <Button onClick={handleCalculateRoute} disabled={isLoading}>
          {isLoading ? "Calculating..." : "Calculate Route"}
        </Button>
        <Button onClick={handleBack} className="back-button">Back</Button>

        {error && <div className="error-message">{error}</div>}

        {routeDetails && (
          <div className="route-summary">
            <p><strong>Distance:</strong> {routeDetails.distance} km</p>
            <p><strong>Duration:</strong> {routeDetails.duration}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteScreen;
