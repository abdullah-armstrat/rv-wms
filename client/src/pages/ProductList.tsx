// client/src/pages/ProductList.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../api/product";
import type { Product } from "../api/product";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const list = await getProducts();
      setProducts(list);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch (err) {
      console.error("Failed to delete product", err);
      alert("Could not delete product.");
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          to="/products/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          + Upload CSV
        </Link>
      </div>
      <table className="min-w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Name", "SKU", "Category", "Actions"].map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((p) => (
            <tr key={p.id}>
              <td className="px-6 py-4 whitespace-nowrap">{p.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.sku}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.category}</td>
              <td className="px-6 py-4 whitespace-nowrap space-x-4">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-4 text-center text-gray-500"
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
