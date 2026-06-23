'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  { label: 'Lecture du cours' },
  { label: 'Identification de la matière' },
  { label: 'Extraction des concepts clés' },
  { label: 'Création des exercices' },
  { label: 'Préparation du corrigé' },
];

// Step advances every ~10s, stops at last step (API response will replace this screen)
const STEP_TIMINGS = [4000, 12000, 22000, 35000];

interface GeneratingScreenProps {
  onCancel: () => void;
}

export function GeneratingScreen({ onCancel }: GeneratingScreenProps) {
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const timers = STEP_TIMINGS.map((delay, i) =>
      setTimeout(() => setDoneCount(i + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const currentStep = Math.min(doneCount, STEPS.length - 1);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-ink">EvalVite</h1>
        </div>

        {/* Spinner */}
        <div className="flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-line" />
            <div className="absolute inset-0 rounded-full border-4 border-brick border-t-transparent animate-spin" />
            <span className="text-2xl">✏️</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const isDone = i < doneCount;
            const isCurrent = i === currentStep && !isDone;
            return (
              <div
                key={step.label}
                className="flex items-center gap-3 transition-opacity duration-300"
                style={{ opacity: i > doneCount ? 0.35 : 1 }}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isDone
                      ? 'border-sage bg-sage text-white'
                      : isCurrent
                        ? 'border-brick bg-brick/10'
                        : 'border-line bg-paper'
                  }`}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brick" />
                  ) : null}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isDone ? 'text-ink' : isCurrent ? 'text-brick' : 'text-ink-soft'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink-soft">Environ 30 à 60 secondes</p>

        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-xl border border-line bg-paper py-2.5 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
