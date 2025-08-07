import { api } from "./auth";

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  country: string;
  manager: string;
  timezone: string;
  logoUrl: string | null;
}

/** Fetch all warehouses */
export async function getWarehouses(): Promise<Warehouse[]> {
  const res = await api.get<Warehouse[]>("/warehouses");
  return res.data;
}

/** Fetch a single warehouse by ID */
export async function getWarehouse(id: number): Promise<Warehouse> {
  const res = await api.get<Warehouse>(`/warehouses/${id}`);
  return res.data;
}

/** Create a new warehouse */
export async function createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
  const res = await api.post<Warehouse>("/warehouses", data);
  return res.data;
}

/** Update an existing warehouse */
export async function updateWarehouse(id: number, data: Partial<Warehouse>): Promise<Warehouse> {
  const res = await api.put<Warehouse>(`/warehouses/${id}`, data);
  return res.data;
}

/** Delete a warehouse */
export async function deleteWarehouse(id: number): Promise<void> {
  await api.delete(`/warehouses/${id}`);
}
