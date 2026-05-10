'use client';

import { useRef, useState, useEffect } from 'react';
import { UploadZone } from '@/components/upload/UploadZone';
import { GeneratingScreen } from '@/components/GeneratingScreen';
import { EvaluationView } from '@/components/evaluation/EvaluationView';
import type { UploadedFile, Evaluation } from '@/lib/types';

const STORAGE_KEY = 'evalvite_last_evaluation';

function saveEvaluation(ev: Evaluation) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ev)); } catch {}
}

function loadEvaluation(): Evaluation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Evaluation) : null;
  } catch { return null; }
}

function clearEvaluation() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

type Step = 'upload' | 'generating' | 'result';

export default function HomePage() {
  // Initialise depuis localStorage au montage pour survivre aux rechargements
  const [step, setStep] = useState<Step>('upload');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [hint, setHint] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restaure le dernier résultat si la page a été rechargée pendant/après la génération
  useEffect(() => {
    const saved = loadEvaluation();
    if (saved) {
      setEvaluation(saved);
      setStep('result');
    }
  }, []);

  async function handleGenerate() {
    if (files.length === 0) return;
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;
    setStep('generating');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map((f) => ({ name: f.name, mimeType: f.mimeType, data: f.data })),
          hint: hint.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Erreur lors de la génération.');
      }

      const body = (await res.json()) as { evaluation: Evaluation };

      // Sauvegarde immédiate → survive au rechargement de la page
      saveEvaluation(body.evaluation);
      setEvaluation(body.evaluation);
      setStep('result');
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setStep('upload');
        return;
      }
      setError((err as Error).message ?? 'Erreur inattendue.');
      setStep('upload');
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    setStep('upload');
  }

  function handleReset() {
    clearEvaluation();
    setStep('upload');
    setFiles([]);
    setHint('');
    setEvaluation(null);
    setError(null);
  }

  if (step === 'generating') return <GeneratingScreen onCancel={handleCancel} />;
  if (step === 'result' && evaluation)
    return <EvaluationView evaluation={evaluation} onBack={handleReset} />;

  return (
    <main className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-line bg-paper-dark px-6 py-4">
        <h1 className="font-display text-2xl font-bold text-ink">EvalVite</h1>
        <p className="text-xs text-ink-soft">Du cours à l'évaluation en 60 secondes</p>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold leading-tight text-ink">
            Préparez une évaluation
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Photographiez ou importez les pages du cours, et obtenez une évaluation adaptée prête à imprimer.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <UploadZone files={files} onFilesChange={setFiles} maxFiles={12} />

        {files.length > 0 && (
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-ink-soft">
              Précision <span className="font-normal">(facultatif)</span>
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="ex. Insister sur la conjugaison, plus de calcul mental…"
              className="w-full border-0 border-b-2 border-line bg-transparent py-2 text-sm text-ink placeholder-ink-soft/50 focus:border-brick focus:outline-none transition-colors"
            />
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleGenerate}
            disabled={files.length === 0}
            className="w-full rounded-2xl bg-ink py-4 text-base font-semibold text-paper shadow-card transition-all hover:bg-brick hover:shadow-card-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Générer l'évaluation
          </button>
          {files.length === 0 && (
            <p className="mt-3 text-center text-xs text-ink-soft">
              Ajoutez au moins un document pour continuer
            </p>
          )}
          {files.length > 0 && (
            <p className="mt-3 text-center text-xs text-ink-soft">
              {files.length} document{files.length > 1 ? 's' : ''} • Environ 30 à 60 secondes
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
