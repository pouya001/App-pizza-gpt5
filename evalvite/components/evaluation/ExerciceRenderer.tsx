import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { Exercice } from '@/lib/types';

interface Props {
  exercice: Exercice;
  showAnswer: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  qcm: 'Choix multiple',
  texte_a_trous: 'Texte à trous',
  question_ouverte: 'Question ouverte',
  calcul: 'Calcul',
  vrai_faux: 'Vrai ou Faux',
  association: 'Association',
  legende: 'Légende',
  conjugaison: 'Conjugaison',
};

function toStringArray(v: string | string[] | undefined | null): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function toString(v: string | string[] | undefined | null): string {
  if (!v) return '';
  return Array.isArray(v) ? v[0] ?? '' : v;
}

function BlankLines({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-3 space-y-3 print:space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-ink/30 pb-0.5" />
      ))}
    </div>
  );
}

function QCMResponse({ exercice, showAnswer }: Props) {
  const options = exercice.options ?? [];
  const correct = toString(exercice.reponse_correcte);
  if (options.length === 0) return <BlankLines count={2} />;
  return (
    <div className="mt-3 space-y-2">
      {options.map((opt, i) => {
        const isCorrect = showAnswer && opt === correct;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className={`h-4 w-4 shrink-0 rounded border-2 ${isCorrect ? 'border-sage bg-sage' : 'border-ink/40'}`}>
              {isCorrect && (
                <svg viewBox="0 0 16 16" fill="none" className="h-full w-full">
                  <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${isCorrect ? 'font-bold text-ink' : 'text-ink'}`}>{opt}</span>
          </div>
        );
      })}
    </div>
  );
}

function TrouResponse({ exercice, showAnswer }: Props) {
  const enonce = exercice.enonce ?? '';
  const blancs = exercice.blancs?.length
    ? exercice.blancs
    : toStringArray(exercice.reponse_correcte);

  if (!enonce.includes('___')) {
    // Pas de marqueurs → affiche le texte normalement + espace de réponse
    return (
      <div className="mt-3">
        <p className="text-sm text-ink-soft">{enonce}</p>
        {showAnswer
          ? <p className="mt-2 rounded-lg border border-sage/30 bg-sage/5 p-2 text-sm font-medium text-sage">{blancs.join(' / ')}</p>
          : <BlankLines count={2} />
        }
      </div>
    );
  }

  const parts = enonce.split('___');
  return (
    <p className="mt-3 text-sm leading-loose">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            showAnswer
              ? <span className="mx-1 inline-block min-w-[60px] border-b-2 border-sage text-center font-bold text-sage">{blancs[i] ?? '…'}</span>
              : <span className="mx-1 inline-block min-w-[60px] border-b-2 border-ink/40">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          )}
        </span>
      ))}
    </p>
  );
}

function OpenResponse({ exercice, showAnswer }: Props) {
  if (showAnswer) {
    const answer = toStringArray(exercice.reponse_correcte).join(' / ') || '—';
    return (
      <div className="mt-3 rounded-lg border border-sage/30 bg-sage/5 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-sage">Réponse :</span>
        <p className="mt-1 text-sm text-ink">{answer}</p>
      </div>
    );
  }
  return <BlankLines count={3} />;
}

function VraiFauxResponse({ exercice, showAnswer }: Props) {
  const correct = toString(exercice.reponse_correcte).toLowerCase();
  const isVrai = correct.includes('vrai') || correct === 'true' || correct === 'v';
  const isFaux = correct.includes('faux') || correct === 'false' || correct === 'f';

  return (
    <div className="mt-3 space-y-3">
      <div className="flex gap-8">
        {(['Vrai', 'Faux'] as const).map((v) => {
          const isSelected = showAnswer && ((v === 'Vrai' && isVrai) || (v === 'Faux' && isFaux));
          return (
            <div key={v} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded border-2 ${isSelected ? 'border-sage bg-sage' : 'border-ink/40'}`}>
                {isSelected && (
                  <svg viewBox="0 0 16 16" fill="none" className="h-full w-full">
                    <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{v}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-end gap-2">
        <span className="shrink-0 text-xs text-ink-soft">Justification :</span>
        {showAnswer
          ? <span className="border-b border-sage pb-0.5 text-sm font-medium text-ink">{exercice.explication_corrige ?? '—'}</span>
          : <div className="flex-1 border-b border-ink/30 pb-0.5" />
        }
      </div>
    </div>
  );
}

function ConjugaisonResponse({ exercice, showAnswer }: Props) {
  const PRONOUNS = ["Je / J'", 'Tu', 'Il / Elle', 'Nous', 'Vous', 'Ils / Elles'];
  const answers = toStringArray(exercice.reponse_correcte);
  return (
    <table className="mt-3 w-full border-collapse text-sm">
      <tbody>
        {PRONOUNS.map((pronoun, i) => (
          <tr key={pronoun} className="border-b border-line">
            <td className="w-28 py-2 pr-4 font-medium text-ink-soft">{pronoun}</td>
            <td className="py-2">
              {showAnswer
                ? <span className="font-medium text-ink">{answers[i] ?? '—'}</span>
                : <div className="min-w-[120px] border-b border-ink/30">&nbsp;</div>
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AssociationResponse({ exercice, showAnswer }: Props) {
  if (showAnswer) {
    const answer = toStringArray(exercice.reponse_correcte).join(' • ') || (exercice.enonce ?? '');
    return (
      <div className="mt-3 rounded-lg border border-sage/30 bg-sage/5 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-sage">Corrigé :</span>
        <p className="mt-1 text-sm text-ink">{answer}</p>
      </div>
    );
  }
  const options = exercice.options ?? [];
  if (options.length === 0) return <BlankLines count={4} />;
  return (
    <div className="mt-3 space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="shrink-0 text-sm font-medium text-ink-soft">{i + 1}.</span>
          <span className="text-sm text-ink">{opt}</span>
          <div className="ml-4 flex-1 border-b border-dashed border-ink/30" />
        </div>
      ))}
    </div>
  );
}

function LegendeResponse({ exercice, showAnswer }: Props) {
  const answers = toStringArray(exercice.reponse_correcte);
  const count = answers.length || 4;
  return (
    <div className="mt-3 space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/40 text-xs font-bold text-ink">
            {i + 1}
          </span>
          {showAnswer
            ? <span className="border-b border-sage pb-0.5 text-sm font-medium text-ink">{answers[i] ?? '—'}</span>
            : <div className="flex-1 border-b border-ink/30 pb-0.5" />
          }
        </div>
      ))}
    </div>
  );
}

function CalcResponse({ exercice, showAnswer }: Props) {
  if (showAnswer) {
    const answer = toStringArray(exercice.reponse_correcte).join(', ') || '—';
    return (
      <div className="mt-3 rounded-lg border border-sage/30 bg-sage/5 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-sage">= {answer}</span>
      </div>
    );
  }
  return <div className="mt-3 h-16 rounded-lg border border-dashed border-ink/30 bg-paper-dark" />;
}

function ExerciceContent({ exercice, showAnswer }: Props) {
  const typeLabel = TYPE_LABELS[exercice.type] ?? exercice.type;
  const enonce = exercice.enonce ?? '';
  const consigne = exercice.consigne ?? '';

  return (
    <div className="exercice-block break-inside-avoid rounded-xl border border-line bg-paper p-5 shadow-sm print:rounded-none print:border-0 print:border-b print:border-line print:shadow-none print:px-0">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-base font-bold text-ink">Exercice {exercice.numero}</span>
        <span className="text-xs italic text-ink-soft">{typeLabel}</span>
        {exercice.points != null && (
          <span className="ml-auto text-xs font-medium text-ink-soft">
            /{exercice.points} pt{exercice.points > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <p className="font-semibold text-sm text-ink">{consigne}</p>

      {exercice.type !== 'texte_a_trous' && enonce && enonce !== consigne && (
        <p className="mt-1.5 text-sm text-ink-soft">{enonce}</p>
      )}

      {exercice.type === 'qcm' && <QCMResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'texte_a_trous' && <TrouResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'question_ouverte' && <OpenResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'vrai_faux' && <VraiFauxResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'conjugaison' && <ConjugaisonResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'association' && <AssociationResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'legende' && <LegendeResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'calcul' && <CalcResponse exercice={exercice} showAnswer={showAnswer} />}

      {showAnswer && exercice.explication_corrige && exercice.type !== 'vrai_faux' && (
        <p className="mt-3 rounded-md bg-paper-dark px-3 py-1.5 text-xs text-ink-soft">
          💡 {exercice.explication_corrige}
        </p>
      )}
    </div>
  );
}

// Chaque exercice est isolé dans son propre ErrorBoundary
// → si un exercice plante, les autres restent affichés
export function ExerciceRenderer(props: Props) {
  return (
    <ErrorBoundary>
      <ExerciceContent {...props} />
    </ErrorBoundary>
  );
}
