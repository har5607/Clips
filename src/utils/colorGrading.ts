import { ColorGrading, ColorPresetId } from '../types';

export const COLOR_PRESETS: Record<
  ColorPresetId,
  {
    name: string;
    description: string;
    grading: Omit<ColorGrading, 'preset'>;
  }
> = {
  original: {
    name: 'Original',
    description: 'Natural unadjusted footage',
    grading: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0,
      vignette: 0,
      sharpness: 0,
      filmGrain: 0,
    },
  },
  cinematic: {
    name: 'Cinematic 35mm',
    description: 'Rich deep contrast, lifted blacks, and gentle warmth',
    grading: {
      brightness: 4,
      contrast: 22,
      saturation: 14,
      temperature: 12,
      tint: -4,
      highlights: -12,
      shadows: 16,
      vignette: 24,
      sharpness: 20,
      filmGrain: 14,
    },
  },
  teal_orange: {
    name: 'Teal & Orange',
    description: 'Hollywood blockbuster look: cool shadows and warm golden skin tones',
    grading: {
      brightness: 2,
      contrast: 28,
      saturation: 22,
      temperature: 18,
      tint: -15,
      highlights: 8,
      shadows: -14,
      vignette: 28,
      sharpness: 25,
      filmGrain: 10,
    },
  },
  warm_vintage: {
    name: 'Warm Vintage',
    description: 'Nostalgic 70s analog film warmth with softened contrast',
    grading: {
      brightness: 6,
      contrast: 8,
      saturation: -10,
      temperature: 36,
      tint: 8,
      highlights: -18,
      shadows: 22,
      vignette: 30,
      sharpness: 10,
      filmGrain: 28,
    },
  },
  moody_noir: {
    name: 'Moody Noir',
    description: 'Dramatic high contrast monochrome with rich velvety shadows',
    grading: {
      brightness: -6,
      contrast: 38,
      saturation: -100,
      temperature: 0,
      tint: 0,
      highlights: -8,
      shadows: -20,
      vignette: 38,
      sharpness: 30,
      filmGrain: 22,
    },
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    description: 'Electric violet blues and hyper-saturated neon highlights',
    grading: {
      brightness: 8,
      contrast: 32,
      saturation: 42,
      temperature: -24,
      tint: 28,
      highlights: 18,
      shadows: -12,
      vignette: 26,
      sharpness: 35,
      filmGrain: 12,
    },
  },
  clean_pastel: {
    name: 'Clean Pastel',
    description: 'Airy, soft, low-contrast modern lifestyle aesthetic',
    grading: {
      brightness: 12,
      contrast: -8,
      saturation: -8,
      temperature: 4,
      tint: 2,
      highlights: 14,
      shadows: 24,
      vignette: 0,
      sharpness: 15,
      filmGrain: 0,
    },
  },
  golden_hour: {
    name: 'Golden Hour',
    description: 'Luminous late-afternoon sunlight with amber glow',
    grading: {
      brightness: 8,
      contrast: 18,
      saturation: 20,
      temperature: 40,
      tint: -6,
      highlights: 10,
      shadows: 8,
      vignette: 20,
      sharpness: 18,
      filmGrain: 8,
    },
  },
};

/**
 * Builds standard CSS filter string from color grading state.
 */
export function getCssFilterString(g: ColorGrading): string {
  // Brightness: -100 to 100 maps to 0.0 to 2.0 (normal 1.0)
  const b = Math.max(0, 1 + g.brightness / 100);
  // Contrast: -100 to 100 maps to 0.0 to 2.0 (normal 1.0)
  const c = Math.max(0, 1 + g.contrast / 100);
  // Saturation: -100 to 100 maps to 0.0 to 2.5 (normal 1.0)
  const s = Math.max(0, 1 + (g.saturation > 0 ? (g.saturation / 100) * 1.5 : g.saturation / 100));

  // Temperature (Warmth / Cool): Sepia + Hue-rotate approximation
  let tempPart = '';
  if (g.temperature > 0) {
    const sepiaAmt = (g.temperature / 100) * 0.45;
    tempPart = `sepia(${sepiaAmt.toFixed(2)}) hue-rotate(-${(g.temperature * 0.15).toFixed(1)}deg)`;
  } else if (g.temperature < 0) {
    const coolAmt = Math.abs(g.temperature) / 100;
    tempPart = `hue-rotate(${(coolAmt * 20).toFixed(1)}deg)`;
  }

  // Tint (Green / Magenta): hue-rotate approximation
  let tintPart = '';
  if (g.tint !== 0) {
    tintPart = `hue-rotate(${(g.tint * 0.25).toFixed(1)}deg)`;
  }

  return `brightness(${b.toFixed(2)}) contrast(${c.toFixed(2)}) saturate(${s.toFixed(2)}) ${tempPart} ${tintPart}`.trim();
}

/**
 * Renders an image/video frame to canvas with full advanced color grading
 * including temperature, tint, shadows, highlights, vignette, and film grain.
 */
export function drawGradedFrame(
  ctx: CanvasRenderingContext2D,
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
  width: number,
  height: number,
  grading: ColorGrading
) {
  // 1. Draw source with CSS filter for primary adjustments
  ctx.save();
  ctx.filter = getCssFilterString(grading);
  ctx.drawImage(source, 0, 0, width, height);
  ctx.restore();

  // 2. Shadows & Highlights overlay pass
  if (grading.shadows !== 0 || grading.highlights !== 0) {
    ctx.save();
    if (grading.shadows > 0) {
      // Lift shadows with subtle screen blend
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(255, 255, 255, ${(grading.shadows / 100) * 0.18})`;
      ctx.fillRect(0, 0, width, height);
    } else if (grading.shadows < 0) {
      // Crush shadows with multiply
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgba(0, 0, 0, ${(Math.abs(grading.shadows) / 100) * 0.25})`;
      ctx.fillRect(0, 0, width, height);
    }

    if (grading.highlights > 0) {
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = `rgba(255, 255, 255, ${(grading.highlights / 100) * 0.2})`;
      ctx.fillRect(0, 0, width, height);
    } else if (grading.highlights < 0) {
      // Recover highlights
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgba(240, 240, 240, ${(Math.abs(grading.highlights) / 100) * 0.15})`;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  // 3. Color Temperature Tint overlay
  if (grading.temperature !== 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    if (grading.temperature > 0) {
      // Warm amber
      ctx.fillStyle = `rgba(255, 175, 75, ${(grading.temperature / 100) * 0.22})`;
    } else {
      // Cool cyan/blue
      ctx.fillStyle = `rgba(75, 160, 255, ${(Math.abs(grading.temperature) / 100) * 0.22})`;
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 4. Vignette overlay
  if (grading.vignette > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.hypot(centerX, centerY);
    const grad = ctx.createRadialGradient(
      centerX,
      centerY,
      maxRadius * 0.35,
      centerX,
      centerY,
      maxRadius * 0.95
    );
    const alpha = (grading.vignette / 100) * 0.85;
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(0, 0, 0, ${alpha.toFixed(2)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 5. Film Grain overlay
  if (grading.filmGrain > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    const grainAlpha = (grading.filmGrain / 100) * 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${grainAlpha.toFixed(2)})`;

    // Fast algorithmic noise pattern
    const step = 4;
    for (let x = 0; x < width; x += step * 3) {
      for (let y = 0; y < height; y += step * 3) {
        if (Math.random() > 0.6) {
          ctx.fillRect(x, y, step, step);
        }
      }
    }
    ctx.restore();
  }
}
