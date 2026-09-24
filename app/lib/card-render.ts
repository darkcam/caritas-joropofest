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

export function drawCardBackground(context: CanvasRenderingContext2D, theme: BrandTheme): PhotoArea {
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

export function drawCardChrome(context: CanvasRenderingContext2D, photoArea: PhotoArea, theme: BrandTheme) {
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

export function drawCard(context: CanvasRenderingContext2D, video: HTMLVideoElement, theme: BrandTheme) {
  const photoArea = drawCardBackground(context, theme);

  drawComicVideo(context, video, photoArea.x, photoArea.y, photoArea.width, photoArea.height, theme);
  drawCardChrome(context, photoArea, theme);
}

export function drawCardWithPortrait(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  theme: BrandTheme,
) {
  const photoArea = drawCardBackground(context, theme);

  drawCoverImage(context, image, image.naturalWidth, image.naturalHeight, photoArea);
  drawCardChrome(context, photoArea, theme);
}

export function drawCardPlaceholder(context: CanvasRenderingContext2D, theme: BrandTheme) {
  const photoArea = drawCardBackground(context, theme);

  context.fillStyle = theme.colors.muted;
  context.fillRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height);

  const headX = CARD_WIDTH / 2;
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

  drawCardChrome(context, photoArea, theme);
}
