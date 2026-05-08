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

function BlankLines({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-3 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-ink/30 pb-0.5" />
      ))}
    </div>
  );
}

function QCMResponse({ exercice, showAnswer }: Props) {
  const options = exercice.options ?? [];
  const correct = Array.isArray(exercice.reponse_correcte)
    ? exercice.reponse_correcte[0]
    : exercice.reponse_correcte;

  return (
    <div className="mt-3 space-y-2">
      {options.map((opt) => {
        const isCorrect = showAnswer && opt === correct;
        return (
          <div key={opt} className="flex items-center gap-3">
            <div
              className={`h-4 w-4 shrink-0 rounded border-2 ${isCorrect ? 'border-sage bg-sage' : 'border-ink/40'}`}
            >
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
  const blancs = exercice.blancs ?? (
    Array.isArray(exercice.reponse_correcte) ? exercice.reponse_correcte : [exercice.reponse_correcte]
  );
  const parts = exercice.enonce.split('___');

  return (
    <p className="mt-3 text-sm leading-loose">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            showAnswer ? (
              <span className="mx-1 inline-block min-w-[60px] border-b-2 border-sage text-center font-bold text-sage">
                {blancs[i] ?? '…'}
              </span>
            ) : (
              <span className="mx-1 inline-block min-w-[60px] border-b-2 border-ink/40">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            )
          )}
        </span>
      ))}
    </p>
  );
}

function OpenResponse({ exercice, showAnswer }: Props) {
  if (showAnswer) {
    const answer = Array.isArray(exercice.reponse_correcte)
      ? exercice.reponse_correcte.join(' / ')
      : exercice.reponse_correcte;
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
  const correct = Array.isArray(exercice.reponse_correcte)
    ? exercice.reponse_correcte[0]
    : exercice.reponse_correcte;
  const isVrai = correct?.toLowerCase().includes('vrai');

  return (
    <div className="mt-3 space-y-3">
      <div className="flex gap-8">
        {['Vrai', 'Faux'].map((v) => {
          const isSelected = showAnswer && ((v === 'Vrai') === isVrai);
          return (
            <div key={v} className="flex items-center gap-2">
              <div
                className={`h-4 w-4 rounded border-2 ${isSelected ? 'border-sage bg-sage' : 'border-ink/40'}`}
              >
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
        {showAnswer ? (
          <span className="border-b border-sage pb-0.5 text-sm font-medium text-ink">
            {exercice.explication_corrige ?? '—'}
          </span>
        ) : (
          <div className="flex-1 border-b border-ink/30 pb-0.5" />
        )}
      </div>
    </div>
  );
}

function ConjugaisonResponse({ exercice, showAnswer }: Props) {
  const PRONOUNS = ['Je / J\'', 'Tu', 'Il / Elle', 'Nous', 'Vous', 'Ils / Elles'];
  const answers = Array.isArray(exercice.reponse_correcte)
    ? exercice.reponse_correcte
    : [exercice.reponse_correcte];

  return (
    <table className="mt-3 w-full border-collapse text-sm">
      <tbody>
        {PRONOUNS.map((pronoun, i) => (
          <tr key={pronoun} className="border-b border-line">
            <td className="py-2 pr-4 font-medium text-ink-soft w-28">{pronoun}</td>
            <td className="py-2">
              {showAnswer ? (
                <span className="font-medium text-ink">{answers[i] ?? '—'}</span>
              ) : (
                <div className="border-b border-ink/30 min-w-[120px]">&nbsp;</div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AssociationResponse({ exercice, showAnswer }: Props) {
  if (showAnswer) {
    const answer = Array.isArray(exercice.reponse_correcte)
      ? exercice.reponse_correcte.join(' • ')
      : exercice.reponse_correcte;
    return (
      <div className="mt-3 rounded-lg border border-sage/30 bg-sage/5 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-sage">Corrigé :</span>
        <p className="mt-1 text-sm text-ink">{answer}</p>
      </div>
    );
  }
  return (
    <div className="mt-3 space-y-2">
      {(exercice.options ?? []).map((opt, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="shrink-0 text-sm font-medium text-ink-soft">{i + 1}.</span>
          <span className="text-sm text-ink">{opt}</span>
          <div className="ml-4 flex-1 border-b border-dashed border-ink/30" />
        </div>
      ))}
      {exercice.options?.length === 0 && <BlankLines count={4} />}
    </div>
  );
}

function LegendeResponse({ exercice, showAnswer }: Props) {
  const answers = Array.isArray(exercice.reponse_correcte)
    ? exercice.reponse_correcte
    : [exercice.reponse_correcte];

  return (
    <div className="mt-3 space-y-2.5">
      {answers.map((ans, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/40 text-xs font-bold text-ink">
            {i + 1}
          </span>
          {showAnswer ? (
            <span className="border-b border-sage pb-0.5 text-sm font-medium text-ink">{ans}</span>
          ) : (
            <div className="flex-1 border-b border-ink/30 pb-0.5" />
          )}
        </div>
      ))}
    </div>
  );
}

function CalcResponse({ exercice, showAnswer }: Props) {
  if (showAnswer) {
    const answer = Array.isArray(exercice.reponse_correcte)
      ? exercice.reponse_correcte.join(', ')
      : exercice.reponse_correcte;
    return (
      <div className="mt-3 rounded-lg border border-sage/30 bg-sage/5 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-sage">= {answer}</span>
      </div>
    );
  }
  return (
    <div className="mt-3 h-16 rounded-lg border border-dashed border-ink/30 bg-paper-dark" />
  );
}

export function ExerciceRenderer({ exercice, showAnswer }: Props) {
  const typeLabel = TYPE_LABELS[exercice.type] ?? exercice.type;

  return (
    <div className="exercice-block break-inside-avoid rounded-xl border border-line bg-paper p-5 shadow-sm print:rounded-none print:border-0 print:border-b print:border-line print:shadow-none print:px-0">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-base font-bold text-ink">Exercice {exercice.numero}</span>
        <span className="text-xs italic text-ink-soft">{typeLabel}</span>
        {exercice.points !== undefined && (
          <span className="ml-auto text-xs font-medium text-ink-soft">
            /{exercice.points} pt{exercice.points > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Consigne */}
      <p className="font-semibold text-sm text-ink">{exercice.consigne}</p>

      {/* Enoncé (only shown if different from consigne and not handled by TrouResponse) */}
      {exercice.type !== 'texte_a_trous' && exercice.enonce && exercice.enonce !== exercice.consigne && (
        <p className="mt-1.5 text-sm text-ink-soft">{exercice.enonce}</p>
      )}

      {/* Response space */}
      {exercice.type === 'qcm' && <QCMResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'texte_a_trous' && <TrouResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'question_ouverte' && <OpenResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'vrai_faux' && <VraiFauxResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'conjugaison' && <ConjugaisonResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'association' && <AssociationResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'legende' && <LegendeResponse exercice={exercice} showAnswer={showAnswer} />}
      {exercice.type === 'calcul' && <CalcResponse exercice={exercice} showAnswer={showAnswer} />}

      {/* Corrigé explanation */}
      {showAnswer && exercice.explication_corrige && exercice.type !== 'vrai_faux' && (
        <p className="mt-3 rounded-md bg-paper-dark px-3 py-1.5 text-xs text-ink-soft">
          💡 {exercice.explication_corrige}
        </p>
      )}
    </div>
  );
}
