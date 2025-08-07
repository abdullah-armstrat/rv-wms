// client/src/pages/ZoneForm.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createZone, updateZone, getZone } from "../api/zone";
import type { Zone } from "../api/zone";
import { getWarehouses } from "../api/warehouse";
import type { Warehouse } from "../api/warehouse";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ZoneForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<Zone>();
  const user = useAuthStore((s) => s.user);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Load warehouses if admin
  useEffect(() => {
    if (user?.role === "ADMIN") {
      getWarehouses().then(setWarehouses).catch(console.error);
    }
  }, [user]);

  // Preload for edit, or set default for non-admin
  useEffect(() => {
    if (isEdit) {
      getZone(Number(id!)).then((z) => {
        setValue("name", z.name);
        setValue("description", z.description || "");
        setValue("warehouseId", z.warehouseId);
      });
    } else if (user && user.role !== "ADMIN") {
      setValue("warehouseId", user.warehouseId);
    }
  }, [id, isEdit, user, setValue]);

  async function onSubmit(data: Zone) {
    try {
      if (isEdit) {
        await updateZone(Number(id!), data);
      } else {
        await createZone(data);
      }
      navigate("/zones");
    } catch (e) {
      console.error("Failed to save zone", e);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Zone" : "New Zone"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            {...register("name", { required: true })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            {...register("description")}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {user?.role === "ADMIN" ? (
          <div>
            <label className="block mb-1">Warehouse</label>
            <select
              {...register("warehouseId", { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select a warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input
            type="hidden"
            {...register("warehouseId", { valueAsNumber: true })}
          />
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/zones")}
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
