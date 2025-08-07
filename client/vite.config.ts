import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy any request starting with /qrcodes to your backend
      "/qrcodes": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path) => path,      
        // i.e. /qrcodes/xyz.png → http://localhost:4000/qrcodes/xyz.png
      },
    },
  },
});
