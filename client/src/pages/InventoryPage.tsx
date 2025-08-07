// client/src/pages/InventoryPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { useAppStore } from "../store/appStore";

import { getWarehouse } from "../api/warehouse";
import type { Warehouse } from "../api/warehouse";
import { getZone } from "../api/zone";
import type { Zone } from "../api/zone";
import { getLocations } from "../api/location";
import type { Location } from "../api/location";
import {
  getInventoryByLocation,
  type InventoryRow,
} from "../api/inventory";

export default function InventoryPage() {
  const navigate = useNavigate();
  const warehouseId = useAppStore((s) => s.selectedWarehouseId);
  const zoneId      = useAppStore((s) => s.selectedZoneId);

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [zone, setZone]           = useState<Zone | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [invMap, setInvMap]       = useState<Record<number, InventoryRow[]>>({});
  const [error, setError]         = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Load data
  useEffect(() => {
    if (warehouseId == null || zoneId == null) {
      navigate("/warehouses");
      return;
    }
    (async () => {
      try {
        const [wh, zn, allLocs] = await Promise.all([
          getWarehouse(warehouseId),
          getZone(zoneId),
          getLocations(),
        ]);
        setWarehouse(wh);
        setZone(zn);

        const locs = allLocs.filter((l) => l.zoneId === zoneId);
        setLocations(locs);

        const map: Record<number, InventoryRow[]> = {};
        await Promise.all(
          locs.map(async (l) => {
            try {
              map[l.id] = await getInventoryByLocation(l.id);
            } catch {
              map[l.id] = [];
            }
          })
        );
        setInvMap(map);
      } catch (e: any) {
        console.error(e);
        setError("Failed to load inventory. Please try again.");
      }
    })();
  }, [warehouseId, zoneId]);

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }
  if (!warehouse || !zone) {
    return <p className="p-6 text-center">Loading…</p>;
  }

  // filter helper
  const matchesSearch = (row: InventoryRow) => {
    const term = searchTerm.toLowerCase();
    return (
      row.product.name.toLowerCase().includes(term) ||
      row.product.sku.toLowerCase().includes(term)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 flex items-center space-x-2">
        <button
          onClick={() => navigate("/warehouses")}
          className="flex items-center space-x-1 hover:underline"
        >
          <FiArrowLeft /> <span>Warehouses</span>
        </button>
        <span>/</span>
        <span
          onClick={() => navigate("/warehouses")}
          className="cursor-pointer hover:underline"
        >
          {warehouse.name}
        </span>
        <span>/</span>
        <span
          onClick={() => navigate("/locations")}
          className="cursor-pointer hover:underline"
        >
          {zone.name}
        </span>
        <span>/</span>
        <span className="font-medium">Inventory</span>
      </nav>

      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Inventory by Location</h1>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search product or SKU…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Sections */}
      {locations.length === 0 ? (
        <p className="text-gray-500">No locations in this zone.</p>
      ) : (
        locations.map((loc) => {
          const allRows = invMap[loc.id] || [];
          const rows = searchTerm
            ? allRows.filter(matchesSearch)
            : allRows;
          if (rows.length === 0) return null;

          return (
            <section key={loc.id} className="space-y-2">
              <h2 className="text-xl font-semibold">{loc.code}</h2>
              <div className="overflow-auto rounded-lg border">
                <table className="min-w-full table-auto divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Product", "SKU", "Qty", "Last Updated"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((r) => (
                      <tr key={`${r.productId}-${loc.id}`}>
                        <td className="px-4 py-2">{r.product.name}</td>
                        <td className="px-4 py-2">{r.product.sku}</td>
                        <td className="px-4 py-2">{r.quantity}</td>
                        <td className="px-4 py-2">
                          {new Date(r.updatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}

      {/* No results */}
      {searchTerm &&
        locations.every((loc) => {
          const rows = invMap[loc.id] || [];
          return rows.filter(matchesSearch).length === 0;
        }) && (
          <p className="text-center text-gray-500">
            No matching inventory for “{searchTerm}”.
          </p>
        )}
    </div>
  );
}
