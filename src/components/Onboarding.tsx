import React, { useState } from 'react';
import { Shield, Compass, CheckCircle, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Compass className="w-12 h-12 text-amber-400" />,
      tagline: "One thing. Right now.",
      title: "Intent over restriction",
      description: "We don't tell you 'don't use Instagram.' We say: 'You said this matters right now. Let's protect it.' You stay in control.",
    },
    {
      icon: <Shield className="w-12 h-12 text-emerald-400" />,
      tagline: "No shame. Ever.",
      title: "Compassionate recovery",
      description: "Distraction is not a moral failure. You never lose a streak or get punished. When you drift, we simply ask: 'Come back?'",
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-amber-300" />,
      tagline: "Meaningful output",
      title: "Outcomes over screen time",
      description: "We measure what you actually accomplished, how quickly you recovered, and your deep focus—not just empty hours sitting at a desk.",
    }
  ];

  const current = slides[step];

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-obsidian-700 shadow-2xl relative overflow-hidden">
        {/* Subtle ambient background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 p-4 rounded-2xl bg-obsidian-850 border border-obsidian-700/60 shadow-inner">
            {current.icon}
          </div>

          <span className="text-xs font-mono tracking-widest uppercase text-amber-400/90 mb-2">
            {current.tagline}
          </span>

          <h2 className="text-2xl font-semibold text-white tracking-tight mb-3">
            {current.title}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            {current.description}
          </p>

          <div className="flex items-center justify-between w-full mt-4">
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-8 bg-amber-400' : 'w-2 bg-obsidian-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (step < slides.length - 1) {
                  setStep(step + 1);
                } else {
                  onComplete();
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-obsidian-950 font-medium text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-md"
            >
              {step === slides.length - 1 ? 'Begin Focusing' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
