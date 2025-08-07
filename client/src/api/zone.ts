import { api } from "./auth";

export interface Zone {
  id: number;
  name: string;
  description?: string;
  warehouseId: number;
}

/** Fetch all zones */
export async function getZones(): Promise<Zone[]> {
  const res = await api.get<Zone[]>("/zones");
  return res.data;
}

/** Fetch a single zone by ID */
export async function getZone(id: number): Promise<Zone> {
  const res = await api.get<Zone>(`/zones/${id}`);
  return res.data;
}

/** Create a new zone */
export async function createZone(data: Partial<Zone>): Promise<Zone> {
  const res = await api.post<Zone>("/zones", data);
  return res.data;
}

/** Update an existing zone */
export async function updateZone(id: number, data: Partial<Zone>): Promise<Zone> {
  const res = await api.put<Zone>(`/zones/${id}`, data);
  return res.data;
}

/** Delete a zone */
export async function deleteZone(id: number): Promise<void> {
  await api.delete(`/zones/${id}`);
}
