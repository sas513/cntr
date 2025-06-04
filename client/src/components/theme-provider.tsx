import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { StoreSetting } from "@shared/schema";

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { data: settings = [] } = useQuery<StoreSetting[]>({
    queryKey: ["/api/settings"],
  });

  const getSetting = (key: string) => 
    settings.find(s => s.key === key)?.value || "";

  useEffect(() => {
    const primaryColor = getSetting("primary_color") || "#1B365D";
    const secondaryColor = getSetting("secondary_color") || "#F4A460";
    const accentColor = getSetting("accent_color") || "#FF6B35";

    // Convert hex colors to HSL for CSS variables
    const primaryHsl = hexToHsl(primaryColor);
    const secondaryHsl = hexToHsl(secondaryColor);
    const accentHsl = hexToHsl(accentColor);

    // Apply the custom colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    
    // Update ring color to match primary
    root.style.setProperty('--ring', primaryHsl);

    // Also update some complementary colors based on primary
    const primaryRgb = {
      r: parseInt(primaryColor.substring(1, 3), 16),
      g: parseInt(primaryColor.substring(3, 5), 16),
      b: parseInt(primaryColor.substring(5, 7), 16)
    };

    // Calculate if primary is dark or light to set appropriate foreground
    const brightness = (primaryRgb.r * 299 + primaryRgb.g * 587 + primaryRgb.b * 114) / 1000;
    const foregroundColor = brightness > 128 ? "216 14% 15%" : "210 40% 98%";
    root.style.setProperty('--primary-foreground', foregroundColor);

  }, [settings]);

  return <>{children}</>;
}