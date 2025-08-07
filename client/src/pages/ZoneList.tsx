// client/src/pages/ZoneList.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getZones, deleteZone } from "../api/zone";
import type { Zone } from "../api/zone";
import { useAppStore } from "../store/appStore";

export default function ZoneList() {
  const navigate = useNavigate();
  const selectedWarehouseId = useAppStore((s) => s.selectedWarehouseId);
  const setSelectedZoneId  = useAppStore((s) => s.setSelectedZoneId);

  const [zones, setZones] = useState<Zone[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedWarehouseId) return;
    (async () => {
      try {
        const all = await getZones();
        setZones(all.filter((z) => z.warehouseId === selectedWarehouseId));
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
      }
    })();
  }, [selectedWarehouseId]);

  if (!selectedWarehouseId) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">
          No warehouse selected. Please pick one first.
        </p>
        <button
          onClick={() => navigate("/warehouses")}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Go to Warehouses
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Zones</h1>
        <button
          onClick={() => navigate("/zones/new")}
          className="px-3 py-1.5 border rounded hover:bg-gray-100"
        >
          + New Zone
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {zones.map((z) => (
          <div
            key={z.id}
            onClick={() => {
              setSelectedZoneId(z.id);
              navigate(`/zones/${z.id}`);
            }}
            className="relative p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{z.name}</h2>
            {z.description && (
              <p className="text-gray-600 text-sm">{z.description}</p>
            )}
            <div className="absolute top-3 right-3 flex space-x-1 text-gray-500">
              {/* inline icons for edit/delete omitted for brevity */}
            </div>
            <div className="mt-4 text-blue-600 underline text-sm">
              View Details →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
