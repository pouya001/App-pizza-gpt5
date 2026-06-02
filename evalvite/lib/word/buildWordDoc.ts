import {
  AlignmentType,
  BorderStyle,
  Document,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import type { Evaluation, Exercice } from '@/lib/types';

const FONT = 'Arial';

// half-points (docx font sizes are in half-points)
function pt(n: number) { return n * 2; }
// millimetres to twips
function mm(n: number) { return Math.round(n * 56.69); }

const TYPE_LABELS: Record<string, string> = {
  qcm: 'Choix multiple',
  texte_a_trous: 'Texte à trous',
  question_ouverte: 'Question ouverte',
  calcul: 'Calcul',
  vrai_faux: 'Vrai ou Faux',
  association: 'Association',
  legende: 'Légende',
  conjugaison: 'Conjugaison',
  tableau: 'Tableau',
};

function toArr(v: string | string[] | undefined | null): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function toStr(v: string | string[] | undefined | null): string {
  if (!v) return '';
  return Array.isArray(v) ? (v[0] ?? '') : v;
}

function blankLine(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '', font: FONT })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA' } },
    spacing: { after: 220 },
  });
}

function answerPara(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: 'Réponse : ', font: FONT, size: pt(10), bold: true, color: '3F6B4E' }),
      new TextRun({ text, font: FONT, size: pt(10) }),
    ],
    shading: { type: ShadingType.CLEAR, fill: 'E8F4EE' },
    spacing: { before: 60, after: 160 },
  });
}

function exHeader(ex: Exercice): Paragraph {
  const label = TYPE_LABELS[ex.type] ?? ex.type;
  const pts = ex.points != null ? `  /${ex.points} pt${ex.points > 1 ? 's' : ''}` : '';
  return new Paragraph({
    children: [
      new TextRun({ text: `Exercice ${ex.numero}`, font: FONT, size: pt(12), bold: true }),
      new TextRun({ text: `  ${label}`, font: FONT, size: pt(10), italics: true, color: '666666' }),
      new TextRun({ text: pts, font: FONT, size: pt(10), color: '999999' }),
    ],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
    spacing: { before: 280, after: 80 },
  });
}

// ─── Exercise type renderers ─────────────────────────────────────────────────

function renderQcm(ex: Exercice, showAnswer: boolean): Paragraph[] {
  const items = (ex.enonce ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  const options = ex.options ?? [];
  const correct = toArr(ex.reponse_correcte);

  if (items.length > 1 && options.length > 0) {
    return items.map((item, i) => {
      const itemCorrect = correct[i] ?? '';
      const optText = options
        .map(opt => `${showAnswer && opt === itemCorrect ? '☑' : '☐'} ${opt}`)
        .join('     ');
      return new Paragraph({
        children: [
          new TextRun({ text: `${item}   →   `, font: FONT, size: pt(11), bold: true }),
          new TextRun({ text: optText, font: FONT, size: pt(11) }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'EEEEEE' } },
        spacing: { after: 60 },
      });
    });
  }

  const singleCorrect = toStr(ex.reponse_correcte);
  return options.map(opt => {
    const isCorrect = showAnswer && opt === singleCorrect;
    return new Paragraph({
      children: [new TextRun({ text: `${isCorrect ? '☑' : '☐'}  ${opt}`, font: FONT, size: pt(11), bold: isCorrect })],
      spacing: { after: 60 },
    });
  });
}

function renderTrous(ex: Exercice, showAnswer: boolean): Paragraph[] {
  const enonce = ex.enonce ?? '';
  const blancs = ex.blancs?.length ? ex.blancs : toArr(ex.reponse_correcte);

  if (!enonce.includes('___')) {
    return [
      new Paragraph({ children: [new TextRun({ text: enonce, font: FONT, size: pt(11) })], spacing: { after: 60 } }),
      showAnswer
        ? answerPara(blancs.join(' / '))
        : blankLine(),
    ];
  }

  const parts = enonce.split('___');
  const runs: TextRun[] = [];
  parts.forEach((part, i) => {
    runs.push(new TextRun({ text: part, font: FONT, size: pt(11) }));
    if (i < parts.length - 1) {
      runs.push(
        showAnswer
          ? new TextRun({ text: blancs[i] ?? '…', font: FONT, size: pt(11), bold: true, color: '3F6B4E', underline: {} })
          : new TextRun({ text: '___________', font: FONT, size: pt(11) })
      );
    }
  });
  return [new Paragraph({ children: runs, spacing: { after: 120 } })];
}

function renderVraiFaux(ex: Exercice, showAnswer: boolean): Paragraph[] {
  const statements = (ex.enonce ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  const correct = toArr(ex.reponse_correcte);

  if (statements.length > 1) {
    return statements.map((stmt, i) => {
      const ans = (correct[i] ?? '').toLowerCase();
      const isVrai = ans.includes('vrai') || ans === 'true';
      const isFaux = ans.includes('faux') || ans === 'false';
      return new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}.  `, font: FONT, size: pt(11), bold: true }),
          new TextRun({ text: `${stmt}     `, font: FONT, size: pt(11) }),
          new TextRun({ text: `${showAnswer && isVrai ? '☑' : '☐'} Vrai     `, font: FONT, size: pt(11) }),
          new TextRun({ text: `${showAnswer && isFaux ? '☑' : '☐'} Faux`, font: FONT, size: pt(11) }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'EEEEEE' } },
        spacing: { after: 60 },
      });
    });
  }

  const ans = toStr(ex.reponse_correcte).toLowerCase();
  const isVrai = ans.includes('vrai');
  const isFaux = ans.includes('faux');
  return [
    new Paragraph({
      children: [
        new TextRun({ text: `${showAnswer && isVrai ? '☑' : '☐'}  Vrai     ${showAnswer && isFaux ? '☑' : '☐'}  Faux`, font: FONT, size: pt(11) }),
      ],
      spacing: { after: 120 },
    }),
  ];
}

function renderAssociation(ex: Exercice, showAnswer: boolean): (Paragraph | Table)[] {
  const leftItems = (ex.enonce ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  const rightItems = ex.options ?? [];
  const correct = toArr(ex.reponse_correcte);
  if (leftItems.length === 0) return [];

  const maxRows = Math.max(leftItems.length, rightItems.length);
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.NONE, size: 0 },
      bottom: { style: BorderStyle.NONE, size: 0 },
      left: { style: BorderStyle.NONE, size: 0 },
      right: { style: BorderStyle.NONE, size: 0 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
      insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'BBBBBB' },
    },
    rows: Array.from({ length: maxRows }).map((_, i) => new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}.  `, font: FONT, size: pt(11), bold: true }),
              new TextRun({ text: leftItems[i] ?? '', font: FONT, size: pt(11) }),
              ...(showAnswer && correct[i]
                ? [new TextRun({ text: `  → ${correct[i]}`, font: FONT, size: pt(11), bold: true, color: '3F6B4E' })]
                : []),
            ],
            spacing: { after: 40 },
          })],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [
              new TextRun({ text: `${String.fromCharCode(65 + i)}.  `, font: FONT, size: pt(11), bold: true, color: '666666' }),
              new TextRun({ text: rightItems[i] ?? '', font: FONT, size: pt(11) }),
            ],
            spacing: { after: 40 },
          })],
        }),
      ],
    })),
  });
  return [table, new Paragraph({ spacing: { after: 160 } })];
}

function renderConjugaison(ex: Exercice, showAnswer: boolean): (Paragraph | Table)[] {
  const PRONOUNS = ["Je / J'", 'Tu', 'Il / Elle', 'Nous', 'Vous', 'Ils / Elles'];
  const answers = toArr(ex.reponse_correcte);
  const table = new Table({
    width: { size: 70, type: WidthType.PERCENTAGE },
    rows: PRONOUNS.map((pronoun, i) => new TableRow({
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
          children: [new Paragraph({ children: [new TextRun({ text: pronoun, font: FONT, size: pt(11), bold: true })], spacing: { after: 40 } })],
        }),
        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            children: [new TextRun({
              text: showAnswer ? (answers[i] ?? '—') : '',
              font: FONT, size: pt(11), bold: showAnswer, color: showAnswer ? '3F6B4E' : '000000',
            })],
            spacing: { after: 40 },
          })],
        }),
      ],
    })),
  });
  return [table, new Paragraph({ spacing: { after: 160 } })];
}

function renderTableau(ex: Exercice, showAnswer: boolean): (Paragraph | Table)[] {
  const colonnes = ex.colonnes ?? [];
  const rowItems = ex.options ?? [];
  const hasPrefilledCol = rowItems.length > 0;
  const rowCount = rowItems.length || 4;
  if (colonnes.length === 0 && !hasPrefilledCol) return [];

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      ...(hasPrefilledCol ? [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: 'E0E0E0' },
        children: [new Paragraph({ children: [], spacing: { after: 40 } })],
      })] : []),
      ...colonnes.map(col => new TableCell({
        shading: { type: ShadingType.CLEAR, fill: 'E0E0E0' },
        children: [new Paragraph({ children: [new TextRun({ text: col, font: FONT, size: pt(11), bold: true })], spacing: { after: 40 } })],
      })),
    ],
  });

  const dataRows = Array.from({ length: rowCount }).map((_, i) => new TableRow({
    children: [
      ...(hasPrefilledCol ? [new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: rowItems[i] ?? '', font: FONT, size: pt(11), bold: true })], spacing: { after: 40 } })],
      })] : []),
      ...colonnes.map(() => new TableCell({
        children: [new Paragraph({ children: [], spacing: { after: 40 } })],
      })),
    ],
  }));

  const result: (Paragraph | Table)[] = [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] })];
  if (showAnswer && ex.explication_corrige) result.push(answerPara(ex.explication_corrige));
  result.push(new Paragraph({ spacing: { after: 160 } }));
  return result;
}

function renderLegende(ex: Exercice, showAnswer: boolean): Paragraph[] {
  const answers = toArr(ex.reponse_correcte);
  const count = answers.length || 4;
  return Array.from({ length: count }).map((_, i) => new Paragraph({
    children: [
      new TextRun({ text: `${i + 1}.  `, font: FONT, size: pt(11), bold: true }),
      showAnswer
        ? new TextRun({ text: answers[i] ?? '—', font: FONT, size: pt(11), bold: true, color: '3F6B4E', underline: {} })
        : new TextRun({ text: '________________________________', font: FONT, size: pt(11) }),
    ],
    spacing: { after: 80 },
  }));
}

function renderOpen(ex: Exercice, showAnswer: boolean): Paragraph[] {
  if (showAnswer) return [answerPara(toArr(ex.reponse_correcte).join(' / ') || '—')];
  return [blankLine(), blankLine(), blankLine()];
}

function renderCalc(ex: Exercice, showAnswer: boolean): Paragraph[] {
  if (showAnswer) return [answerPara(`= ${toArr(ex.reponse_correcte).join(', ') || '—'}`)];
  return [blankLine(), blankLine()];
}

// ─── Main exercise builder ───────────────────────────────────────────────────

function buildExercise(ex: Exercice, showAnswer: boolean): (Paragraph | Table)[] {
  const enonce = ex.enonce ?? '';
  const eenoceLines = enonce.split('\n').map(s => s.trim()).filter(Boolean);
  const isMultiItem = ['qcm', 'association', 'vrai_faux'].includes(ex.type) && eenoceLines.length > 1;

  const items: (Paragraph | Table)[] = [
    exHeader(ex),
    new Paragraph({
      children: [new TextRun({ text: ex.consigne, font: FONT, size: pt(11), bold: true })],
      spacing: { after: 80 },
    }),
  ];

  if (ex.type !== 'texte_a_trous' && !isMultiItem && eenoceLines.length > 0 && enonce !== ex.consigne) {
    eenoceLines.forEach(line => {
      items.push(new Paragraph({
        children: [new TextRun({ text: line, font: FONT, size: pt(11), color: '444444' })],
        spacing: { after: 40 },
      }));
    });
  }

  switch (ex.type) {
    case 'qcm':            items.push(...renderQcm(ex, showAnswer)); break;
    case 'texte_a_trous':  items.push(...renderTrous(ex, showAnswer)); break;
    case 'question_ouverte': items.push(...renderOpen(ex, showAnswer)); break;
    case 'calcul':         items.push(...renderCalc(ex, showAnswer)); break;
    case 'vrai_faux':      items.push(...renderVraiFaux(ex, showAnswer)); break;
    case 'association':    items.push(...renderAssociation(ex, showAnswer)); break;
    case 'legende':        items.push(...renderLegende(ex, showAnswer)); break;
    case 'conjugaison':    items.push(...renderConjugaison(ex, showAnswer)); break;
    case 'tableau':        items.push(...renderTableau(ex, showAnswer)); break;
  }

  if (showAnswer && ex.explication_corrige && !['vrai_faux', 'tableau'].includes(ex.type)) {
    items.push(new Paragraph({
      children: [new TextRun({ text: ex.explication_corrige, font: FONT, size: pt(10), italics: true, color: '666666' })],
      spacing: { after: 60 },
    }));
  }

  return items;
}

// ─── Document assembler ──────────────────────────────────────────────────────

export function buildWordDoc(evaluation: Evaluation, showAnswer: boolean): Document {
  const evalTitle = showAnswer ? `✓ Corrigé — ${evaluation.titre}` : evaluation.titre;

  const header: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: 'Généré avec EvalVite', font: FONT, size: pt(8), color: 'AAAAAA' })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: evaluation.matiere.toUpperCase(), font: FONT, size: pt(9), bold: true, color: '555555' })],
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: evalTitle, font: FONT, size: pt(20), bold: true })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Nom : ', font: FONT, size: pt(11) }),
        new TextRun({ text: '______________________', font: FONT, size: pt(11) }),
        new TextRun({ text: '     Date : ', font: FONT, size: pt(11) }),
        new TextRun({ text: '______________________', font: FONT, size: pt(11) }),
        ...(evaluation.total_points != null ? [
          new TextRun({ text: '     Note : ', font: FONT, size: pt(11) }),
          new TextRun({ text: `          / ${evaluation.total_points}`, font: FONT, size: pt(11) }),
        ] : []),
      ],
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
      },
      spacing: { before: 120, after: 120 },
    }),
  ];

  if (evaluation.consignes_generales) {
    header.push(new Paragraph({
      children: [new TextRun({ text: `📋 ${evaluation.consignes_generales}`, font: FONT, size: pt(10), italics: true })],
      spacing: { after: 60 },
    }));
  }

  if (evaluation.duree_estimee) {
    header.push(new Paragraph({
      children: [new TextRun({ text: `⏱ Durée estimée : ${evaluation.duree_estimee}`, font: FONT, size: pt(10), color: '666666' })],
      spacing: { after: 200 },
    }));
  }

  const exercises = evaluation.exercices.flatMap(ex => buildExercise(ex, showAnswer));

  const footer = new Paragraph({
    children: [new TextRun({ text: 'Généré avec EvalVite', font: FONT, size: pt(9), color: 'AAAAAA' })],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' } },
    spacing: { before: 400 },
  });

  return new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4 in twips
          margin: { top: mm(20), bottom: mm(20), left: mm(18), right: mm(18) },
        },
      },
      children: [...header, ...exercises, footer],
    }],
  });
}
