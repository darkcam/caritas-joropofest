"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { brandCssVariables, DEFAULT_BRAND_THEME, type BrandTheme } from "./lib/brand";

type BrandContextValue = {
  theme: BrandTheme;
  setTheme: (theme: BrandTheme) => void;
};

const BrandContext = createContext<BrandContextValue>({
  theme: DEFAULT_BRAND_THEME,
  setTheme: () => {},
});

export function useBrand() {
  return useContext(BrandContext).theme;
}

export function useBrandContext() {
  return useContext(BrandContext);
}

export function BrandProvider({ initialTheme, children }: { initialTheme: BrandTheme; children: React.ReactNode }) {
  const [override, setTheme] = useState<BrandTheme | null>(null);
  const theme = override ?? initialTheme;

  useEffect(() => {
    const root = document.documentElement;
    const variables = brandCssVariables(theme);

    for (const [name, value] of Object.entries(variables)) {
      root.style.setProperty(name, value);
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}
