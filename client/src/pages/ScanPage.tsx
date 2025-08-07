// client/src/pages/ScanPage.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCamera,
  FiType,
  FiArrowLeft,
  FiRefreshCw,
  FiPlus,
  FiMinus,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { getLocations } from "../api/location";
import type { Location } from "../api/location";
import {
  getInventoryByLocation,
  adjustInventory,
  type InventoryRow,
} from "../api/inventory";
import { getProducts } from "../api/product";
import type { Product } from "../api/product";

const CATEGORIES = [
  { code: "HAN", label: "Handheld" },
  { code: "CON", label: "Console" },
  { code: "ACC", label: "Accessory" },
  { code: "GAM", label: "Game" },
];

export default function ScanPage() {
  const navigate = useNavigate();

  // --- State ---
  const [mode, setMode] = useState<"none" | "manual">("none");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [location, setLocation] = useState<Location | null>(null);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);

  // inline add-product
  const [products, setProducts] = useState<Product[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);
  const [qty, setQty] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // local quantity adjustments
  const [changes, setChanges] = useState<Record<string, number>>({});

  // --- Helpers ---
  // reload inventory for a scanned location
  const loadInventory = useCallback(async (loc: Location) => {
    setScanning(true);
    const start = Date.now();
    try {
      const inv = await getInventoryByLocation(loc.id);
      setInventory(inv);
    } catch {
      setError("Failed to load inventory");
    } finally {
      const elapsed = Date.now() - start;
      setTimeout(
        () => setScanning(false),
        Math.max(0, 1500 - elapsed)
      );
    }
  }, []);

  // main scan logic
  const doScan = useCallback(
    async (scanCode: string) => {
      setError(null);
      setLocation(null);
      setInventory([]);
      setAdding(false);
      setSelectedCat(null);
      setSelectedProd(null);
      setQty("");
      setSearchTerm("");
      setChanges({});

      setScanning(true);
      const start = Date.now();
      try {
        const all = await getLocations();
        const loc = all.find((l) => l.code === scanCode.trim());
        if (!loc) throw new Error("Location not found");
        setLocation(loc);
        await loadInventory(loc);
      } catch (e: any) {
        setError(e.message);
        const elapsed = Date.now() - start;
        setTimeout(
          () => setScanning(false),
          Math.max(0, 1500 - elapsed)
        );
      }
    },
    [loadInventory]
  );

  // buffer ref for global scan input
  const doScanRef = useRef(doScan);
  doScanRef.current = doScan;

  useEffect(() => {
    // Global key capture for scanners
    const buffer: { str: string } = { str: "" };
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const code = buffer.str;
        buffer.str = "";
        if (code) {
          doScanRef.current(code);
        }
      } else if (e.key.length === 1) {
        buffer.str += e.key;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // preload products
  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  // manual scan
  const [manualCode, setManualCode] = useState("");
  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doScan(manualCode);
  };

  // add-product inline
  const startAdd = () => {
    setAdding(true);
    setSelectedCat(null);
    setSearchTerm("");
    setSelectedProd(null);
    setQty("");
    setAddError(null);
  };
  const validateAdd = async () => {
    if (!location || !selectedProd) return;
    const q = Number(qty);
    if (!Number.isInteger(q) || q <= 0) {
      setAddError("Enter a positive integer");
      return;
    }
    try {
      await adjustInventory({
        locationId: location.id,
        productId: selectedProd.id,
        change: q,
      });
      await loadInventory(location);
      setAdding(false);
    } catch {
      setAddError("Failed to add product");
    }
  };

  // filter products by category + search
  const filtered = selectedCat
    ? products.filter(
        (p) =>
          p.category === selectedCat &&
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // local delta updates
  const changeQty = (row: InventoryRow, delta: number) => {
    const key = `${row.locationId}-${row.productId}`;
    setChanges((chgs) => ({
      ...chgs,
      [key]: (chgs[key] || 0) + delta,
    }));
  };

  // commit/cancel local changes
  const commitChanges = async () => {
    if (!location) return;
    for (const [key, delta] of Object.entries(changes)) {
      const [locId, prodId] = key.split("-");
      await adjustInventory({
        locationId: Number(locId),
        productId: Number(prodId),
        change: delta,
      });
    }
    setChanges({});
    await loadInventory(location);
  };
  const cancelChanges = () => setChanges({});

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center p-4 bg-white shadow">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Scan Location</h1>
      </div>

      {/* Before scan: camera/manual side options */}
      {!location && !scanning && (
        <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow space-y-4">
          {error && (
            <p className="text-red-600 text-center">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() =>
                window.prompt("Scan or enter code:")?.trim() &&
                doScanRef.current(
                  window.prompt("Scan or enter code:")!.trim()
                )
              }
              className="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              <FiCamera size={20} /> <span>Camera</span>
            </button>
            <button
              onClick={() => setMode("manual")}
              className="flex items-center justify-center space-x-2 p-4 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              <FiType size={20} /> <span>Manual</span>
            </button>
          </div>
          {mode === "manual" && (
            <form
              onSubmit={onManualSubmit}
              className="mt-4 space-y-2"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) =>
                  setManualCode(e.target.value)
                }
                placeholder="Enter code…"
                className="w-full px-3 py-2 border rounded"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
              >
                Scan
              </button>
            </form>
          )}
        </div>
      )}

      {/* Spinner */}
      {scanning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
        </div>
      )}

      {/* After scan: show location info */}
      {location && !scanning && (
        <div className="max-w-3xl mx-auto mt-8 space-y-6">
          {/* Location header */}
          <div className="p-6 bg-white rounded shadow flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">
                {location.code}
              </h2>
              {location.description && (
                <p className="text-gray-500">
                  {location.description}
                </p>
              )}
            </div>
            <button
              onClick={() => loadInventory(location)}
              title="Refresh"
              className="text-gray-600 hover:text-gray-800"
            >
              <FiRefreshCw size={24} />
            </button>
          </div>

          {/* Add Product inline */}
          {!adding ? (
            <button
              onClick={startAdd}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded text-lg"
            >
              <FiPlus className="inline mr-2" /> Add Product
            </button>
          ) : (
            <div className="space-y-4 bg-white p-4 rounded shadow">
              {!selectedCat ? (
                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => setSelectedCat(code)}
                      className="py-4 bg-gray-100 hover:bg-gray-200 rounded text-center"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : !selectedProd ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Search…"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <div className="max-h-48 overflow-auto space-y-2">
                    {filtered.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProd(p)}
                        className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        <div className="font-semibold">
                          {p.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {p.sku}
                        </div>
                      </button>
                    ))}
                    {!filtered.length && (
                      <p className="text-center text-gray-500">
                        No products
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    {selectedProd.name}{" "}
                    <span className="text-sm text-gray-500">
                      ({selectedProd.sku})
                    </span>
                  </p>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) =>
                      setQty(e.target.value)
                    }
                    placeholder="Quantity"
                    className="w-full px-3 py-2 border rounded"
                  />
                  {addError && (
                    <p className="text-red-600">{addError}</p>
                  )}
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setAdding(false)}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={validateAdd}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      <FiCheck className="inline mr-1" />{" "}
                      Validate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inventory list with local deltas */}
          <div className="space-y-4">
            {inventory.map((row) => {
              const key = `${row.locationId}-${row.productId}`;
              const delta = changes[key] || 0;
              const displayQty = row.quantity + delta;
              return (
                <div
                  key={key}
                  className="card-hover flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">
                      {row.product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {row.product.sku}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">
                      {displayQty}
                    </span>
                    <button
                      onClick={() =>
                        changeQty(row, +1)
                      }
                      className="p-2 bg-blue-100 text-blue-600 rounded"
                    >
                      <FiPlus />
                    </button>
                    <button
                      onClick={() =>
                        changeQty(row, -1)
                      }
                      className="p-2 bg-red-100 text-red-600 rounded"
                    >
                      <FiMinus />
                    </button>
                  </div>
                </div>
              );
            })}
            {inventory.length === 0 && (
              <p className="text-center text-gray-500">
                No products in this location.
              </p>
            )}
          </div>

          {/* Validate / Cancel bar */}
          {Object.values(changes).some((d) => d !== 0) && (
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow flex justify-end space-x-4">
              <button
                onClick={cancelChanges}
                className="px-4 py-2 border rounded flex items-center space-x-1"
              >
                <FiX /> <span>Cancel Changes</span>
              </button>
              <button
                onClick={commitChanges}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center space-x-1"
              >
                <FiCheck /> <span>Validate Changes</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
