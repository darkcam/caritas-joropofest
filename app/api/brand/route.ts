import { getBrandThemeFromEnv, normalizeBrandTheme } from "../../lib/brand";
import {
  BrandStorageUnavailableError,
  fetchActiveBrandTheme,
  isBrandAdminRequest,
  isBrandAdminTokenRequired,
  saveBrandTheme,
} from "../../lib/brand-store";
import { uploadWallImage } from "../../lib/wall";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SaveBrandRequest = {
  theme?: unknown;
};

type UploadFrameRequest = {
  imageDataUrl?: unknown;
};

const FRAME_MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_FRAME_BYTES = 6 * 1024 * 1024;

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

export async function POST(request: Request) {
  if (!isBrandAdminRequest(request)) {
    return Response.json({ error: "Token de administración inválido." }, { status: 401 });
  }

  let body: UploadFrameRequest;

  try {
    body = (await request.json()) as UploadFrameRequest;
  } catch {
    return Response.json({ error: "Request JSON inválido." }, { status: 400 });
  }

  const match =
    typeof body.imageDataUrl === "string" ? /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(body.imageDataUrl) : null;
  const extension = match ? FRAME_MIME_EXTENSIONS[match[1].toLowerCase()] : undefined;

  if (!match || !extension) {
    return Response.json({ error: "Sube una imagen PNG, JPG o WEBP." }, { status: 400 });
  }

  const buffer = Buffer.from(match[2], "base64");

  if (buffer.byteLength > MAX_FRAME_BYTES) {
    return Response.json({ error: "La portada supera los 6 MB." }, { status: 413 });
  }

  try {
    const upload = await uploadWallImage(buffer, match[1].toLowerCase(), extension);

    return Response.json({ url: upload.publicUrl });
  } catch (error) {
    return errorResponse(error, "No pude subir la portada.");
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
