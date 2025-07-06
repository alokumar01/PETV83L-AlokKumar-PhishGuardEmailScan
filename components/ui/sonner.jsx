"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function AppToaster(props) {
  const { theme = "light" } = useTheme();

  // Sonner accepts "light", "dark", or "system" for theme.
  // You can fallback "system" to "light" or "dark" if needed,
  // but Sonner supports "system" by default, so no worries.

  return (
    <Toaster
    expand={false}
      theme={theme}
      position="top-right"
      
      toastOptions={{
        success: {
          style: {
            background: "#22c55e", // green
            color: "#fff",
            border: "1px solid #16a34a",
          },
        },
        error: {
          style: {
            background: "#ef4444", // red
            color: "#fff",
            border: "1px solid #dc2626",
          },
        },
        warning: {
          style: {
            background: "#f87171", // orange-ish red
            color: "#fff",
            border: "1px solid #dc2626",
          },
        },
        default: {
          style: {
            background: "#333", // dark gray background
            color: "#fff",
            border: "1px solid #444",
          },
        },
      }}
      {...props}
    closeButton />
  );
}
