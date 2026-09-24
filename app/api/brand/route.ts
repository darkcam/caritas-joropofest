import { getBrandThemeFromEnv, normalizeBrandTheme } from "../../lib/brand";
import {
  BrandStorageUnavailableError,
  fetchActiveBrandTheme,
  isBrandAdminRequest,
  isBrandAdminTokenRequired,
  saveBrandTheme,
} from "../../lib/brand-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SaveBrandRequest = {
  theme?: unknown;
};

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof BrandStorageUnavailableError) {
    return Response.json({ configured: false, error: error.message }, { status: 503 });
  }

  return Response.json({ error: error instanceof Error ? error.message : fallback }, { status: 500 });
}

export async function GET() {
  const envTheme = getBrandThemeFromEnv();

  try {
    const theme = await fetchActiveBrandTheme();

    return Response.json({
      configured: true,
      source: theme ? "supabase" : "env",
      tokenRequired: isBrandAdminTokenRequired(),
      theme: theme ?? envTheme,
    });
  } catch (error) {
    if (error instanceof BrandStorageUnavailableError) {
      return Response.json({
        configured: false,
        source: "env",
        tokenRequired: isBrandAdminTokenRequired(),
        error: error.message,
        theme: envTheme,
      });
    }

    return errorResponse(error, "No pude leer el tema de marca.");
  }
}

export async function PUT(request: Request) {
  if (!isBrandAdminRequest(request)) {
    return Response.json({ error: "Token de administración inválido." }, { status: 401 });
  }

  let body: SaveBrandRequest;

  try {
    body = (await request.json()) as SaveBrandRequest;
  } catch {
    return Response.json({ error: "Request JSON inválido." }, { status: 400 });
  }

  const theme = normalizeBrandTheme(body.theme, getBrandThemeFromEnv());

  try {
    return Response.json({ theme: await saveBrandTheme(theme) });
  } catch (error) {
    return errorResponse(error, "No pude guardar el tema de marca.");
  }
}
