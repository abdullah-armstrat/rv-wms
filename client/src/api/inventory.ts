// client/src/api/inventory.ts
import { api } from "./auth";
import type { Product } from "./product";

/**
 * Represents one stock entry at a specific location for a product.
 */
export interface InventoryRow {
  locationId: number;
  productId:  number;
  quantity:   number;
  product:    Product;
  updatedAt:  string;  // ISO timestamp of last change
}

/**
 * Fetch all inventory rows (across all locations & products).
 */
export async function getAllInventoryRows(): Promise<InventoryRow[]> {
  const res = await api.get<InventoryRow[]>("/inventory");
  return res.data;
}

/**
 * Fetch inventory rows for a specific location.
 * @param locationId ID of the location
 */
export async function getInventoryByLocation(
  locationId: number
): Promise<InventoryRow[]> {
  const res = await api.get<InventoryRow[]>("/inventory", {
    params: { locationId },
  });
  return res.data;
}

/**
 * Fetch inventory rows for a specific product.
 * @param productId ID of the product
 */
export async function getInventoryByProduct(
  productId: number
): Promise<InventoryRow[]> {
  const res = await api.get<InventoryRow[]>("/inventory", {
    params: { productId },
  });
  return res.data;
}

/**
 * Adjust the stock for a given location & product by a delta.
 * @param data.locationId ID of the location
 * @param data.productId  ID of the product
 * @param data.change     Quantity to add (positive) or remove (negative)
 */
export async function adjustInventory(data: {
  locationId: number;
  productId:  number;
  change:     number;
}): Promise<InventoryRow[]> {
  const res = await api.post<InventoryRow[]>("/inventory/adjust", data);
  return res.data;
}
