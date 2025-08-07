import React, { useEffect, useState } from "react";
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../api/warehouse";
import type { Warehouse } from "../api/warehouse";

import {
  getZones,
  createZone,
  updateZone,
  deleteZone,
} from "../api/zone";
import type { Zone } from "../api/zone";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function WarehouseList() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  // Global selection store
  const selectedWarehouseId = useAppStore((s) => s.selectedWarehouseId);
  const setSelectedWarehouseId = useAppStore((s) => s.setSelectedWarehouseId);
  const selectedZoneId = useAppStore((s) => s.selectedZoneId);
  const setSelectedZoneId = useAppStore((s) => s.setSelectedZoneId);

  // Local state
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [zones, setZones]           = useState<Zone[]>([]);
  const [error, setError]           = useState<string | null>(null);

  // Modal controls
  const [whModalOpen, setWhModalOpen] = useState(false);
  const [whEdit, setWhEdit]           = useState<Warehouse | null>(null);
  const [whName, setWhName]           = useState("");
  const [whCountry, setWhCountry]     = useState("");

  const [znModalOpen, setZnModalOpen] = useState(false);
  const [znEdit, setZnEdit]           = useState<Zone | null>(null);
  const [znName, setZnName]           = useState("");
  const [znDesc, setZnDesc]           = useState("");

  // Load data
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => {
    if (token) refreshAll();
  }, [token]);

  async function refreshAll() {
    try {
      const ws = await getWarehouses();
      setWarehouses(ws);
      if (ws.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(ws[0].id);
      }
      const zs = await getZones();
      setZones(zs);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    }
  }

  // Warehouse CRUD
  function openNewWh() {
    setWhEdit(null);
    setWhName("");
    setWhCountry("");
    setWhModalOpen(true);
  }
  function openEditWh(w: Warehouse) {
    setWhEdit(w);
    setWhName(w.name);
    setWhCountry(w.country);
    setWhModalOpen(true);
  }
  function closeWh() {
    setWhModalOpen(false);
    setWhEdit(null);
  }
  async function saveWh() {
    const payload = { name: whName, country: whCountry };
    if (whEdit) await updateWarehouse(whEdit.id, payload);
    else       await createWarehouse(payload);
    closeWh();
    refreshAll();
  }

  // Zone CRUD
  function openNewZn() {
    setZnEdit(null);
    setZnName("");
    setZnDesc("");
    setZnModalOpen(true);
  }
  function openEditZn(z: Zone) {
    setZnEdit(z);
    setZnName(z.name);
    setZnDesc(z.description || "");
    setZnModalOpen(true);
  }
  function closeZn() {
    setZnModalOpen(false);
    setZnEdit(null);
  }
  async function saveZn() {
    if (!selectedWarehouseId) return;
    const payload = {
      name:        znName,
      description: znDesc,
      warehouseId: selectedWarehouseId,
    };
    if (znEdit) await updateZone(znEdit.id, payload);
    else        await createZone(payload);
    closeZn();
    refreshAll();
  }

  // Toast helper
  function toast(msg: string) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className = `
      fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded
      shadow-lg animate-fade-in-out
    `;
    document.body.appendChild(el);
    setTimeout(() => {
      el.classList.add("opacity-0");
      setTimeout(() => document.body.removeChild(el), 500);
    }, 2000);
  }

  // Select zone
  const filteredZones = zones.filter((z) => z.warehouseId === selectedWarehouseId);
  const handleSelectZone = () => {
    const z = filteredZones.find((z) => z.id === selectedZoneId);
    if (z) toast(`Zone "${z.name}" selected!`);
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Warehouses */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <button
            onClick={openNewWh}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <FiPlus /> <span>New Warehouse</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {warehouses.map((w) => (
            <div
              key={w.id}
              onClick={() => {
                setSelectedWarehouseId(w.id);
                setSelectedZoneId(null);
              }}
              className={`
                flex-1 min-w-[12rem] p-4 rounded border cursor-pointer
                ${selectedWarehouseId === w.id
                  ? "border-blue-600 bg-blue-50 shadow"
                  : "border-gray-200 bg-white hover:shadow-sm"}
              `}
            >
              <div className="flex justify-between items-start">
                <h2 className="font-semibold text-lg">{w.name}</h2>
                <div className="flex space-x-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditWh(w); }}
                    className="p-1 text-gray-600 hover:text-gray-800">
                    <FiEdit2 />
                  </button>
                  <button onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm("Delete this warehouse?")) {
                          await deleteWarehouse(w.id);
                          refreshAll();
                        }
                      }}
                    className="p-1 text-red-600 hover:text-red-800">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <p className="text-gray-500">{w.country}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Zones */}
      {selectedWarehouseId && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Zones in {warehouses.find((w) => w.id === selectedWarehouseId)?.name}
            </h2>
            <button
              onClick={openNewZn}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              <FiPlus /> <span>New Zone</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredZones.map((z) => (
              <div
                key={z.id}
                onClick={() => setSelectedZoneId(z.id)}
                className={`
                  p-4 rounded border flex justify-between items-center cursor-pointer
                  ${selectedZoneId === z.id
                    ? "border-green-600 bg-green-50 shadow"
                    : "border-gray-200 bg-white hover:shadow-sm"}
                `}
              >
                <span>{z.name}</span>
                <div className="flex space-x-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditZn(z); }}
                    className="p-1 text-gray-600 hover:text-gray-800">
                    <FiEdit2 />
                  </button>
                  <button onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm("Delete this zone?")) {
                          await deleteZone(z.id);
                          refreshAll();
                        }
                      }}
                    className="p-1 text-red-600 hover:text-red-800">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Select Zone */}
      {selectedWarehouseId && selectedZoneId && (
        <div className="text-right">
          <button
            onClick={handleSelectZone}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Select Zone
          </button>
        </div>
      )}

      {/* Warehouse Modal */}
      {whModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {whEdit ? "Edit Warehouse" : "New Warehouse"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700">Country</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={whCountry}
                  onChange={(e) => setWhCountry(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={closeWh} className="px-4 py-2 border rounded hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={saveWh} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone Modal */}
      {znModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {znEdit ? "Edit Zone" : "New Zone"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={znName}
                  onChange={(e) => setZnName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={znDesc}
                  onChange={(e) => setZnDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={closeZn} className="px-4 py-2 border rounded hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={saveZn} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
);
}
