import { defineConfig } from "@vite-pwa/assets-generator/config";

// Generates the PWA icon set from a single full-bleed source SVG.
// Re-run with:  npm run generate-pwa-assets
// Source already fills the canvas (teal background + centered mark), so we use
// padding: 0 everywhere and a teal backdrop for any transparent edges.
const background = "#0ca678";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, "favicon.ico"]],
      padding: 0,
    },
    maskable: {
      sizes: [512],
      padding: 0,
      resizeOptions: { background },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background },
    },
  },
  images: ["public/app-icon.svg"],
});
