export interface VideoClip {
  id: string;
  name: string;
  url: string;
  duration: number; // total duration in seconds
  trimStart: number; // trim in seconds
  trimEnd: number; // trim out in seconds
  width?: number;
  height?: number;
  thumbnail?: string;
}

export type ColorPresetId =
  | 'original'
  | 'cinematic'
  | 'teal_orange'
  | 'warm_vintage'
  | 'moody_noir'
  | 'cyberpunk'
  | 'clean_pastel'
  | 'golden_hour';

export interface ColorGrading {
  brightness: number; // -100 to 100 (0 default)
  contrast: number; // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  temperature: number; // -100 (cool) to 100 (warm)
  tint: number; // -100 (green) to 100 (magenta)
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  vignette: number; // 0 to 100
  sharpness: number; // 0 to 100
  filmGrain: number; // 0 to 100
  preset: ColorPresetId;
}

export type TransitionType =
  | 'none'
  | 'crossfade'
  | 'whip_pan'
  | 'zoom_blur'
  | 'light_leak'
  | 'glitch'
  | 'slide_left'
  | 'film_roll';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // seconds (0.2 to 1.5)
  intensity: number; // 0 to 100
  title?: string;
  rationale?: string;
  isAiGenerated?: boolean;
}

export type CaptionPosition = 'top' | 'middle' | 'bottom';
export type CaptionStyle = 'impact' | 'modern' | 'cinematic' | 'neon' | 'subtitle';

export interface CaptionConfig {
  text: string;
  position: CaptionPosition;
  color: string;
  backgroundColor: string;
  hasBackground: boolean;
  fontSize: number; // percentage relative to screen (3 to 14)
  style: CaptionStyle;
}

export interface AiGradeResponse {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  highlights: number;
  shadows: number;
  vignette: number;
  sharpness: number;
  filmGrain: number;
  recommendedFilter: string;
  analysisSummary: string;
  sceneDescription: string;
}

export interface AiTransitionResponse {
  transitionType: TransitionType;
  transitionTitle: string;
  duration: number;
  rationale: string;
  recommendedIntensity: number;
}
