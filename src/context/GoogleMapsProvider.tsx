import { createContext, useContext, type ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsCtx = createContext<GoogleMapsContextValue | null>(null);

const LIBRARIES: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = [];

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "atrato-google-maps-loader",
    googleMapsApiKey: import.meta.env.VITE_API_KEYS_MAPS,
    libraries: LIBRARIES,
  });

  return (
    <GoogleMapsCtx.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsCtx.Provider>
  );
}

export function useGoogleMaps(): GoogleMapsContextValue {
  const ctx = useContext(GoogleMapsCtx);
  if (!ctx) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return ctx;
}