export type BrandColors = {
  primary: string;
  ink: string;
  light: string;
  muted: string;
};

export type BrandCredit = {
  name: string;
  url: string;
  message: string;
};

export type BrandTheme = {
  id: string;
  eventName: string;
  cardTitle: string;
  eventDateLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  lockedTitle: string;
  wallTitle: string;
  qrImage: string;
  downloadFileName: string;
  aiPalette: string;
  colors: BrandColors;
  credit: BrandCredit;
};

export const PLATZI_BRAND_THEME: BrandTheme = {
  id: "platzi",
  eventName: "Platzi Conf",
  cardTitle: "PLATZI CONF",
  eventDateLabel: "29AGO26",
  heroTitle: "Tu cara en una card 16-bit",
  heroSubtitle:
    "Usa la cámara frontal, captura tu foto y genera automáticamente un retrato 16-bit pixel con IA para tu card del evento.",
  lockedTitle: "Disponible el 29 de agosto",
  wallTitle: "MURO DE PLATZI CONF",
  qrImage: "/caritas-platzi.png",
  downloadFileName: "platzi-conf-16bit-card.png",
  aiPalette: "navy #121F3D, white, warm gray, dark gray, and green #98CA3F",
  colors: {
    primary: "#98CA3F",
    ink: "#121F3D",
    light: "#f8f8f2",
    muted: "#8f8f86",
  },
  credit: {
    name: "@ErasmoHernandez",
    url: "https://erasmoh.dev",
    message: "con amor para la comunidad",
  },
};

export const JOROPOFEST_BRAND_THEME: BrandTheme = {
  ...PLATZI_BRAND_THEME,
  id: "joropofest",
  eventName: "Joropo Fest",
  cardTitle: "JOROPO FEST",
  eventDateLabel: "JOROPO26",
  heroTitle: "Tu cara en una card 16-bit",
  lockedTitle: "Disponible pronto",
  wallTitle: "MURO DE JOROPO FEST",
  downloadFileName: "joropo-fest-16bit-card.png",
  aiPalette: "deep plum #2C1233, white, warm gray, dark gray, and mango #F2A007",
  colors: {
    primary: "#F2A007",
    ink: "#2C1233",
    light: "#f8f4ec",
    muted: "#9a8a80",
  },
};

export const BRAND_PRESETS: Record<string, BrandTheme> = {
  platzi: PLATZI_BRAND_THEME,
  joropofest: JOROPOFEST_BRAND_THEME,
};

export const DEFAULT_BRAND_THEME = PLATZI_BRAND_THEME;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function readString(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : fallback;
}

function readColor(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();

  return trimmed && HEX_COLOR.test(trimmed) ? trimmed : fallback;
}

export function getBrandThemeFromEnv(): BrandTheme {
  const preset =
    BRAND_PRESETS[process.env.NEXT_PUBLIC_BRAND_PRESET?.trim().toLowerCase() ?? ""] ?? DEFAULT_BRAND_THEME;

  return {
    ...preset,
    eventName: readString(process.env.NEXT_PUBLIC_BRAND_EVENT_NAME, preset.eventName),
    cardTitle: readString(process.env.NEXT_PUBLIC_BRAND_CARD_TITLE, preset.cardTitle),
    eventDateLabel: readString(process.env.NEXT_PUBLIC_BRAND_EVENT_DATE_LABEL, preset.eventDateLabel),
    heroTitle: readString(process.env.NEXT_PUBLIC_BRAND_HERO_TITLE, preset.heroTitle),
    heroSubtitle: readString(process.env.NEXT_PUBLIC_BRAND_HERO_SUBTITLE, preset.heroSubtitle),
    lockedTitle: readString(process.env.NEXT_PUBLIC_BRAND_LOCKED_TITLE, preset.lockedTitle),
    wallTitle: readString(process.env.NEXT_PUBLIC_BRAND_WALL_TITLE, preset.wallTitle),
    qrImage: readString(process.env.NEXT_PUBLIC_BRAND_QR_IMAGE, preset.qrImage),
    downloadFileName: readString(process.env.NEXT_PUBLIC_BRAND_DOWNLOAD_FILE_NAME, preset.downloadFileName),
    aiPalette: readString(process.env.NEXT_PUBLIC_BRAND_AI_PALETTE, preset.aiPalette),
    colors: {
      primary: readColor(process.env.NEXT_PUBLIC_BRAND_COLOR_PRIMARY, preset.colors.primary),
      ink: readColor(process.env.NEXT_PUBLIC_BRAND_COLOR_INK, preset.colors.ink),
      light: readColor(process.env.NEXT_PUBLIC_BRAND_COLOR_LIGHT, preset.colors.light),
      muted: readColor(process.env.NEXT_PUBLIC_BRAND_COLOR_MUTED, preset.colors.muted),
    },
    credit: {
      name: readString(process.env.NEXT_PUBLIC_BRAND_CREDIT_NAME, preset.credit.name),
      url: readString(process.env.NEXT_PUBLIC_BRAND_CREDIT_URL, preset.credit.url),
      message: readString(process.env.NEXT_PUBLIC_BRAND_CREDIT_MESSAGE, preset.credit.message),
    },
  };
}

export function normalizeBrandTheme(value: unknown, fallback: BrandTheme = DEFAULT_BRAND_THEME): BrandTheme {
  if (typeof value !== "object" || value === null) {
    return fallback;
  }

  const candidate = value as Partial<BrandTheme> & {
    colors?: Partial<BrandColors>;
    credit?: Partial<BrandCredit>;
  };

  return {
    id: readString(candidate.id, fallback.id),
    eventName: readString(candidate.eventName, fallback.eventName),
    cardTitle: readString(candidate.cardTitle, fallback.cardTitle),
    eventDateLabel: readString(candidate.eventDateLabel, fallback.eventDateLabel),
    heroTitle: readString(candidate.heroTitle, fallback.heroTitle),
    heroSubtitle: readString(candidate.heroSubtitle, fallback.heroSubtitle),
    lockedTitle: readString(candidate.lockedTitle, fallback.lockedTitle),
    wallTitle: readString(candidate.wallTitle, fallback.wallTitle),
    qrImage: readString(candidate.qrImage, fallback.qrImage),
    downloadFileName: readString(candidate.downloadFileName, fallback.downloadFileName),
    aiPalette: readString(candidate.aiPalette, fallback.aiPalette),
    colors: {
      primary: readColor(candidate.colors?.primary, fallback.colors.primary),
      ink: readColor(candidate.colors?.ink, fallback.colors.ink),
      light: readColor(candidate.colors?.light, fallback.colors.light),
      muted: readColor(candidate.colors?.muted, fallback.colors.muted),
    },
    credit: {
      name: readString(candidate.credit?.name, fallback.credit.name),
      url: readString(candidate.credit?.url, fallback.credit.url),
      message: readString(candidate.credit?.message, fallback.credit.message),
    },
  };
}

export function brandCssVariables(theme: BrandTheme): Record<string, string> {
  return {
    "--brand-primary": theme.colors.primary,
    "--brand-ink": theme.colors.ink,
    "--brand-light": theme.colors.light,
    "--brand-muted": theme.colors.muted,
  };
}

export function brandThemeToEnv(theme: BrandTheme) {
  return [
    `NEXT_PUBLIC_BRAND_EVENT_NAME=${theme.eventName}`,
    `NEXT_PUBLIC_BRAND_CARD_TITLE=${theme.cardTitle}`,
    `NEXT_PUBLIC_BRAND_EVENT_DATE_LABEL=${theme.eventDateLabel}`,
    `NEXT_PUBLIC_BRAND_HERO_TITLE=${theme.heroTitle}`,
    `NEXT_PUBLIC_BRAND_HERO_SUBTITLE=${theme.heroSubtitle}`,
    `NEXT_PUBLIC_BRAND_LOCKED_TITLE=${theme.lockedTitle}`,
    `NEXT_PUBLIC_BRAND_WALL_TITLE=${theme.wallTitle}`,
    `NEXT_PUBLIC_BRAND_QR_IMAGE=${theme.qrImage}`,
    `NEXT_PUBLIC_BRAND_DOWNLOAD_FILE_NAME=${theme.downloadFileName}`,
    `NEXT_PUBLIC_BRAND_AI_PALETTE=${theme.aiPalette}`,
    `NEXT_PUBLIC_BRAND_COLOR_PRIMARY=${theme.colors.primary}`,
    `NEXT_PUBLIC_BRAND_COLOR_INK=${theme.colors.ink}`,
    `NEXT_PUBLIC_BRAND_COLOR_LIGHT=${theme.colors.light}`,
    `NEXT_PUBLIC_BRAND_COLOR_MUTED=${theme.colors.muted}`,
    `NEXT_PUBLIC_BRAND_CREDIT_NAME=${theme.credit.name}`,
    `NEXT_PUBLIC_BRAND_CREDIT_URL=${theme.credit.url}`,
    `NEXT_PUBLIC_BRAND_CREDIT_MESSAGE=${theme.credit.message}`,
  ].join("\n");
}
