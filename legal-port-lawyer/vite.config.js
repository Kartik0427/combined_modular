import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // or your specific framework plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This is optional and exposes the server to the network
    strictPort: true,
    port: 5173, // This is the default port
    // Add the following lines
    hmr: {
      clientPort: 443,
    },
    // To allow your Replit host
    allowedHosts: [".replit.dev"],
  },
});
