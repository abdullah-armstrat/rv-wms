// client/src/pages/WarehouseForm.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  createWarehouse,
  updateWarehouse,
  getWarehouse,
} from "../api/warehouse";
import type { Warehouse } from "../api/warehouse";
import { useNavigate, useParams } from "react-router-dom";

export default function WarehouseForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<Warehouse>();

  useEffect(() => {
    if (isEdit) {
      getWarehouse(Number(id!)).then((w) => {
        setValue("name", w.name);
        setValue("address", w.address);
        setValue("country", w.country);
        setValue("timezone", w.timezone);
        setValue("manager", w.manager);
        setValue("logoUrl", w.logoUrl || "");
      });
    }
  }, [id, isEdit, setValue]);

  async function onSubmit(data: Warehouse) {
    try {
      if (isEdit) {
        await updateWarehouse(Number(id!), data);
      } else {
        await createWarehouse(data);
      }
      navigate("/warehouses");
    } catch (e) {
      console.error("Failed to save warehouse", e);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Warehouse" : "New Warehouse"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          { label: "Name", name: "name" },
          { label: "Address", name: "address" },
          { label: "Country", name: "country" },
          { label: "Timezone", name: "timezone" },
          { label: "Manager", name: "manager" },
          { label: "Logo URL", name: "logoUrl" },
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="block mb-1">{label}</label>
            <input
              {...register(name as keyof Warehouse, {
                required: name !== "logoUrl",
              })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ))}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/warehouses")}
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
