import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8082, // Changed from 8080 to 8082 to avoid conflicts
      strictPort: false, // Allow Vite to try another port if 8082 is in use
    },
    preview: {
      port: 8082, // Changed from 8080 to 8082 to avoid conflicts
      host: "::",
      strictPort: false, // Allow Vite to try another port if 8082 is in use
    },
    base: "/",
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['plogo.png', 'offline.html'],
        manifest: false, // We're using our custom manifest.json
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.deepseek\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
              },
            },
            {
              urlPattern: /^https:\/\/api\.groq\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
              },
            },
            {
              urlPattern: /^https:\/\/api-inference\.huggingface\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
              },
            },
            {
              urlPattern: /^https:\/\/api\.mistral\.ai\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
    optimizeDeps: {
      exclude: [
        'embla-carousel-react',
        'chunk-3TFVT2CW.js',
        'chunk-4MBMRILA.js',
        'chunk-R6S4VRB5.js',
        'chunk-S77I6LSE.js',
        'chunk-6SPNF6KQ.js',
        'chunk-VUNZWEK6.js',
        'chunk-4WIT4MX7.js',
        'chunk-O563XVIW.js',
        'chunk-ZMRDNIFS.js',
        'chunk-IWVYZN3G.js',
        'chunk-PJHKFFLB.js',
      ]
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env.HUGGINGFACE_API_KEY': JSON.stringify(env.HUGGINGFACE_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.TOGETHER_API_KEY': JSON.stringify(env.TOGETHER_API_KEY),
      'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY),
      'process.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY),
      'process.env.MISTRAL_API_KEY': JSON.stringify(env.MISTRAL_API_KEY),
      'process.env.VITE_PAYSTACK_PUBLIC_KEY': JSON.stringify(env.VITE_PAYSTACK_PUBLIC_KEY),
    }
  };
});
