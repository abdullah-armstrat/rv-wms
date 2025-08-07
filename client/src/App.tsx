import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import WarehouseList from "./pages/WarehouseList";
import LocationList  from "./pages/LocationList";
import LocationForm  from "./pages/LocationForm";

// **Product pages**
import ProductList    from "./pages/ProductList";
import ProductUpload  from "./pages/ProductUpload";

import InventoryPage  from "./pages/InventoryPage";
import ScanPage       from "./pages/ScanPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />

          {/* Warehouses + Zones */}
          <Route path="warehouses" element={<WarehouseList />} />

          {/* Locations */}
          <Route path="locations" element={<LocationList />} />
          <Route path="locations/new" element={<LocationForm />} />
          <Route path="locations/:id/edit" element={<LocationForm />} />

          {/* Products */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/upload" element={<ProductUpload />} />

          <Route path="inventory" element={<InventoryPage />} />
          <Route path="scan" element={<ScanPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
