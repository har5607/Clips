import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Film,
  Layers,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Award,
  Globe,
  Sliders,
  TrendingUp,
} from 'lucide-react';

export const SeoContentSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is KromaFlow AI and why is it rated the #1 online video editor?',
      a: 'KromaFlow AI is a next-generation browser-based video editing suite engineered for speed, privacy, and visual polish. Unlike traditional web editors that require uploading heavy gigabyte files to cloud servers, KromaFlow AI processes your video 100% in your browser using high-performance HTML5 Canvas and WebCodecs technology. It combines one-click Gemini neural auto color grading with 7 procedural AI cinematic transitions.',
    },
    {
      q: 'How does AI Automatic Color Grading work?',
      a: 'When you click "AI Auto Grade", the app captures video frames and leverages Google Gemini AI models to analyze the scene histogram, lighting distribution, white balance cast, highlights clipping, and skin tone fidelity. It returns tailored colorist adjustments—modulating temperature, tint, contrast, shadows, highlights, vignette, and 35mm grain—to give your footage an authentic Hollywood film look instantly.',
    },
    {
      q: 'Which AI transitions are available?',
      a: 'KromaFlow AI features 7 GPU-accelerated procedural transitions: Dynamic Whip Pan (kinetic directional motion blur), Zoom Blur Punch (optical push-in with RGB dispersion), Light Leak & Film Burn (warm 35mm analog bloom), Cyber Glitch (digital RGB slice & scanlines), Cross Dissolve (luminous optical blend), Fluid Slide, and 35mm Film Roll with shutter flash. Our AI Scene Matcher inspects adjacent clips to automatically recommend the optimal transition based on camera movement.',
    },
    {
      q: 'Are my videos uploaded to a cloud server or kept private?',
      a: 'Your video files are 100% private and never leave your computer. All trimming, filtering, color grading, transition effects, and rendering are executed directly on your device’s GPU and browser engine. No third-party servers store or view your footage.',
    },
    {
      q: 'Can I export in full resolution with no watermarks?',
      a: 'Yes. You can export complete edited videos in high-definition (1080p WebM/VP9) or download single graded frames as uncompressed PNG stills completely free with zero watermarks.',
    },
  ];

  return (
    <section
      id="seo-knowledge-hub"
      aria-label="KromaFlow AI Feature Guide and Overview"
      className="mt-12 border-t border-zinc-800/80 pt-12 pb-16 text-zinc-300"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-16">
        {/* Main SEO Header with Semantic Heading Hierarchy */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Ranked #1 In-Browser AI Video Editor
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Professional AI Video Editing & Auto Color Grading{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-300 bg-clip-text text-transparent">
              Without the Upload Wait
            </span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Create cinema-grade videos directly in your browser with KromaFlow. Powered by Google Gemini AI
            for intelligent scene colorization, camera momentum transitions, and kinetic captions.
          </p>
        </div>

        {/* 3 Core Value Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold text-white">
              AI Automatic Color Grading
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No need to learn complex color wheels or manual tone curves. Gemini evaluates frame
              exposure, highlights, shadows, and color casts to balance and grade footage in one
              click with Hollywood presets like 35mm Cinematic, Teal & Orange, and Golden Hour.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              AI Scene Cut & Transitions
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Say goodbye to boring hard cuts. Our AI transition director detects motion vectors
              and focal changes between adjacent clips to auto-recommend dynamic whip pans, zoom
              blur punches, 35mm film burns, and digital glitch artifacts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              100% Client-Side Privacy
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your personal footage never leaves your computer. All trimming, effects processing,
              and video rendering execute directly in your browser canvas using WebCodecs. Fast,
              private, and zero bandwidth waste.
            </p>
          </div>
        </div>

        {/* Feature Comparison Matrix for SEO Richness */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-white">
              Why Creators Choose KromaFlow AI over Competitors
            </h3>
            <p className="text-xs text-zinc-400">
              How KromaFlow AI compares against legacy desktop apps and slow cloud uploaders
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-300">
                <tr>
                  <th className="p-4 font-semibold">Features & Capabilities</th>
                  <th className="p-4 font-bold text-indigo-400 bg-indigo-950/30 border-x border-indigo-500/20">
                    KromaFlow AI
                  </th>
                  <th className="p-4 font-semibold text-zinc-400">Cloud Editors (CapCut/Canva)</th>
                  <th className="p-4 font-semibold text-zinc-400">Desktop (Premiere/DaVinci)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                <tr>
                  <td className="p-4 font-medium text-white">Zero Cloud Upload Wait</td>
                  <td className="p-4 bg-indigo-950/20 border-x border-indigo-500/20 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Instant in-browser
                  </td>
                  <td className="p-4 text-zinc-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" /> Requires gigabyte uploads
                  </td>
                  <td className="p-4 text-zinc-400">Local files only</td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-white">AI Neural Color Grading</td>
                  <td className="p-4 bg-indigo-950/20 border-x border-indigo-500/20 text-emerald-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> 1-Click Gemini Analysis
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-amber-500 shrink-0" /> Basic static filters only
                  </td>
                  <td className="p-4 text-zinc-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-amber-500 shrink-0" /> Complex manual wheels
                  </td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-white">AI Momentum Transitions</td>
                  <td className="p-4 bg-indigo-950/20 border-x border-indigo-500/20 text-emerald-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> 7 Procedural Motion Styles
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400">Generic cookie-cutter wipes</td>
                  <td className="p-4 text-zinc-400">Manual keyframing plugins</td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-white">Data Privacy & Security</td>
                  <td className="p-4 bg-indigo-950/20 border-x border-indigo-500/20 text-emerald-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> 100% Client-Side Private
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" /> Video sent to servers
                  </td>
                  <td className="p-4 text-zinc-300">Local</td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-white">Cost & Watermarks</td>
                  <td className="p-4 bg-indigo-950/20 border-x border-indigo-500/20 text-emerald-400 font-bold">
                    100% Free / Zero Watermarks
                  </td>
                  <td className="p-4 text-zinc-400">Watermarks or $15/mo</td>
                  <td className="p-4 text-zinc-400">$20 - $55 / month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive FAQ Accordion (matches JSON-LD FAQPage for Google Search snippet) */}
        <div id="faq" className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1 mb-6">
            <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-zinc-400">
              Everything you need to know about browser-based AI video editing
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-850/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-zinc-200">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Google SEO Quality Badges & Metadata Footer */}
        <div className="pt-8 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> 60 FPS Canvas WebCodecs
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Zero Server Storage
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> Compatible All Browsers
            </span>
          </div>

          <div>
            <span>© 2026 KromaFlow AI. Next-Gen In-Browser Video Editor.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
