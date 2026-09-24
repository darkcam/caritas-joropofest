import { getBrandThemeFromEnv } from "../lib/brand";
import { fetchActiveBrandTheme, isBrandAdminTokenRequired } from "../lib/brand-store";
import BrandEditor from "./brand-editor";

export const dynamic = "force-dynamic";

export default async function MarcaPage() {
  const envTheme = getBrandThemeFromEnv();
  let storedTheme = null;
  let storageAvailable = true;

  try {
    storedTheme = await fetchActiveBrandTheme();
  } catch {
    storageAvailable = false;
  }

  return (
    <BrandEditor
      initialTheme={storedTheme ?? envTheme}
      source={storedTheme ? "supabase" : "env"}
      storageAvailable={storageAvailable}
      tokenRequired={isBrandAdminTokenRequired()}
    />
  );
}
