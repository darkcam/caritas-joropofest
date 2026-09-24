import { getBrandThemeFromEnv, normalizeBrandTheme, type BrandTheme } from "./brand";

const BRAND_TABLE = "brand_themes";

export class BrandStorageUnavailableError extends Error {}

export class SupabaseBrandConfigError extends BrandStorageUnavailableError {
  constructor() {
    super("Falta configurar SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY.");
    this.name = "SupabaseBrandConfigError";
  }
}

export class BrandTableMissingError extends BrandStorageUnavailableError {
  constructor() {
    super("Falta crear la tabla brand_themes con supabase/brand-schema.sql.");
    this.name = "BrandTableMissingError";
  }
}

type SupabaseBrandConfig = {
  url: string;
  apiKey: string;
};

type BrandThemeRow = {
  id: string;
  theme: unknown;
  is_active: boolean;
  updated_at: string;
};

function getSupabaseBrandConfig(): SupabaseBrandConfig {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !apiKey) {
    throw new SupabaseBrandConfigError();
  }

  return { url, apiKey };
}

function getAuthHeaders(apiKey: string) {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };
}

const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);

function parseSupabaseError(text: string) {
  try {
    return JSON.parse(text) as { message?: string; error?: string; code?: string };
  } catch {
    return null;
  }
}

async function throwSupabaseError(response: Response): Promise<never> {
  const text = await response.text();
  const data = parseSupabaseError(text);

  if (data?.code && MISSING_TABLE_CODES.has(data.code)) {
    throw new BrandTableMissingError();
  }

  throw new Error(data?.message ?? data?.error ?? text);
}

function toRows(value: unknown): BrandThemeRow[] {
  if (!Array.isArray(value)) {
    throw new Error("Supabase respondió con una lista inválida de temas.");
  }

  return value as BrandThemeRow[];
}

export async function fetchActiveBrandTheme(): Promise<BrandTheme | null> {
  const { url, apiKey } = getSupabaseBrandConfig();
  const searchParams = new URLSearchParams({
    select: "id,theme,is_active,updated_at",
    is_active: "eq.true",
    limit: "1",
  });
  const response = await fetch(`${url}/rest/v1/${BRAND_TABLE}?${searchParams}`, {
    headers: getAuthHeaders(apiKey),
    cache: "no-store",
  });

  if (!response.ok) {
    await throwSupabaseError(response);
  }

  const row = toRows(await response.json())[0];

  return row ? normalizeBrandTheme(row.theme) : null;
}

export async function listBrandThemes(): Promise<{ theme: BrandTheme; isActive: boolean }[]> {
  const { url, apiKey } = getSupabaseBrandConfig();
  const searchParams = new URLSearchParams({
    select: "id,theme,is_active,updated_at",
    order: "updated_at.desc",
  });
  const response = await fetch(`${url}/rest/v1/${BRAND_TABLE}?${searchParams}`, {
    headers: getAuthHeaders(apiKey),
    cache: "no-store",
  });

  if (!response.ok) {
    await throwSupabaseError(response);
  }

  return toRows(await response.json()).map((row) => ({
    theme: normalizeBrandTheme(row.theme),
    isActive: row.is_active,
  }));
}

async function deactivateOtherThemes(config: SupabaseBrandConfig, id: string) {
  const searchParams = new URLSearchParams({
    is_active: "eq.true",
    id: `neq.${id}`,
  });
  const response = await fetch(`${config.url}/rest/v1/${BRAND_TABLE}?${searchParams}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(config.apiKey),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ is_active: false }),
  });

  if (!response.ok) {
    await throwSupabaseError(response);
  }
}

export async function saveBrandTheme(theme: BrandTheme): Promise<BrandTheme> {
  const config = getSupabaseBrandConfig();

  await deactivateOtherThemes(config, theme.id);

  const response = await fetch(`${config.url}/rest/v1/${BRAND_TABLE}?on_conflict=id`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(config.apiKey),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: theme.id,
      theme,
      is_active: true,
    }),
  });

  if (!response.ok) {
    await throwSupabaseError(response);
  }

  const row = toRows(await response.json())[0];

  if (!row) {
    throw new Error("Supabase no devolvió el tema guardado.");
  }

  return normalizeBrandTheme(row.theme);
}

export async function getBrandTheme(): Promise<BrandTheme> {
  const envTheme = getBrandThemeFromEnv();

  try {
    return (await fetchActiveBrandTheme()) ?? envTheme;
  } catch {
    return envTheme;
  }
}

export function isBrandAdminRequest(request: Request) {
  const expected = process.env.BRAND_ADMIN_TOKEN?.trim();

  if (!expected) {
    return true;
  }

  return request.headers.get("x-brand-admin-token")?.trim() === expected;
}

export function isBrandAdminTokenRequired() {
  return Boolean(process.env.BRAND_ADMIN_TOKEN?.trim());
}
