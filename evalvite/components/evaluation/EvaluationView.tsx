'use client';

import { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { MatiereBadge } from '@/components/ui/Badge';
import { ExerciceRenderer } from './ExerciceRenderer';
import type { Evaluation } from '@/lib/types';

interface Props {
  evaluation: Evaluation;
  onBack: () => void;
}

export function EvaluationView({ evaluation, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'eval' | 'corrige'>('eval');
  const showAnswer = activeTab === 'corrige';

  const evalTitle = showAnswer
    ? `✓ Corrigé — ${evaluation.titre}`
    : evaluation.titre;

  return (
    <div className="min-h-screen bg-white">
      {/* Action bar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-dark hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          {/* Tabs */}
          <div className="flex rounded-xl border border-line bg-paper-dark p-1">
            {(['eval', 'corrige'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-ink text-paper shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {tab === 'eval' ? 'Évaluation' : 'Corrigé'}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-brick px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brick-dark"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="mx-auto max-w-2xl px-4 py-8 print:max-w-none print:px-0 print:py-0">

        {/* Print-only header */}
        <div className="hidden print:block print:mb-6">
          <p className="text-[10px] text-gray-400">Généré avec EvalVite</p>
        </div>

        {/* Eval header */}
        <div className="mb-6 space-y-3 print:mb-8">
          <MatiereBadge label={evaluation.matiere} className="print:hidden" />
          <p className="print:block hidden text-xs font-semibold uppercase tracking-widest text-ink">
            {evaluation.matiere}
          </p>

          <h1 className="font-display text-2xl font-bold text-ink print:text-xl">
            {evalTitle}
          </h1>

          {/* Nom / Date / Note */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-t border-line py-3">
            {[
              { label: 'Nom', width: 'min-w-[140px]' },
              { label: 'Date', width: 'min-w-[100px]' },
              {
                label: 'Note',
                value: evaluation.total_points ? `     / ${evaluation.total_points}` : undefined,
                width: 'min-w-[80px]',
              },
            ].map(({ label, value, width }) => (
              <div key={label} className="flex items-end gap-2">
                <span className="text-sm font-medium text-ink-soft">{label} :</span>
                <div className={`border-b border-ink/40 pb-0.5 ${width} print:min-w-[120px]`}>
                  <span className="text-sm text-ink-soft">{value ?? ''}</span>
                </div>
              </div>
            ))}
          </div>

          {evaluation.consignes_generales && (
            <p className="rounded-lg bg-paper-dark p-3 text-sm text-ink-soft print:rounded-none print:bg-transparent print:p-0 print:text-xs">
              📋 {evaluation.consignes_generales}
            </p>
          )}

          {evaluation.duree_estimee && (
            <p className="text-xs text-ink-soft">⏱ Durée estimée : {evaluation.duree_estimee}</p>
          )}
        </div>

        {/* Exercises */}
        <div className="space-y-4 print:space-y-6">
          {evaluation.exercices.map((ex) => (
            <ExerciceRenderer key={ex.numero} exercice={ex} showAnswer={showAnswer} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-line pt-4 text-center print:mt-8">
          <p className="text-xs text-ink-soft">Généré avec EvalVite</p>
        </div>
      </div>
    </div>
  );
}
