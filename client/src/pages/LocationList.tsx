// client/src/pages/LocationList.tsx
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiPlus, FiX, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";

import { getWarehouse }                   from "../api/warehouse";
import type { Warehouse }                  from "../api/warehouse";
import { getZone }                        from "../api/zone";
import type { Zone }                       from "../api/zone";
import { getLocations, createLocation }   from "../api/location";
import type { Location }                   from "../api/location";
import {
  getInventoryByLocation,
  type InventoryRow,
} from "../api/inventory";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function LocationList() {
  const navigate    = useNavigate();
  const warehouseId = useAppStore(s => s.selectedWarehouseId);
  const zoneId      = useAppStore(s => s.selectedZoneId);

  // Core data
  const [warehouse, setWarehouse] = useState<Warehouse|null>(null);
  const [zone,      setZone]      = useState<Zone     |null>(null);
  const [locations, setLocations]= useState<Location[]>([]);
  const [invMap,    setInvMap]   = useState<Record<number,InventoryRow[]>>({});
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState<string|null>(null);

  // Inventory modal
  const [viewLoc,    setViewLoc]    = useState<Location|null>(null);
  const [viewInv,    setViewInv]    = useState<InventoryRow[]>([]);
  const [invLoading, setInvLoading] = useState(false);

  // New-location modal
  const [showNew,   setShowNew]   = useState(false);
  const [newCode,   setNewCode]   = useState("");
  const [newType,   setNewType]   = useState<"SHELF"|"BIN">("SHELF");
  const [newError,  setNewError]  = useState<string|null>(null);
  const [creating,  setCreating]  = useState(false);

  // Load initial data
  useEffect(() => {
    if (warehouseId == null || zoneId == null) {
      navigate("/warehouses");
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const [wh, zn, all] = await Promise.all([
          getWarehouse(warehouseId),
          getZone(zoneId),
          getLocations(),
        ]);
        setWarehouse(wh);
        setZone(zn);
        const filtered = all.filter(l => l.zoneId === zoneId);
        setLocations(filtered);

        const rowsArr = await Promise.all(
          filtered.map(l => getInventoryByLocation(l.id).catch(() => []))
        );
        const map: Record<number,InventoryRow[]> = {};
        filtered.forEach((l, i) => (map[l.id] = rowsArr[i]));
        setInvMap(map);
      } catch (e: any) {
        console.error(e);
        setError("Failed to load locations.");
      } finally {
        setLoading(false);
      }
    })();
  }, [warehouseId, zoneId, navigate]);

  const summary = (loc: Location) => {
    const rows = invMap[loc.id] || [];
    const total = rows.reduce((sum, r) => sum + r.quantity, 0);
    const last = rows
      .map(r => new Date(r.updatedAt))
      .filter(d => !isNaN(d.getTime()))
      .sort((a,b) => b.getTime() - a.getTime())[0] || null;
    return { total, last };
  };

  // View inventory
  const openView = async (loc: Location) => {
    setViewLoc(loc);
    setInvLoading(true);
    try {
      const rows = await getInventoryByLocation(loc.id);
      setViewInv(rows);
    } catch {
      setViewInv([]);
    } finally {
      setInvLoading(false);
    }
  };
  const closeView = () => setViewLoc(null);

  // Create location
  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      setNewError("Code is required");
      return;
    }
    setCreating(true);
    try {
      await createLocation({
        code:   newCode.trim(),
        type:   newType,
        zoneId: zoneId!
      });
      // reload list
      const all = await getLocations();
      setLocations(all.filter(l => l.zoneId === zoneId));
      setShowNew(false);
      setNewCode("");
    } catch (e: any) {
      setNewError(e.response?.data?.error || "Could not create");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (error) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-red-600">{error}</p>
        <button onClick={()=>window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
        <button onClick={()=>navigate("/warehouses")} className="flex items-center space-x-1 hover:underline">
          <FiArrowLeft /> <span>Warehouses</span>
        </button>
        <span>/</span>
        <span onClick={()=>navigate("/warehouses")} className="cursor-pointer hover:underline">
          {warehouse?.name}
        </span>
        <span>/</span>
        <span>{zone?.name}</span>
        <span>/</span>
        <span className="font-semibold">Locations</span>
      </nav>

      {/* Header + New */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Locations</h1>
        <button
          onClick={()=>setShowNew(true)}
          className="inline-flex items-center space-x-1 px-4 py-2 border rounded hover:bg-gray-100 transition"
        >
          <FiPlus /> <span>New Location</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {locations.length === 0 && (
          <p className="col-span-full text-center text-gray-500">No locations yet.</p>
        )}
        {locations.map(loc => {
          const { total, last } = summary(loc);
          return (
            <div
              key={loc.id}
              onClick={()=>openView(loc)}
              className="bg-white rounded-xl shadow p-5 flex flex-col justify-between cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition"
            >
              <div>
                <h2 className="text-lg font-semibold truncate">{loc.code}</h2>
                <span className="inline-block mt-2 px-2 py-0.5 text-xs text-gray-600 border rounded">
                  {loc.type}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">{total}</span> items</p>
                {last && (
                  <p>
                    Updated{" "}
                    <span className="text-gray-500">
                      {last.toLocaleDateString()}{" "}
                      {last.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                    </span>
                  </p>
                )}
              </div>
              {loc.qrPath && (
                <img
                  src={`${API_URL}${loc.qrPath}`}
                  alt={`QR for ${loc.code}`}
                  className="mt-4 self-center w-28 h-28 object-contain"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Inventory Modal */}
      {viewLoc && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeView}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-lg">
              <header className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">
                  Inventory — {viewLoc.code}
                </h3>
                <button onClick={closeView} className="text-gray-600 hover:text-gray-800">
                  <FiX size={24} />
                </button>
              </header>
              <div className="p-4 space-y-4">
                <button
                  onClick={()=>openView(viewLoc)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                >
                  <FiRefreshCw /> <span>Reload</span>
                </button>
                {invLoading ? (
                  <p className="text-center">Loading…</p>
                ) : viewInv.length === 0 ? (
                  <p className="text-gray-500">No inventory records.</p>
                ) : (
                  <table className="w-full table-auto text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        {["Product","SKU","Qty","Updated"].map(h => (
                          <th
                            key={h}
                            className="px-3 py-2 text-xs font-medium text-gray-500 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {viewInv.map(r => (
                        <tr key={`${r.locationId}-${r.productId}`} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{r.product.name}</td>
                          <td className="px-3 py-2 text-gray-600">{r.product.sku}</td>
                          <td className="px-3 py-2">{r.quantity}</td>
                          <td className="px-3 py-2">
                            {new Date(r.updatedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* New Location Modal */}
      {showNew && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={()=>setShowNew(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <form
              onSubmit={onCreate}
              className="bg-white rounded-xl w-full max-w-md shadow-lg p-6 space-y-4"
            >
              <header className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">New Location</h3>
                <button onClick={()=>setShowNew(false)} className="text-gray-600 hover:text-gray-800">
                  <FiX size={24} />
                </button>
              </header>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Type</label>
                <select
                  value={newType}
                  onChange={e=>setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="SHELF">Shelf</option>
                  <option value="BIN">Bin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={e=>setNewCode(e.target.value)}
                  placeholder={newType==="SHELF" ? "A-1-3" : "A-1-3-BIN-2"}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              {newError && <p className="text-red-600">{newError}</p>}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={()=>setShowNew(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
