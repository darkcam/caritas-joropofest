import type { BrandFrameArea } from "./brand";

const DETECTION_WIDTH = 270;
const WHITE_THRESHOLD = 244;
const MIN_RUN_RATIO = 0.45;

export function loadImageElement(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`No pude cargar la imagen ${source}`));
    image.src = source;
  });
}

export function detectFrameArea(image: HTMLImageElement): BrandFrameArea | null {
  const width = DETECTION_WIDTH;
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return null;
  }

  context.drawImage(image, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  const white = (x: number, y: number) => {
    const index = (y * width + x) * 4;

    return data[index] >= WHITE_THRESHOLD && data[index + 1] >= WHITE_THRESHOLD && data[index + 2] >= WHITE_THRESHOLD;
  };

  const rows: number[] = [];
  const columns: number[] = [];

  for (let y = 0; y < height; y += 1) {
    let count = 0;

    for (let x = 0; x < width; x += 1) {
      if (white(x, y)) {
        count += 1;
      }
    }

    if (count > width * MIN_RUN_RATIO) {
      rows.push(y);
    }
  }

  for (let x = 0; x < width; x += 1) {
    let count = 0;

    for (let y = 0; y < height; y += 1) {
      if (white(x, y)) {
        count += 1;
      }
    }

    if (count > height * MIN_RUN_RATIO) {
      columns.push(x);
    }
  }

  if (rows.length < 4 || columns.length < 4) {
    return null;
  }

  const top = rows[0];
  const bottom = rows[rows.length - 1] + 1;
  const left = columns[0];
  const right = columns[columns.length - 1] + 1;

  return {
    x: Number((left / width).toFixed(4)),
    y: Number((top / height).toFixed(4)),
    width: Number(((right - left) / width).toFixed(4)),
    height: Number(((bottom - top) / height).toFixed(4)),
  };
}
