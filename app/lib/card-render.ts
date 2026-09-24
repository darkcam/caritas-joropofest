import type { BrandTheme } from "./brand";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1620;
export const CARD_BORDER = 68;

const PIXEL_FONT: Record<string, string[]> = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  ".": ["000", "000", "000", "000", "000", "000", "110"],
  "'": ["110", "110", "100", "000", "000", "000", "000"],
  "!": ["100", "100", "100", "100", "100", "000", "100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "11111"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "00110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "Á": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  "É": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  "Í": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  "Ó": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "Ú": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  "Ñ": ["01010", "00000", "10001", "11001", "10101", "10011", "10001"],
};

export type PhotoArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function luminance(red: number, green: number, blue: number) {
  return red * 0.299 + green * 0.587 + blue * 0.114;
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);

  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  };
}

function paintPixel(data: Uint8ClampedArray, index: number, color: string) {
  const { red, green, blue } = hexToRgb(color);

  data[index] = red;
  data[index + 1] = green;
  data[index + 2] = blue;
}

function getPixelTextUnits(text: string) {
  return [...text.toUpperCase()].reduce((width, character, index) => {
    const glyph = PIXEL_FONT[character] ?? PIXEL_FONT[" "];

    return width + glyph[0].length + (index === text.length - 1 ? 0 : 1);
  }, 0);
}

export function drawPixelText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  maxScale: number,
  color: string,
) {
  const characters = [...text.toUpperCase()];
  const units = getPixelTextUnits(text);
  const scale = Math.max(1, Math.min(maxScale, Math.floor(maxWidth / units)));
  const width = units * scale;
  const height = 7 * scale;
  let x = centerX - width / 2;
  const y = centerY - height / 2;

  context.fillStyle = color;

  for (const [characterIndex, character] of characters.entries()) {
    const glyph = PIXEL_FONT[character] ?? PIXEL_FONT[" "];

    for (const [rowIndex, row] of glyph.entries()) {
      for (const [columnIndex, pixel] of [...row].entries()) {
        if (pixel === "1") {
          context.fillRect(Math.round(x + columnIndex * scale), Math.round(y + rowIndex * scale), scale, scale);
        }
      }
    }

    x += (glyph[0].length + (characterIndex === characters.length - 1 ? 0 : 1)) * scale;
  }
}

export function drawComicVideo(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: BrandTheme,
) {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = width / height;
  let drawX = x;
  let drawY = y;
  let drawWidth = width;
  let drawHeight = height;

  if (sourceRatio > targetRatio) {
    drawHeight = width / sourceRatio;
    drawY = y + (height - drawHeight) / 2;
  } else {
    drawWidth = height * sourceRatio;
    drawX = x + (width - drawWidth) / 2;
  }

  const lowWidth = 188;
  const lowHeight = Math.round(lowWidth / sourceRatio);
  const pixelCanvas = document.createElement("canvas");
  pixelCanvas.width = lowWidth;
  pixelCanvas.height = lowHeight;

  const pixelContext = pixelCanvas.getContext("2d");

  if (!pixelContext) {
    return;
  }

  pixelContext.translate(lowWidth, 0);
  pixelContext.scale(-1, 1);
  pixelContext.drawImage(video, 0, 0, sourceWidth, sourceHeight, 0, 0, lowWidth, lowHeight);

  const pixels = pixelContext.getImageData(0, 0, lowWidth, lowHeight);
  const source = new Uint8ClampedArray(pixels.data);

  for (let index = 0; index < pixels.data.length; index += 4) {
    const pixel = index / 4;
    const px = pixel % lowWidth;
    const py = Math.floor(pixel / lowWidth);
    const red = pixels.data[index];
    const green = pixels.data[index + 1];
    const blue = pixels.data[index + 2];
    const light = luminance(red, green, blue);
    const warm = red * 0.85 + green * 0.7 - blue * 0.75;
    const right = px < lowWidth - 1 ? (py * lowWidth + px + 1) * 4 : index;
    const bottom = py < lowHeight - 1 ? ((py + 1) * lowWidth + px) * 4 : index;
    const edge =
      Math.abs(light - luminance(source[right], source[right + 1], source[right + 2])) +
      Math.abs(light - luminance(source[bottom], source[bottom + 1], source[bottom + 2]));

    if (edge > 74 || light < 54) {
      paintPixel(pixels.data, index, theme.colors.ink);
    } else if (warm > 165 && light > 86 && light < 226) {
      paintPixel(pixels.data, index, theme.colors.primary);
    } else if (light > 186) {
      paintPixel(pixels.data, index, theme.colors.light);
    } else if (light > 104) {
      paintPixel(pixels.data, index, theme.colors.muted);
    } else {
      paintPixel(pixels.data, index, theme.colors.ink);
    }
  }

  pixelContext.putImageData(pixels, 0, 0);

  context.imageSmoothingEnabled = false;
  context.drawImage(pixelCanvas, drawX, drawY, drawWidth, drawHeight);
  context.imageSmoothingEnabled = true;
}

function pathRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const limit = Math.min(radius, width / 2, height / 2);

  context.moveTo(x + limit, y);
  context.arcTo(x + width, y, x + width, y + height, limit);
  context.arcTo(x + width, y + height, x, y + height, limit);
  context.arcTo(x, y + height, x, y, limit);
  context.arcTo(x, y, x + width, y, limit);
  context.closePath();
}

function sansFont(size: number, weight: number) {
  return `${weight} ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
}

export function drawSansText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  maxSize: number,
  color: string,
  weight = 900,
) {
  let size = maxSize;

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = sansFont(size, weight);

  while (size > 12 && context.measureText(text).width > maxWidth) {
    size -= 2;
    context.font = sansFont(size, weight);
  }

  context.fillStyle = color;
  context.fillText(text, centerX, centerY);
}

export function drawMirroredVideo(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  area: PhotoArea,
) {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = area.width / area.height;
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) * 0.3;
  }

  context.save();
  context.translate(area.x + area.width, area.y);
  context.scale(-1, 1);
  context.drawImage(video, sx, sy, sw, sh, 0, 0, area.width, area.height);
  context.restore();
}

const MODERN_MARGIN = 46;
const MODERN_PHOTO_INSET = 76;
const MODERN_FOOTER_HEIGHT = 340;
const MODERN_RADIUS = 56;

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function hexColor(value: string, fallback: string) {
  return HEX_COLOR.test(value.trim()) ? value.trim() : fallback;
}

function withAlpha(value: string, alpha: string) {
  return value.length === 7 ? `${value}${alpha}` : value;
}

function modernColors(theme: BrandTheme) {
  return {
    primary: hexColor(theme.colors.primary, "#ffffff"),
    ink: hexColor(theme.colors.ink, "#111111"),
    light: hexColor(theme.colors.light, "#ffffff"),
  };
}

function modernPhotoArea(): PhotoArea {
  return {
    x: MODERN_PHOTO_INSET,
    y: MODERN_PHOTO_INSET,
    width: CARD_WIDTH - MODERN_PHOTO_INSET * 2,
    height: CARD_HEIGHT - MODERN_PHOTO_INSET - MODERN_FOOTER_HEIGHT,
  };
}

function drawModernBackground(context: CanvasRenderingContext2D, theme: BrandTheme): PhotoArea {
  const colors = modernColors(theme);
  const gradient = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, colors.ink);
  gradient.addColorStop(1, withAlpha(colors.primary, "26"));

  context.fillStyle = colors.ink;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.fillStyle = gradient;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.beginPath();
  pathRoundedRect(
    context,
    MODERN_MARGIN,
    MODERN_MARGIN,
    CARD_WIDTH - MODERN_MARGIN * 2,
    CARD_HEIGHT - MODERN_MARGIN * 2,
    MODERN_RADIUS + 14,
  );
  context.strokeStyle = withAlpha(colors.primary, "66");
  context.lineWidth = 4;
  context.stroke();

  const area = modernPhotoArea();

  context.fillStyle = withAlpha(colors.light, "14");
  context.beginPath();
  pathRoundedRect(context, area.x, area.y, area.width, area.height, MODERN_RADIUS);
  context.fill();

  return area;
}

function drawModernChrome(context: CanvasRenderingContext2D, photoArea: PhotoArea, theme: BrandTheme) {
  const colors = modernColors(theme);

  context.beginPath();
  pathRoundedRect(context, photoArea.x, photoArea.y, photoArea.width, photoArea.height, MODERN_RADIUS);
  context.strokeStyle = colors.primary;
  context.lineWidth = 6;
  context.stroke();

  const footerTop = photoArea.y + photoArea.height;
  const pillWidth = 320;
  const pillHeight = 74;
  const pillY = footerTop + 30;

  context.beginPath();
  pathRoundedRect(context, CARD_WIDTH / 2 - pillWidth / 2, pillY, pillWidth, pillHeight, pillHeight / 2);
  context.fillStyle = colors.primary;
  context.fill();

  drawSansText(
    context,
    theme.eventDateLabel.toUpperCase(),
    CARD_WIDTH / 2,
    pillY + pillHeight / 2 + 2,
    pillWidth - 60,
    38,
    colors.ink,
    800,
  );

  drawSansText(
    context,
    theme.cardTitle.toUpperCase(),
    CARD_WIDTH / 2,
    pillY + pillHeight + 72,
    CARD_WIDTH - 180,
    84,
    colors.primary,
  );

  drawSansText(
    context,
    theme.eventName,
    CARD_WIDTH / 2,
    pillY + pillHeight + 140,
    CARD_WIDTH - 260,
    30,
    colors.light,
    600,
  );
}

function drawPixelBackground(context: CanvasRenderingContext2D, theme: BrandTheme): PhotoArea {
  const photoX = CARD_BORDER;
  const photoY = CARD_BORDER;
  const photoWidth = CARD_WIDTH - CARD_BORDER * 2;
  const photoHeight = CARD_HEIGHT - CARD_BORDER * 2;

  context.fillStyle = theme.colors.ink;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.fillStyle = theme.colors.primary;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.fillStyle = theme.colors.ink;
  context.fillRect(24, 24, CARD_WIDTH - 48, CARD_HEIGHT - 48);
  context.fillStyle = theme.colors.primary;
  context.fillRect(44, 44, CARD_WIDTH - 88, CARD_HEIGHT - 88);
  context.fillStyle = theme.colors.ink;
  context.fillRect(56, 56, CARD_WIDTH - 112, CARD_HEIGHT - 112);

  return {
    x: photoX,
    y: photoY,
    width: photoWidth,
    height: photoHeight,
  };
}

function drawPixelChrome(context: CanvasRenderingContext2D, photoArea: PhotoArea, theme: BrandTheme) {
  const overlayHeight = 285;
  const overlayY = photoArea.y + photoArea.height - overlayHeight;
  const dateWidth = 250;
  const dateHeight = 70;

  context.strokeStyle = theme.colors.primary;
  context.lineWidth = 18;
  context.strokeRect(photoArea.x - 2, photoArea.y - 2, photoArea.width + 4, photoArea.height + 4);
  context.strokeStyle = theme.colors.ink;
  context.lineWidth = 8;
  context.strokeRect(photoArea.x + 18, photoArea.y + 18, photoArea.width - 36, photoArea.height - 36);

  const gradient = context.createLinearGradient(0, overlayY - 90, 0, photoArea.y + photoArea.height);
  gradient.addColorStop(0, "rgba(17, 17, 17, 0)");
  gradient.addColorStop(0.32, "rgba(17, 17, 17, 0.72)");
  gradient.addColorStop(1, "rgba(17, 17, 17, 0.96)");
  context.fillStyle = gradient;
  context.fillRect(photoArea.x, overlayY - 90, photoArea.width, overlayHeight + 90);

  context.fillStyle = theme.colors.primary;
  context.fillRect(photoArea.x + 34, overlayY + 24, photoArea.width - 68, 12);

  context.fillStyle = theme.colors.primary;
  context.fillRect(CARD_WIDTH / 2 - dateWidth / 2, overlayY + 58, dateWidth, dateHeight);
  context.strokeStyle = theme.colors.ink;
  context.lineWidth = 7;
  context.strokeRect(CARD_WIDTH / 2 - dateWidth / 2 + 6, overlayY + 64, dateWidth - 12, dateHeight - 12);

  drawPixelText(context, theme.eventDateLabel, CARD_WIDTH / 2, overlayY + 93, dateWidth - 36, 7, theme.colors.ink);
  drawPixelText(
    context,
    theme.cardTitle,
    CARD_WIDTH / 2,
    overlayY + 185,
    photoArea.width - 92,
    10,
    theme.colors.primary,
  );

  context.fillStyle = theme.colors.primary;
  context.fillRect(photoArea.x + 34, photoArea.y + photoArea.height - 38, 118, 14);
  context.fillRect(photoArea.x + photoArea.width - 152, photoArea.y + photoArea.height - 38, 118, 14);
}

export function cardSize(theme: BrandTheme) {
  if (theme.cardStyle !== "frame") {
    return { width: CARD_WIDTH, height: CARD_HEIGHT };
  }

  return { width: CARD_WIDTH, height: Math.round(CARD_WIDTH / theme.frame.aspect) };
}

export function frameCardPhotoArea(theme: BrandTheme): PhotoArea {
  const { width, height } = cardSize(theme);
  const { photoArea } = theme.frame;

  return {
    x: photoArea.x * width,
    y: photoArea.y * height,
    width: photoArea.width * width,
    height: photoArea.height * height,
  };
}

function frameRadius(theme: BrandTheme) {
  return theme.frame.radius * cardSize(theme).width;
}

function drawFrameBackground(
  context: CanvasRenderingContext2D,
  theme: BrandTheme,
  frameImage: CanvasImageSource | null,
): PhotoArea {
  const { width, height } = cardSize(theme);
  const area = frameCardPhotoArea(theme);

  context.fillStyle = hexColor(theme.colors.ink, "#111111");
  context.fillRect(0, 0, width, height);

  if (frameImage) {
    context.drawImage(frameImage, 0, 0, width, height);
  }

  context.fillStyle = hexColor(theme.colors.muted, "#888888");
  context.beginPath();
  pathRoundedRect(context, area.x, area.y, area.width, area.height, frameRadius(theme));
  context.fill();

  return area;
}

export function drawCardBackground(
  context: CanvasRenderingContext2D,
  theme: BrandTheme,
  frameImage: CanvasImageSource | null = null,
): PhotoArea {
  if (theme.cardStyle === "frame") {
    return drawFrameBackground(context, theme, frameImage);
  }

  return theme.cardStyle === "modern" ? drawModernBackground(context, theme) : drawPixelBackground(context, theme);
}

function withPhotoClip(
  context: CanvasRenderingContext2D,
  photoArea: PhotoArea,
  theme: BrandTheme,
  draw: () => void,
) {
  if (theme.cardStyle === "pixel") {
    draw();
    return;
  }

  context.save();
  context.beginPath();
  pathRoundedRect(
    context,
    photoArea.x,
    photoArea.y,
    photoArea.width,
    photoArea.height,
    theme.cardStyle === "frame" ? frameRadius(theme) : MODERN_RADIUS,
  );
  context.clip();
  draw();
  context.restore();
}

export function drawCardChrome(context: CanvasRenderingContext2D, photoArea: PhotoArea, theme: BrandTheme) {
  if (theme.cardStyle === "frame") {
    return;
  }

  if (theme.cardStyle === "modern") {
    drawModernChrome(context, photoArea, theme);
    return;
  }

  drawPixelChrome(context, photoArea, theme);
}

export function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  area: PhotoArea,
) {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = area.width / area.height;
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) * 0.38;
  }

  context.drawImage(image, sx, sy, sw, sh, area.x, area.y, area.width, area.height);
}

export function drawCard(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  theme: BrandTheme,
  frameImage: CanvasImageSource | null = null,
) {
  const photoArea = drawCardBackground(context, theme, frameImage);

  withPhotoClip(context, photoArea, theme, () => {
    if (theme.cardStyle !== "pixel") {
      drawMirroredVideo(context, video, photoArea);
    } else {
      drawComicVideo(context, video, photoArea.x, photoArea.y, photoArea.width, photoArea.height, theme);
    }
  });

  drawCardChrome(context, photoArea, theme);
}

export function drawCardWithPortrait(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  theme: BrandTheme,
  frameImage: CanvasImageSource | null = null,
) {
  const photoArea = drawCardBackground(context, theme, frameImage);

  withPhotoClip(context, photoArea, theme, () => {
    drawCoverImage(context, image, image.naturalWidth, image.naturalHeight, photoArea);
  });

  drawCardChrome(context, photoArea, theme);
}

export function drawCardPlaceholder(
  context: CanvasRenderingContext2D,
  theme: BrandTheme,
  frameImage: CanvasImageSource | null = null,
) {
  const photoArea = drawCardBackground(context, theme, frameImage);

  withPhotoClip(context, photoArea, theme, () => {
    context.fillStyle = theme.colors.muted;
    context.fillRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height);

    const headX = photoArea.x + photoArea.width / 2;
    const headY = photoArea.y + photoArea.height * 0.36;
    const headRadius = photoArea.width * 0.19;

    context.fillStyle = theme.colors.light;
    context.beginPath();
    context.arc(headX, headY, headRadius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = theme.colors.ink;
    context.beginPath();
    context.ellipse(headX, headY + headRadius * 2.1, headRadius * 1.7, headRadius * 1.25, 0, Math.PI, Math.PI * 2);
    context.fill();
  });

  drawCardChrome(context, photoArea, theme);
}
