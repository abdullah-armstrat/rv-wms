// client/src/pages/LocationDetail.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInventory, adjustInventory } from "../api/inventory";
import type { InventoryRow } from "../api/inventory";
import { getProducts } from "../api/product";
import type { Product } from "../api/product";
import { getLocation } from "../api/location";
import type { Location } from "../api/location";

const CATEGORY_MAP: Record<string, string> = {
  CON: "Console",
  HAN: "Handheld",
  ACC: "Accessory",
  GAM: "Game",
};

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>();
  const locId = Number(id!);

  const [location, setLocation] = useState<Location | null>(null);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getLocation(locId).then(setLocation).catch(console.error);
    loadInventory();
  }, [locId]);

  useEffect(() => {
    if (category) {
      getProducts()
        .then((all) =>
          all.filter(
            (p) =>
              p.category === category &&
              p.name.toLowerCase().includes(search.toLowerCase())
          )
        )
        .then(setProducts)
        .catch(console.error);
    }
  }, [category, search]);

  function loadInventory() {
    getInventory(locId)
      .then(setInventory)
      .catch(console.error);
  }

  async function onAdjust(productId: number, change: number) {
    await adjustInventory({ locationId: locId, productId, change });
    loadInventory();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Location: {location?.code}
      </h1>

      {/* Category tiles */}
      <div className="flex space-x-4 mb-6">
        {Object.entries(CATEGORY_MAP).map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setSearch("");
            }}
            className={`px-4 py-2 rounded ${
              category === cat ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {category && (
        <div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded mb-4 w-full"
          />

          <table className="min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">SKU</th>
                <th className="px-6 py-3 text-left">Qty</th>
                <th className="px-6 py-3 text-left">Adjust</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((p) => {
                const row = inventory.find((r) => r.productId === p.id);
                return (
                  <tr key={p.id}>
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4">{p.sku}</td>
                    <td className="px-6 py-4">{row?.quantity ?? 0}</td>
                    <td className="px-6 py-4">
                      <input
                        id={`qty-${p.id}`}
                        type="number"
                        placeholder="+/- qty"
                        className="border px-2 py-1 w-20 mr-2"
                      />
                      <button
                        onClick={() => {
                          const val = Number(
                            (document.getElementById(
                              `qty-${p.id}`
                            ) as HTMLInputElement).value
                          );
                          if (!val) return alert("Enter a nonzero value");
                          onAdjust(p.id, val);
                        }}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Validate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
