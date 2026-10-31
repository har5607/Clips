import { TransitionType } from '../types';

export interface TransitionRenderParams {
  ctx: CanvasRenderingContext2D;
  canvasA: CanvasImageSource;
  canvasB: CanvasImageSource;
  width: number;
  height: number;
  progress: number; // 0 (start of transition, showing A) to 1 (end of transition, showing B)
  type: TransitionType;
  intensity?: number; // 0 to 100
}

/**
 * High-performance transition renderer combining source frames A and B onto destination canvas.
 */
export function renderTransition({
  ctx,
  canvasA,
  canvasB,
  width,
  height,
  progress,
  type,
  intensity = 70,
}: TransitionRenderParams) {
  const p = Math.max(0, Math.min(1, progress));
  const factor = intensity / 100;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  switch (type) {
    case 'crossfade': {
      // Clean cinematic cross dissolve
      ctx.globalAlpha = 1;
      ctx.drawImage(canvasA, 0, 0, width, height);

      // Smooth cubic bezier easing for dissolve
      const alphaB = Math.sin((p * Math.PI) / 2);
      ctx.globalAlpha = alphaB;
      ctx.drawImage(canvasB, 0, 0, width, height);
      break;
    }

    case 'whip_pan': {
      // Whip Pan: Fast camera sweep with motion blur
      // Ease in-out expo
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const panOffset = -ease * width;

      // Blur intensity peaks in the middle (p = 0.5)
      const blurAmount = Math.sin(p * Math.PI) * 16 * factor;

      // Draw outgoing clip A moving out to the left
      ctx.save();
      if (blurAmount > 1) {
        ctx.filter = `blur(${blurAmount.toFixed(1)}px)`;
      }
      ctx.drawImage(canvasA, panOffset, 0, width, height);
      ctx.restore();

      // Draw incoming clip B sliding in from the right
      ctx.save();
      if (blurAmount > 1) {
        ctx.filter = `blur(${blurAmount.toFixed(1)}px)`;
      }
      ctx.drawImage(canvasB, panOffset + width, 0, width, height);
      ctx.restore();

      // Directional motion streak highlights
      if (blurAmount > 4) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.4, (blurAmount / 16) * 0.4);
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
          const y = (height / 6) * (i + 1);
          ctx.fillRect(0, y, width, 2);
        }
        ctx.restore();
      }
      break;
    }

    case 'zoom_blur': {
      // Zoom Blur Punch: Scale up clip A, punch into clip B
      const peak = Math.sin(p * Math.PI);
      const scaleA = 1 + p * 0.8 * factor;
      const scaleB = 1 + (1 - p) * 0.8 * factor;

      if (p < 0.5) {
        // Zooming in on clip A
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleA, scaleA);
        ctx.translate(-width / 2, -height / 2);
        if (peak * factor > 0.2) {
          ctx.filter = `blur(${(peak * 10 * factor).toFixed(1)}px)`;
        }
        ctx.drawImage(canvasA, 0, 0, width, height);
        ctx.restore();
      } else {
        // Emerging from zoom on clip B
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleB, scaleB);
        ctx.translate(-width / 2, -height / 2);
        if (peak * factor > 0.2) {
          ctx.filter = `blur(${(peak * 10 * factor).toFixed(1)}px)`;
        }
        ctx.drawImage(canvasB, 0, 0, width, height);
        ctx.restore();
      }

      // Chromatic flash at center
      if (peak > 0.6) {
        ctx.save();
        ctx.globalAlpha = (peak - 0.6) * 2 * factor * 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
      break;
    }

    case 'light_leak': {
      // Analog 35mm film burn / light leak
      ctx.drawImage(canvasA, 0, 0, width, height);
      ctx.globalAlpha = p;
      ctx.drawImage(canvasB, 0, 0, width, height);

      // Light leak bloom intensity
      const leakIntensity = Math.sin(p * Math.PI);
      if (leakIntensity > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const grad = ctx.createRadialGradient(
          width * (0.2 + p * 0.6),
          height * 0.3,
          10,
          width * (0.2 + p * 0.6),
          height * 0.4,
          width * 0.85
        );
        const a = (leakIntensity * factor * 0.9).toFixed(2);
        grad.addColorStop(0, `rgba(255, 230, 160, ${a})`);
        grad.addColorStop(0.35, `rgba(255, 120, 40, ${(parseFloat(a) * 0.8).toFixed(2)})`);
        grad.addColorStop(0.7, `rgba(220, 40, 10, ${(parseFloat(a) * 0.4).toFixed(2)})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
      break;
    }

    case 'glitch': {
      // Cyberpunk / Digital slice glitch
      const isGlitchFrame = p > 0.15 && p < 0.85;
      const baseFrame = p < 0.5 ? canvasA : canvasB;

      ctx.drawImage(baseFrame, 0, 0, width, height);

      if (isGlitchFrame) {
        ctx.save();
        const numSlices = Math.floor(6 + factor * 8);

        for (let i = 0; i < numSlices; i++) {
          const sliceH = Math.random() * (height * 0.15);
          const sliceY = Math.random() * (height - sliceH);
          const shiftX = (Math.random() - 0.5) * 60 * factor;

          ctx.drawImage(
            baseFrame,
            0,
            sliceY,
            width,
            sliceH,
            shiftX,
            sliceY,
            width,
            sliceH
          );
        }

        // Chromatic split (Cyan / Red offset)
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.4 * factor;
        ctx.drawImage(baseFrame, -10 * factor, 0, width, height);
        ctx.drawImage(baseFrame, 10 * factor, 0, width, height);

        // Scanline overlay
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1);
        }
        ctx.restore();
      }
      break;
    }

    case 'slide_left': {
      // Fluid push slide left
      const ease = p * p * (3 - 2 * p); // Smoothstep
      const xA = -ease * width;
      const xB = width - ease * width;

      ctx.drawImage(canvasA, xA, 0, width, height);
      ctx.drawImage(canvasB, xB, 0, width, height);

      // Shadow dividing line
      ctx.save();
      const shadowGrad = ctx.createLinearGradient(xB - 30, 0, xB, 0);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(xB - 30, 0, 30, height);
      ctx.restore();
      break;
    }

    case 'film_roll': {
      // Vintage Cinema Film Roll + Strobe
      const rollSpeed = Math.sin(p * Math.PI);
      const rollOffset = (p * height * 2) % height;

      ctx.drawImage(canvasA, 0, rollOffset - height, width, height);
      ctx.drawImage(canvasA, 0, rollOffset, width, height);

      if (p > 0.45) {
        ctx.globalAlpha = Math.min(1, (p - 0.45) * 3);
        ctx.drawImage(canvasB, 0, 0, width, height);
      }

      // Shutter flash at cut point
      const flash = Math.exp(-Math.pow((p - 0.5) * 12, 2));
      if (flash > 0.1) {
        ctx.save();
        ctx.globalAlpha = flash * factor * 0.85;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
      break;
    }

    default: {
      // Hard cut at 0.5
      const source = p < 0.5 ? canvasA : canvasB;
      ctx.drawImage(source, 0, 0, width, height);
      break;
    }
  }

  ctx.restore();
}
