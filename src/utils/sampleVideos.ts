export interface SampleVideoOption {
  id: string;
  name: string;
  category: string;
  duration: number;
  url: string;
  thumbnailColor: string;
  description: string;
}

export const SAMPLE_VIDEOS: SampleVideoOption[] = [
  {
    id: 'sample-coastal-drone',
    name: 'Coastal Cliffs & Waves',
    category: 'Cinematic Nature',
    duration: 8,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailColor: 'from-blue-600 to-cyan-500',
    description: 'Dynamic aerial perspective over sunny coastal waters and rocky cliffs.',
  },
  {
    id: 'sample-city-night',
    name: 'Urban Metropolis Night',
    category: 'City & Lights',
    duration: 10,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailColor: 'from-purple-600 to-pink-500',
    description: 'Neon skyline lights, high contrast night scene ideal for color grading.',
  },
  {
    id: 'sample-action-park',
    name: 'Action Sports & Motion',
    category: 'Kinetic Action',
    duration: 12,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailColor: 'from-amber-500 to-red-600',
    description: 'Fast-paced outdoor motion, great for testing AI whip pan & zoom transitions.',
  },
  {
    id: 'sample-golden-sunset',
    name: 'Golden Hour Sunset Flight',
    category: 'Golden Hour',
    duration: 10,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailColor: 'from-orange-500 to-amber-700',
    description: 'Warm evening light with backlight glow, optimal for AI auto color correction.',
  },
];

/**
 * Creates a procedural 5-second animated clip using an HTML5 canvas and MediaRecorder.
 * Guarantees zero CORS issues and works 100% offline!
 */
export async function createProceduralVideoBlob(
  type: 'synthwave' | 'cinematic_landscape' | 'cyber_tunnel',
  title: string
): Promise<{ url: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Cannot create canvas 2d context'));

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
      ? 'video/webm; codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      resolve({ url, duration: 5 });
    };

    recorder.start();

    const startTime = performance.now();
    const durationMs = 5000;

    function renderFrame(now: number) {
      if (!ctx) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const t = elapsed / 1000;

      // Draw aesthetic procedural animation
      ctx.clearRect(0, 0, 1280, 720);

      if (type === 'synthwave') {
        // Gradient sky
        const grad = ctx.createLinearGradient(0, 0, 0, 720);
        grad.addColorStop(0, '#0f0c29');
        grad.addColorStop(0.6, '#302b63');
        grad.addColorStop(0.7, '#ff007f');
        grad.addColorStop(1, '#110022');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1280, 720);

        // Retro glowing sun
        const sunY = 360 + Math.sin(t * 0.5) * 20;
        const sunGrad = ctx.createLinearGradient(640, sunY - 140, 640, sunY + 140);
        sunGrad.addColorStop(0, '#fff346');
        sunGrad.addColorStop(1, '#ff007f');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(640, sunY, 130, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal sun blind lines
        ctx.fillStyle = '#110022';
        for (let i = 0; i < 7; i++) {
          const y = sunY + 15 + i * 16;
          const h = 3 + i * 2;
          ctx.fillRect(640 - 130, y, 260, h);
        }

        // Perspective 3D grid
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -640; x <= 1920; x += 80) {
          ctx.moveTo(640 + (x - 640) * 0.1, 450);
          ctx.lineTo(x, 720);
        }
        ctx.stroke();

        // Moving horizontal grid lines
        const gridOffset = (t * 120) % 50;
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 1.5;
        for (let y = 450; y <= 720; y += 22) {
          const actualY = y + gridOffset * ((y - 450) / 270);
          if (actualY <= 720) {
            ctx.beginPath();
            ctx.moveTo(0, actualY);
            ctx.lineTo(1280, actualY);
            ctx.stroke();
          }
        }
      } else if (type === 'cinematic_landscape') {
        // Sunset mountains
        const sky = ctx.createLinearGradient(0, 0, 0, 500);
        sky.addColorStop(0, '#ff7e5f');
        sky.addColorStop(0.5, '#feb47b');
        sky.addColorStop(1, '#ffeccc');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 1280, 720);

        // Sun
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(400, 300 - t * 15, 70, 0, Math.PI * 2);
        ctx.fill();

        // Mountain layers with parallax
        const layers = [
          { color: '#885566', speed: 10, baseY: 380, amp: 70 },
          { color: '#553344', speed: 25, baseY: 460, amp: 90 },
          { color: '#221122', speed: 50, baseY: 560, amp: 100 },
        ];

        layers.forEach((l) => {
          ctx.fillStyle = l.color;
          ctx.beginPath();
          ctx.moveTo(0, 720);
          for (let x = 0; x <= 1280; x += 40) {
            const y = l.baseY + Math.sin((x + t * l.speed) * 0.005) * l.amp + Math.cos((x * 0.01)) * 30;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(1280, 720);
          ctx.closePath();
          ctx.fill();
        });
      } else {
        // Cyber tunnel
        ctx.fillStyle = '#05050d';
        ctx.fillRect(0, 0, 1280, 720);

        for (let ring = 0; ring < 12; ring++) {
          const rProgress = ((ring / 12) + t * 0.4) % 1;
          const rad = Math.pow(rProgress, 2) * 500;
          ctx.strokeStyle = `hsl(${(ring * 30 + t * 60) % 360}, 90%, 60%)`;
          ctx.lineWidth = 3 + rProgress * 5;
          ctx.beginPath();
          ctx.arc(640, 360, rad, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Title overlay on demo clip
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(50, 50, 420, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(title, 70, 88);

      if (progress < 1) {
        requestAnimationFrame(renderFrame);
      } else {
        recorder.stop();
      }
    }

    requestAnimationFrame(renderFrame);
  });
}
