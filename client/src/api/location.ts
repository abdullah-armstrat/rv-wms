import { api } from "./auth";

export interface Location {
  id: number;
  code: string;
  type: string;
  zoneId: number;
  qrPath: string | null;
}

export function getLocations() {
  return api.get<Location[]>("/locations").then(r => r.data);
}

export function getLocation(id: number) {
  return api.get<Location>(`/locations/${id}`).then(r => r.data);
}

export function createLocation(data: Omit<Location, "id" | "qrPath">) {
  return api.post<Location>("/locations", data).then(r => r.data);
}

export function updateLocation(id: number, data: Partial<Location>) {
  return api.put<Location>(`/locations/${id}`, data).then(r => r.data);
}

export function deleteLocation(id: number) {
  return api.delete<void>(`/locations/${id}`);
}
