import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";

const NAV_ITEMS = [
  { label: "Dashboard",  to: "/"          },
  { label: "Warehouses", to: "/warehouses" },
  // Removed the old “Zones” link:
  { label: "Locations",  to: "/locations" },
  { label: "Products",   to: "/products"  },
  { label: "Inventory",  to: "/inventory"  },
  { label: "Scan",       to: "/scan"       },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname }    = useLocation();
  const navigate        = useNavigate();
  const clearAuth       = useAuthStore((s) => s.clearAuth);

  // allow “Esc” to close mobile sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 bg-blue-800 text-white z-30
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 text-xl font-bold">Warehouse App</div>
        <nav className="flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 hover:bg-blue-700 ${
                pathname === to ? "bg-blue-900" : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 border-t border-blue-700 hover:bg-blue-700"
        >
          <FiLogOut className="mr-2" /> Logout
        </button>
      </aside>

      {/* Overlay when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-25 z-20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-white border-b px-4 py-2 z-10">
          {/* Hamburger toggle */}
          <button
            className="text-gray-600"
            onClick={() => setOpen((o) => !o)}
          >
            <FiMenu size={24} />
          </button>

          {/* Page title */}
          <h1 className="text-xl font-semibold">
            {NAV_ITEMS.find((i) => i.to === pathname)?.label || "Dashboard"}
          </h1>

          {/* Logout */}
          <button
            className="flex items-center text-gray-600 hover:text-gray-800"
            onClick={logout}
          >
            <FiLogOut size={20} className="mr-1" /> Logout
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
