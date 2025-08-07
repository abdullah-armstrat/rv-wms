// client/src/pages/ZoneDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { getZone, deleteZone } from "../api/zone";
import type { Zone } from "../api/zone";
import { getLocations, deleteLocation } from "../api/location";
import type { Location } from "../api/location";

export default function ZoneDetail() {
  const { id } = useParams<{ id: string }>();
  const zoneId = Number(id);
  const nav = useNavigate();

  const [zone, setZone] = useState<Zone | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    (async () => {
      const z = await getZone(zoneId);
      setZone(z);
      const allLocs = await getLocations();
      setLocations(allLocs.filter((l) => l.zoneId === zoneId));
    })();
  }, [zoneId]);

  const handleDeleteZone = async () => {
    if (!confirm("Delete this zone and all its locations?")) return;
    await deleteZone(zoneId);
    nav("/zones");
  };

  const handleDeleteLocation = async (locId: number) => {
    if (!confirm("Delete this location?")) return;
    await deleteLocation(locId);
    setLocations((prev) => prev.filter((l) => l.id !== locId));
  };

  if (!zone) return <p className="p-6">Loading zone…</p>;

  return (
    <div className="p-4 sm:p-6">
      {/* Zone Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{zone.name}</h1>
          {zone.description && (
            <p className="text-gray-500 mt-1">{zone.description}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => nav(`/zones/${zoneId}/edit`)}
            className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
          >
            <FiEdit2 size={16} />
            <span>Edit Zone</span>
          </button>
          <button
            onClick={handleDeleteZone}
            className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
          >
            <FiTrash2 size={16} />
            <span>Delete Zone</span>
          </button>
        </div>
      </div>

      {/* New Location */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold">Locations</h2>
        <button
          onClick={() => nav("/locations/new")}
          className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
        >
          <FiPlus size={16} />
          <span>New Location</span>
        </button>
      </div>

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <p className="text-gray-500">No locations created yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 p-4 cursor-pointer"
            >
              {/* Action Icons */}
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nav(`/locations/${loc.id}/edit`);
                  }}
                  className="p-1 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLocation(loc.id);
                  }}
                  className="p-1 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              {/* Location Code */}
              <h3 className="text-lg font-semibold mb-1">{loc.code}</h3>

              {/* QR Code */}
              {loc.qrPath && (
                <img
                  src={loc.qrPath}
                  alt={`${loc.code} QR`}
                  className="w-20 h-20 mx-auto mb-3"
                />
              )}

              {/* Type Badge */}
              <span className="inline-block px-2 py-0.5 border border-gray-300 text-gray-800 rounded-full text-xs mb-3">
                {loc.type}
              </span>

              {/* Details */}
              <div className="text-gray-600 text-xs space-y-0.5">
                <p>
                  <strong>Row:</strong> {loc.row}
                </p>
                <p>
                  <strong>Bay:</strong> {loc.bay}
                </p>
                <p>
                  <strong>Level:</strong> {loc.level}
                </p>
                {loc.bin && (
                  <p>
                    <strong>Bin:</strong> {loc.bin}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
