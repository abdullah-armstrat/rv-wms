// client/src/pages/LocationForm.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createLocation, updateLocation, getLocation } from "../api/location";
import type { Location } from "../api/location";
import { getZones } from "../api/zone";
import type { Zone } from "../api/zone";
import { useNavigate, useParams } from "react-router-dom";

export default function LocationForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<Location>();
  const [zones, setZones] = useState<Zone[]>([]);

  // Load available zones
  useEffect(() => {
    getZones().then(setZones).catch(console.error);
  }, []);

  // If editing, preload the location
  useEffect(() => {
    if (isEdit) {
      getLocation(Number(id!)).then((loc) => {
        setValue("code", loc.code);
        setValue("type", loc.type);
        setValue("zoneId", loc.zoneId);
      });
    }
  }, [id, isEdit, setValue]);

  async function onSubmit(data: Location) {
    try {
      if (isEdit) {
        await updateLocation(Number(id!), data);
      } else {
        await createLocation(data);
      }
      navigate("/locations");
    } catch (e) {
      console.error("Failed to save location", e);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Location" : "New Location"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Zone</label>
          <select
            {...register("zoneId", { valueAsNumber: true, required: true })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select a zone</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Type</label>
          <select
            {...register("type", { required: true })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select type</option>
            <option value="SHELF">Shelf</option>
            <option value="BIN">Bin</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Code</label>
          <input
            {...register("code", { required: true })}
            placeholder="e.g. A-1-4 or A-1-4-BIN-2"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/locations")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
