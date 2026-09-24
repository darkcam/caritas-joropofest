export type BrandColors = {
  primary: string;
  ink: string;
  light: string;
  muted: string;
};

export const CARD_STYLES = ["pixel", "modern", "frame"] as const;

export type CardStyle = (typeof CARD_STYLES)[number];

export const CARD_STYLE_LABELS: Record<CardStyle, string> = {
  pixel: "Pixel 16-bit",
  modern: "Editorial moderno",
  frame: "Portada del evento",
};

export type BrandFrameArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BrandFrame = {
  image: string;
  aspect: number;
  radius: number;
  photoArea: BrandFrameArea;
};

export const DEFAULT_BRAND_FRAME: BrandFrame = {
  image: "",
  aspect: 1080 / 1350,
  radius: 0.055,
  photoArea: {
    x: 0.184,
    y: 0.241,
    width: 0.627,
    height: 0.54,
  },
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
  cardStyle: CardStyle;
  artStyleLabel: string;
  aiStyle: string;
  aiPalette: string;
  frame: BrandFrame;
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
  cardStyle: "pixel",
  artStyleLabel: "16-bit",
  aiStyle:
    "a premium 16-bit pixel portrait with chunky pixel shapes, crisp stair-stepped edges, simplified facial features, graphic clusters of light and shadow, and controlled dithering; it must look intentionally hand-crafted, never a filtered photograph, so avoid photorealism, smooth gradients, painterly brush strokes, anime style and 3D render",
  aiPalette: "navy #121F3D, white, warm gray, dark gray, and green #98CA3F",
  frame: DEFAULT_BRAND_FRAME,
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
  heroTitle: "Tu cara en una card del festival",
  heroSubtitle:
    "Usa la cámara frontal, captura tu foto y genera automáticamente un retrato ilustrado con IA para tu card del evento.",
  lockedTitle: "Disponible pronto",
  wallTitle: "MURO DE JOROPO FEST",
  downloadFileName: "joropo-fest-card.png",
  cardStyle: "frame",
  artStyleLabel: "ilustrado",
  aiStyle:
    "a bold flat illustrated portrait with clean vector shapes, confident line work, soft cel shading and poster-like contrast; avoid photorealism, pixel art, heavy texture and 3D render",
  aiPalette: "deep plum #2C1233, white, warm gray, dark gray, and mango #F2A007",
  frame: {
    ...DEFAULT_BRAND_FRAME,
    image: "/marco-joropofest.png",
  },
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

function readCardStyle(value: unknown, fallback: CardStyle): CardStyle {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";

  return CARD_STYLES.find((style) => style === candidate) ?? fallback;
}

function readRatio(value: unknown, fallback: number, min: number, max: number) {
  const candidate = typeof value === "string" ? Number.parseFloat(value) : value;

  if (typeof candidate !== "number" || !Number.isFinite(candidate) || candidate < min || candidate > max) {
    return fallback;
  }

  return candidate;
}

function readFrame(value: unknown, fallback: BrandFrame): BrandFrame {
  const candidate = (typeof value === "object" && value !== null ? value : {}) as Partial<BrandFrame> & {
    photoArea?: Partial<BrandFrameArea>;
  };

  return {
    image: typeof candidate.image === "string" ? candidate.image.trim() : fallback.image,
    aspect: readRatio(candidate.aspect, fallback.aspect, 0.3, 3),
    radius: readRatio(candidate.radius, fallback.radius, 0, 0.5),
    photoArea: {
      x: readRatio(candidate.photoArea?.x, fallback.photoArea.x, 0, 1),
      y: readRatio(candidate.photoArea?.y, fallback.photoArea.y, 0, 1),
      width: readRatio(candidate.photoArea?.width, fallback.photoArea.width, 0.05, 1),
      height: readRatio(candidate.photoArea?.height, fallback.photoArea.height, 0.05, 1),
    },
  };
}

function parseFrameArea(value: string | undefined, fallback: BrandFrameArea): BrandFrameArea {
  const parts = value?.split(",").map((part) => Number.parseFloat(part.trim()));

  if (!parts || parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return fallback;
  }

  return {
    x: parts[0],
    y: parts[1],
    width: parts[2],
    height: parts[3],
  };
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
    cardStyle: readCardStyle(process.env.NEXT_PUBLIC_BRAND_CARD_STYLE, preset.cardStyle),
    artStyleLabel: readString(process.env.NEXT_PUBLIC_BRAND_ART_STYLE_LABEL, preset.artStyleLabel),
    aiStyle: readString(process.env.NEXT_PUBLIC_BRAND_AI_STYLE, preset.aiStyle),
    aiPalette: readString(process.env.NEXT_PUBLIC_BRAND_AI_PALETTE, preset.aiPalette),
    frame: readFrame(
      {
        image: process.env.NEXT_PUBLIC_BRAND_FRAME_IMAGE,
        aspect: process.env.NEXT_PUBLIC_BRAND_FRAME_ASPECT,
        radius: process.env.NEXT_PUBLIC_BRAND_FRAME_RADIUS,
        photoArea: parseFrameArea(process.env.NEXT_PUBLIC_BRAND_FRAME_AREA, preset.frame.photoArea),
      },
      preset.frame,
    ),
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
    cardStyle: readCardStyle(candidate.cardStyle, fallback.cardStyle),
    artStyleLabel: readString(candidate.artStyleLabel, fallback.artStyleLabel),
    aiStyle: readString(candidate.aiStyle, fallback.aiStyle),
    aiPalette: readString(candidate.aiPalette, fallback.aiPalette),
    frame: readFrame(candidate.frame, fallback.frame),
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

function envLine(name: string, value: string) {
  return `${name}="${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function brandThemeToEnv(theme: BrandTheme) {
  return [
    envLine("NEXT_PUBLIC_BRAND_EVENT_NAME", theme.eventName),
    envLine("NEXT_PUBLIC_BRAND_CARD_TITLE", theme.cardTitle),
    envLine("NEXT_PUBLIC_BRAND_EVENT_DATE_LABEL", theme.eventDateLabel),
    envLine("NEXT_PUBLIC_BRAND_HERO_TITLE", theme.heroTitle),
    envLine("NEXT_PUBLIC_BRAND_HERO_SUBTITLE", theme.heroSubtitle),
    envLine("NEXT_PUBLIC_BRAND_LOCKED_TITLE", theme.lockedTitle),
    envLine("NEXT_PUBLIC_BRAND_WALL_TITLE", theme.wallTitle),
    envLine("NEXT_PUBLIC_BRAND_QR_IMAGE", theme.qrImage),
    envLine("NEXT_PUBLIC_BRAND_DOWNLOAD_FILE_NAME", theme.downloadFileName),
    envLine("NEXT_PUBLIC_BRAND_CARD_STYLE", theme.cardStyle),
    envLine("NEXT_PUBLIC_BRAND_ART_STYLE_LABEL", theme.artStyleLabel),
    envLine("NEXT_PUBLIC_BRAND_AI_STYLE", theme.aiStyle),
    envLine("NEXT_PUBLIC_BRAND_AI_PALETTE", theme.aiPalette),
    envLine("NEXT_PUBLIC_BRAND_FRAME_IMAGE", theme.frame.image),
    envLine("NEXT_PUBLIC_BRAND_FRAME_ASPECT", String(theme.frame.aspect)),
    envLine("NEXT_PUBLIC_BRAND_FRAME_RADIUS", String(theme.frame.radius)),
    envLine(
      "NEXT_PUBLIC_BRAND_FRAME_AREA",
      [theme.frame.photoArea.x, theme.frame.photoArea.y, theme.frame.photoArea.width, theme.frame.photoArea.height].join(
        ",",
      ),
    ),
    envLine("NEXT_PUBLIC_BRAND_COLOR_PRIMARY", theme.colors.primary),
    envLine("NEXT_PUBLIC_BRAND_COLOR_INK", theme.colors.ink),
    envLine("NEXT_PUBLIC_BRAND_COLOR_LIGHT", theme.colors.light),
    envLine("NEXT_PUBLIC_BRAND_COLOR_MUTED", theme.colors.muted),
    envLine("NEXT_PUBLIC_BRAND_CREDIT_NAME", theme.credit.name),
    envLine("NEXT_PUBLIC_BRAND_CREDIT_URL", theme.credit.url),
    envLine("NEXT_PUBLIC_BRAND_CREDIT_MESSAGE", theme.credit.message),
  ].join("\n");
}
