import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Filter, AlertTriangle, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { WorkforceLocation } from '../types';

// Custom leaflet icon setup
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

export const RadarPage: React.FC = () => {
  const [locations, setLocations] = useState<WorkforceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<WorkforceLocation | null>(null);

  const [locationFilter, setLocationFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkforceRadar();
      setLocations(res);
      if (res.length > 0) setSelectedLocation(res[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const getGapColor = (shortageLevel: string) => {
    if (shortageLevel === 'LOW') return '#22c55e'; // Green
    if (shortageLevel === 'MEDIUM') return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const filteredLocations = locations.filter((loc) => {
    if (locationFilter !== 'All' && loc.city !== locationFilter) return false;
    if (skillFilter !== 'All' && !loc.top_skills.includes(skillFilter)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Map Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-indigo-400" /> Interactive Workforce Gap Radar Map
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Map regional talent availability, job demand, and skill shortage indexes globally.
          </p>
        </div>

        {/* Filters & Legend (Prompt Spec Legend: 🟢 Low 🟠 Medium 🔴 High) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Gap Legend:</span>
            <span className="text-emerald-400 flex items-center gap-1">🟢 Low</span>
            <span className="text-amber-400 flex items-center gap-1">🟠 Medium</span>
            <span className="text-red-400 flex items-center gap-1">🔴 High</span>
          </div>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="All">All Tech Hubs</option>
            {locations.map((l) => (
              <option key={l.id} value={l.city}>
                {l.city}, {l.country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Panel (Prompt Spec #21) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-3 rounded-3xl h-[460px] relative overflow-hidden shadow-2xl">
          {loading ? (
            <div className="h-full flex items-center justify-center text-indigo-400 text-xs font-semibold gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Rendering geospatial radar map...
            </div>
          ) : (
            <MapContainer
              center={[20.0, 15.0]}
              zoom={2}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', borderRadius: '1.25rem' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {filteredLocations.map((loc) => {
                const color = getGapColor(loc.skill_shortage_level);
                return (
                  <Marker
                    key={loc.id}
                    position={[loc.latitude, loc.longitude]}
                    icon={createMarkerIcon(color)}
                    eventHandlers={{
                      click: () => setSelectedLocation(loc),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1">
                        <strong className="text-sm block">{loc.city}, {loc.country}</strong>
                        <div className="text-xs">Job Demand: <strong>{loc.job_demand_level}</strong></div>
                        <div className="text-xs">Skill Gap: <strong>{loc.skill_shortage_level}</strong></div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Selected Region Detailed Metrics (Prompt Spec #21 Example: Cloud Demand HIGH, Talent Availability MEDIUM) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedLocation ? `${selectedLocation.city}, ${selectedLocation.country}` : 'Select a Hub'}
                </h3>
                <p className="text-xs text-slate-400">Workforce Intelligence Analysis</p>
              </div>
              {selectedLocation && (
                <span
                  className="text-xs font-extrabold px-3 py-1 rounded-full border"
                  style={{
                    color: getGapColor(selectedLocation.skill_shortage_level),
                    borderColor: getGapColor(selectedLocation.skill_shortage_level) + '40',
                    backgroundColor: getGapColor(selectedLocation.skill_shortage_level) + '15',
                  }}
                >
                  {selectedLocation.skill_shortage_level} GAP
                </span>
              )}
            </div>

            {selectedLocation && (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Job Demand
                  </span>
                  <span className="font-extrabold text-white">{selectedLocation.job_demand_level}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" /> Talent Availability
                  </span>
                  <span className="font-extrabold text-white">{selectedLocation.talent_availability_level}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Skill Shortage
                  </span>
                  <span className="font-extrabold text-amber-400">{selectedLocation.skill_shortage_level}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Future Demand Forecast
                  </span>
                  <span className="font-extrabold text-purple-400">{selectedLocation.future_demand_level}</span>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 font-semibold block mb-2">High Demand Skills in Region</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLocation.top_skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
