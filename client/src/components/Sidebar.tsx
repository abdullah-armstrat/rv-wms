import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard",  to: "/" },
  { label: "Warehouses", to: "/warehouses" },
  { label: "Zones",      to: "/zones"      },
  { label: "Locations",  to: "/locations"  },
  { label: "Products",   to: "/products"   },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 w-64 bg-blue-800 text-white">
      <div className="p-4 text-xl font-bold">Warehouse App</div>
      <nav className="flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`block px-4 py-2 hover:bg-blue-700 ${
              pathname === item.to ? "bg-blue-900" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
