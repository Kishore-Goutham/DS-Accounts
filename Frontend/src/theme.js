import { createTheme } from "@mantine/core";

// Custom Mantine theme so the UI reads as "ours", not stock.
// Refined further in the polish phase.
export const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "md",
  fontFamily:
    "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  headings: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: "700",
  },
});

export default theme;
