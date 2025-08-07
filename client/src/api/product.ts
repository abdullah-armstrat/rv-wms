// client/src/api/product.ts
import { api } from "./auth";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
}

/** Fetch all products */
export async function getProducts(): Promise<Product[]> {
  const res = await api.get<Product[]>("/products");
  return res.data;
}

/** Bulk‐upload a CSV file of products */
export async function uploadProducts(file: File): Promise<{ imported: number }> {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post<{ imported: number }>("/products/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/** Delete a single product by ID */
export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}
