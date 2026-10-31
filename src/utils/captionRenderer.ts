import { CaptionConfig } from '../types';

export function drawCaptionOnCanvas(
  ctx: CanvasRenderingContext2D,
  caption: CaptionConfig,
  width: number,
  height: number
) {
  if (!caption.text.trim()) return;

  ctx.save();

  const fontSizePx = Math.max(16, (caption.fontSize / 100) * height);
  const text = caption.text;

  // Set font according to style
  let fontFamily = 'Inter, system-ui, sans-serif';
  let isUppercase = false;

  switch (caption.style) {
    case 'impact':
      fontFamily = 'Montserrat, Impact, sans-serif';
      isUppercase = true;
      break;
    case 'cinematic':
      fontFamily = 'Cinzel, "Playfair Display", Georgia, serif';
      isUppercase = true;
      break;
    case 'neon':
      fontFamily = '"JetBrains Mono", Inter, sans-serif';
      break;
    case 'subtitle':
      fontFamily = 'Inter, system-ui, sans-serif';
      break;
    case 'modern':
    default:
      fontFamily = 'Inter, system-ui, sans-serif';
      break;
  }

  const displayText = isUppercase ? text.toUpperCase() : text;
  ctx.font = `bold ${fontSizePx}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Compute Y position
  let posY = height * 0.88; // bottom default
  if (caption.position === 'top') {
    posY = height * 0.14;
  } else if (caption.position === 'middle') {
    posY = height * 0.5;
  }

  const posX = width / 2;
  const metrics = ctx.measureText(displayText);
  const textWidth = metrics.width;
  const textHeight = fontSizePx;

  // Background Box / Pill
  if (caption.hasBackground) {
    ctx.save();
    ctx.fillStyle = caption.backgroundColor || 'rgba(0, 0, 0, 0.75)';
    const padX = fontSizePx * 0.7;
    const padY = fontSizePx * 0.35;
    const pillRadius = 8;
    const rx = posX - textWidth / 2 - padX;
    const ry = posY - textHeight / 2 - padY;
    const rw = textWidth + padX * 2;
    const rh = textHeight + padY * 2;

    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, pillRadius);
    ctx.fill();
    ctx.restore();
  }

  // Neon Glow Style
  if (caption.style === 'neon') {
    ctx.save();
    ctx.shadowColor = caption.color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = caption.color;
    ctx.fillText(displayText, posX, posY);
    ctx.restore();
  }

  // Impact Style outline
  if (caption.style === 'impact') {
    ctx.save();
    ctx.lineWidth = Math.max(3, fontSizePx * 0.12);
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeText(displayText, posX, posY);
    ctx.restore();
  }

  // Draw main text
  ctx.fillStyle = caption.color;
  ctx.fillText(displayText, posX, posY);

  ctx.restore();
}
