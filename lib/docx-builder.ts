import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  PageBreak,
  AlignmentType,
  BorderStyle,
  WidthType,
  Table,
  TableRow,
  TableCell,
  VerticalAlign,
} from "docx";
import {
  Evaluation,
  Exercise,
  FillBlankItem,
  TrueFalseItem,
  MultipleChoiceItem,
  OpenQuestionItem,
  TableFillContent,
  MatchingPair,
  CircleItem,
  ColorIfWrongItem,
  ColorLegend,
  ColorLabelItem,
  CheckboxGroup,
  CalculationItem,
  WordAnalysisSentence,
  ClassificationItem,
  LessonReminder,
  AnswerKeyEntry,
} from "./types";
import {
  makeCell,
  textCell,
  exerciseHeader,
  instructionParagraph,
  subInstructionParagraph,
  warningParagraph,
  blankLine,
  spacer,
  parseMarkdownBold,
  BORDERS_ALL,
  BORDERS_NONE,
  SHADE_HEADER,
  SHADE_REMINDER,
  SHADE_LIGHT_PINK,
  COLOR_BLUE,
  COLOR_RED,
  COLOR_GRAY,
  PAGE_WIDTH_DXA,
} from "./docx-helpers";

export async function buildDocx(evaluation: Evaluation): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // 1. En-tête
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: evaluation.title.toUpperCase(), bold: true, size: 30 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: evaluation.subtitle, italics: true, size: 22 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_BLUE, space: 4 },
      },
    })
  );

  // 2. Tableau Prénom / Date / Note
  children.push(buildInfoTable(evaluation.totalPoints));
  children.push(spacer(140));

  // 3. Encadré Souviens-toi
  if (evaluation.lessonReminder) {
    children.push(renderLessonReminder(evaluation.lessonReminder));
    children.push(spacer(140));
  }

  // 4. Exercices
  for (const ex of evaluation.exercises) {
    children.push(exerciseHeader(ex.number, ex.title, ex.points));
    children.push(instructionParagraph(ex.instruction));
    if (ex.subInstruction) children.push(subInstructionParagraph(ex.subInstruction));
    if (ex.warning) children.push(warningParagraph(ex.warning));

    const exContent = renderExerciseContent(ex);
    for (const item of exContent) children.push(item);
    children.push(spacer(120));
  }

  // 5. Saut de page
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // 6. Corrigé
  const corrige = renderCorrige(evaluation);
  for (const item of corrige) children.push(item);

  // 7. Document final
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 850, right: 1000, bottom: 850, left: 1000 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

function buildInfoTable(totalPoints: number): Table {
  const W = Math.floor(PAGE_WIDTH_DXA / 3);
  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [W, W, PAGE_WIDTH_DXA - 2 * W],
    rows: [
      new TableRow({
        children: [
          textCell("Prénom : .........................", {
            width: W,
            alignment: AlignmentType.LEFT,
          }),
          textCell("Date : .........................", {
            width: W,
            alignment: AlignmentType.LEFT,
          }),
          textCell(`Note :         / ${totalPoints}`, {
            width: PAGE_WIDTH_DXA - 2 * W,
            alignment: AlignmentType.LEFT,
            bold: true,
          }),
        ],
      }),
    ],
  });
}

function renderLessonReminder(reminder: LessonReminder): Table {
  const titleParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `📌 ${reminder.title}`,
        bold: true,
        size: 22,
        color: COLOR_RED,
      }),
    ],
    spacing: { after: 80 },
  });

  const contentParagraphs: Paragraph[] = [titleParagraph];

  if (reminder.textLines && reminder.textLines.length > 0) {
    for (const line of reminder.textLines) {
      const parts = parseMarkdownBold(line);
      contentParagraphs.push(
        new Paragraph({
          children: parts.map(
            (p) => new TextRun({ text: p.text, bold: p.bold, size: 20 })
          ),
          spacing: { after: 40 },
        })
      );
    }
  } else if (reminder.bulletPoints && reminder.bulletPoints.length > 0) {
    for (const point of reminder.bulletPoints) {
      contentParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${point}`, size: 20 })],
          spacing: { after: 40 },
        })
      );
    }
  } else if (reminder.abbreviations && reminder.abbreviations.length > 0) {
    for (const abbr of reminder.abbreviations) {
      contentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${abbr.abbr}`, bold: true, size: 19 }),
            new TextRun({ text: ` — ${abbr.meaning}`, size: 19 }),
          ],
          spacing: { after: 30 },
        })
      );
    }
  }

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [PAGE_WIDTH_DXA],
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          makeCell(contentParagraphs, {
            width: PAGE_WIDTH_DXA,
            shading: SHADE_REMINDER,
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
          }),
        ],
      }),
    ],
  });
}

function renderExerciseContent(ex: Exercise): (Paragraph | Table)[] {
  switch (ex.type) {
    case "fill_in_blank":
      return renderFillInBlank({ wordBank: ex.wordBank, items: ex.items });
    case "true_false":
      return [renderTrueFalse(ex.items)];
    case "multiple_choice":
      return renderMultipleChoice(ex.items);
    case "open_question":
      return renderOpenQuestion(ex.items);
    case "table_fill":
      return [renderTableFill(ex.table)];
    case "matching":
      return [renderMatching(ex.pairs)];
    case "circle_correct":
      return [renderCircleCorrect(ex.items)];
    case "color_if_wrong":
      return [renderColorIfWrong(ex.items)];
    case "color_labels":
      return renderColorLabels({ legend: ex.legend, items: ex.items });
    case "checkbox_list":
      return [renderCheckboxList(ex.groups)];
    case "calculation":
      return [renderCalculation(ex.items)];
    case "word_analysis":
      return renderWordAnalysis(ex.sentences);
    case "classification":
      return renderClassification({ categories: ex.categories, items: ex.items });
  }
}

function renderFillInBlank(content: {
  wordBank?: string[];
  items: FillBlankItem[];
}): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  if (content.wordBank && content.wordBank.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `(${content.wordBank.join(" – ")})`,
            size: 20,
            color: COLOR_GRAY,
          }),
        ],
        spacing: { after: 120 },
      })
    );
  }
  for (const item of content.items) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${item.prefix} ${".".repeat(35)} ${item.suffix}`,
            size: 22,
          }),
        ],
        spacing: { after: 140 },
      })
    );
  }
  return paragraphs;
}

function renderTrueFalse(items: TrueFalseItem[]): Table {
  const W_LETTER = 600,
    W_STATEMENT = 6960,
    W_VF = 1800;
  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [W_LETTER, W_STATEMENT, W_VF],
    rows: items.map(
      (item, i) =>
        new TableRow({
          cantSplit: true,
          children: [
            textCell(`${String.fromCharCode(97 + i)})`, {
              width: W_LETTER,
              bold: true,
            }),
            makeCell(
              [
                new Paragraph({
                  children: [new TextRun({ text: item.statement, size: 22 })],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              { width: W_STATEMENT }
            ),
            textCell("VRAI    /    FAUX", { width: W_VF, bold: true }),
          ],
        })
    ),
  });
}

function renderMultipleChoice(items: MultipleChoiceItem[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  items.forEach((item, qIdx) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${qIdx + 1}) ${item.question}`,
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 120, after: 60 },
      })
    );
    item.options.forEach((opt) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `   ☐ ${opt}`, size: 22 })],
          spacing: { after: 40 },
        })
      );
    });
  });
  return paragraphs;
}

function renderOpenQuestion(items: OpenQuestionItem[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  items.forEach((item, idx) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${String.fromCharCode(97 + idx)}) ${item.question}`,
            size: 22,
          }),
        ],
        spacing: { before: 120, after: 100 },
      })
    );
    for (let i = 0; i < item.lines; i++) {
      paragraphs.push(blankLine());
    }
  });
  return paragraphs;
}

function renderTableFill(content: TableFillContent): Table {
  const colCount = content.headers.length;
  const colWidth = Math.floor(PAGE_WIDTH_DXA / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  columnWidths[colCount - 1] = PAGE_WIDTH_DXA - colWidth * (colCount - 1);

  const headerRow = new TableRow({
    tableHeader: true,
    children: content.headers.map((h, i) =>
      textCell(h, { width: columnWidths[i], bold: true, shading: SHADE_HEADER })
    ),
  });

  const dataRows = content.rows.map(
    (row) =>
      new TableRow({
        cantSplit: true,
        children: [
          textCell(row.rowLabel, {
            width: columnWidths[0],
            bold: true,
            shading: SHADE_HEADER,
          }),
          ...Array.from({ length: row.cells }, (_, i) =>
            makeCell(
              [
                new Paragraph({
                  children: [new TextRun({ text: " ", size: 28 })],
                }),
              ],
              { width: columnWidths[i + 1] }
            )
          ),
        ],
      })
  );

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths,
    rows: [headerRow, ...dataRows],
  });
}

function renderMatching(pairs: MatchingPair[]): Table {
  const rightTexts = pairs.map((p) => p.right);
  const renderRight =
    pairs.length > 2 ? [...rightTexts].reverse() : rightTexts;

  const W_LEFT = 3500,
    W_MIDDLE = 2360,
    W_RIGHT = 3500;

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [W_LEFT, W_MIDDLE, W_RIGHT],
    rows: pairs.map(
      (pair, i) =>
        new TableRow({
          cantSplit: true,
          children: [
            makeCell(
              [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${pair.left}  •`, size: 22 }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
              {
                width: W_LEFT,
                margins: { top: 140, bottom: 140, left: 120, right: 120 },
              }
            ),
            makeCell(
              [new Paragraph({ children: [new TextRun({ text: " " })] })],
              { width: W_MIDDLE, borders: BORDERS_NONE }
            ),
            makeCell(
              [
                new Paragraph({
                  children: [
                    new TextRun({ text: `•  ${renderRight[i]}`, size: 22 }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              {
                width: W_RIGHT,
                margins: { top: 140, bottom: 140, left: 120, right: 120 },
              }
            ),
          ],
        })
    ),
  });
}

function renderCircleCorrect(items: CircleItem[]): Table {
  const colCount = 3;
  const colWidth = Math.floor(PAGE_WIDTH_DXA / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  columnWidths[colCount - 1] = PAGE_WIDTH_DXA - colWidth * (colCount - 1);

  const rows: TableRow[] = [];
  for (let i = 0; i < items.length; i += colCount) {
    const rowCells: TableCell[] = [];
    for (let j = 0; j < colCount; j++) {
      const item = items[i + j];
      if (item) {
        rowCells.push(
          makeCell(
            [
              new Paragraph({
                children: [new TextRun({ text: item.text, size: 22 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            {
              width: columnWidths[j],
              margins: { top: 140, bottom: 140, left: 120, right: 120 },
            }
          )
        );
      } else {
        rowCells.push(
          makeCell(
            [new Paragraph({ children: [new TextRun(" ")] })],
            { width: columnWidths[j], borders: BORDERS_NONE }
          )
        );
      }
    }
    rows.push(new TableRow({ cantSplit: true, children: rowCells }));
  }

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths,
    rows,
  });
}

function renderColorIfWrong(items: ColorIfWrongItem[]): Table {
  const colCount = 4;
  const cellWidth = 2200;
  const spacerWidth = 80;
  const columnWidths: number[] = [];
  for (let i = 0; i < colCount; i++) {
    columnWidths.push(cellWidth);
    if (i < colCount - 1) columnWidths.push(spacerWidth);
  }

  const rows: TableRow[] = [];
  for (let i = 0; i < items.length; i += colCount) {
    const rowCells: TableCell[] = [];
    for (let j = 0; j < colCount; j++) {
      const item = items[i + j];
      if (item) {
        rowCells.push(
          makeCell(
            [
              new Paragraph({
                children: [new TextRun({ text: item.text, size: 22 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            {
              width: cellWidth,
              shading: SHADE_LIGHT_PINK,
              margins: { top: 200, bottom: 200, left: 140, right: 140 },
            }
          )
        );
      } else {
        rowCells.push(
          makeCell(
            [new Paragraph({ children: [new TextRun(" ")] })],
            { width: cellWidth, borders: BORDERS_NONE }
          )
        );
      }
      if (j < colCount - 1) {
        rowCells.push(
          makeCell(
            [new Paragraph({ children: [new TextRun(" ")] })],
            { width: spacerWidth, borders: BORDERS_NONE }
          )
        );
      }
    }
    rows.push(new TableRow({ cantSplit: true, children: rowCells }));
  }

  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths,
    rows,
  });
}

function renderColorLabels(content: {
  legend: ColorLegend[];
  items: ColorLabelItem[];
}): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [];

  const legendText = content.legend
    .map((l) => `${l.color} = ${l.meaning}`)
    .join("   |   ");
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `(${legendText})`,
          size: 20,
          color: COLOR_GRAY,
          italics: true,
        }),
      ],
      spacing: { after: 140 },
    })
  );

  const colCount = 2;
  const colWidth = Math.floor(PAGE_WIDTH_DXA / colCount);
  const columnWidths = [colWidth, PAGE_WIDTH_DXA - colWidth];

  const rows: TableRow[] = [];
  for (let i = 0; i < content.items.length; i += colCount) {
    const rowCells: TableCell[] = [];
    for (let j = 0; j < colCount; j++) {
      const item = content.items[i + j];
      if (item) {
        const colorOptions = content.legend
          .map((l) => `☐ ${l.color}`)
          .join("    ");
        rowCells.push(
          makeCell(
            [
              new Paragraph({
                children: [new TextRun({ text: item.text, size: 22 })],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [new TextRun({ text: " ", size: 12 })],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: colorOptions,
                    size: 18,
                    color: COLOR_GRAY,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            {
              width: colWidth,
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
            }
          )
        );
      } else {
        rowCells.push(
          makeCell(
            [new Paragraph({ children: [new TextRun(" ")] })],
            { width: colWidth, borders: BORDERS_NONE }
          )
        );
      }
    }
    rows.push(new TableRow({ cantSplit: true, children: rowCells }));
  }

  result.push(
    new Table({
      width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
      columnWidths,
      rows,
    })
  );

  return result;
}

function renderCheckboxList(groups: CheckboxGroup[]): Table {
  const W_TITLE = 2200,
    W_OPTS = PAGE_WIDTH_DXA - W_TITLE;

  const rows: TableRow[] = [];
  for (const group of groups) {
    for (let i = 0; i < group.options.length; i++) {
      const opt = group.options[i];
      rows.push(
        new TableRow({
          cantSplit: true,
          children: [
            i === 0
              ? makeCell(
                  [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: group.title,
                          bold: true,
                          size: 22,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  {
                    width: W_TITLE,
                    shading: SHADE_HEADER,
                    margins: { top: 200, bottom: 200, left: 120, right: 120 },
                  }
                )
              : makeCell(
                  [
                    new Paragraph({
                      children: [new TextRun({ text: " " })],
                    }),
                  ],
                  { width: W_TITLE, shading: SHADE_HEADER }
                ),
            makeCell(
              [
                new Paragraph({
                  children: [
                    new TextRun({ text: `☐  ${opt.text}`, size: 22 }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              {
                width: W_OPTS,
                margins: { top: 120, bottom: 120, left: 160, right: 120 },
              }
            ),
          ],
        })
      );
    }
  }

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [W_TITLE, W_OPTS],
    rows,
  });
}

function renderCalculation(items: CalculationItem[]): Table {
  const colCount = 3;
  const colWidth = Math.floor(PAGE_WIDTH_DXA / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  columnWidths[colCount - 1] = PAGE_WIDTH_DXA - colWidth * (colCount - 1);

  const rows: TableRow[] = [];
  for (let i = 0; i < items.length; i += colCount) {
    const rowCells: TableCell[] = [];
    for (let j = 0; j < colCount; j++) {
      const item = items[i + j];
      if (item) {
        rowCells.push(
          makeCell(
            [
              new Paragraph({
                children: [
                  new TextRun({ text: item.problem, size: 24, bold: true }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            {
              width: columnWidths[j],
              margins: { top: 240, bottom: 240, left: 120, right: 120 },
            }
          )
        );
      } else {
        rowCells.push(
          makeCell(
            [new Paragraph({ children: [new TextRun(" ")] })],
            { width: columnWidths[j], borders: BORDERS_NONE }
          )
        );
      }
    }
    rows.push(new TableRow({ cantSplit: true, children: rowCells }));
  }

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths,
    rows,
  });
}

function renderWordAnalysis(
  sentences: WordAnalysisSentence[]
): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [];

  sentences.forEach((s) => {
    result.push(
      new Paragraph({
        children: [
          new TextRun({ text: s.sentence, size: 26, bold: true }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 80 },
      })
    );

    if (s.warning) {
      result.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `⚠️ ${s.warning}`,
              italics: true,
              size: 20,
              color: COLOR_RED,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        })
      );
    } else {
      result.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Écris sous chaque mot sa nature, son genre, son nombre (et pour les verbes : temps, personne, groupe).",
              italics: true,
              size: 18,
              color: COLOR_GRAY,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        })
      );
    }

    const wordCount = s.words.length;
    const colWidth = Math.floor(PAGE_WIDTH_DXA / wordCount);
    const columnWidths = Array(wordCount).fill(colWidth);
    columnWidths[wordCount - 1] =
      PAGE_WIDTH_DXA - colWidth * (wordCount - 1);

    const wordCells = s.words.map(
      (w, i) =>
        new TableCell({
          width: { size: columnWidths[i], type: WidthType.DXA },
          borders: BORDERS_ALL,
          margins: { top: 80, bottom: 200, left: 30, right: 30 },
          verticalAlign: VerticalAlign.TOP,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: w.word, bold: true, size: 22 }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "999999",
                  space: 2,
                },
              },
            }),
            new Paragraph({
              children: [new TextRun({ text: " ", size: 22 })],
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [new TextRun({ text: " ", size: 22 })],
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [new TextRun({ text: " ", size: 22 })],
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [new TextRun({ text: " ", size: 22 })],
              spacing: { after: 80 },
            }),
          ],
        })
    );

    result.push(
      new Table({
        width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
        columnWidths,
        rows: [new TableRow({ cantSplit: true, children: wordCells })],
      })
    );
  });

  return result;
}

function renderClassification(content: {
  categories: string[];
  items: ClassificationItem[];
}): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [];

  const elementsList = content.items.map((i) => i.value).join(" – ");
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Éléments à classer : ${elementsList}`,
          size: 20,
          color: COLOR_GRAY,
          italics: true,
        }),
      ],
      spacing: { after: 140 },
    })
  );

  const colCount = content.categories.length;
  const colWidth = Math.floor(PAGE_WIDTH_DXA / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  columnWidths[colCount - 1] = PAGE_WIDTH_DXA - colWidth * (colCount - 1);

  const headerRow = new TableRow({
    tableHeader: true,
    children: content.categories.map((cat, i) =>
      textCell(cat, {
        width: columnWidths[i],
        bold: true,
        shading: SHADE_HEADER,
      })
    ),
  });

  const linesNeeded = Math.max(3, Math.ceil(content.items.length / colCount) + 1);
  const dataRows: TableRow[] = [];
  for (let i = 0; i < linesNeeded; i++) {
    dataRows.push(
      new TableRow({
        cantSplit: true,
        children: columnWidths.map((w) =>
          makeCell(
            [
              new Paragraph({
                children: [new TextRun({ text: " ", size: 24 })],
              }),
            ],
            { width: w }
          )
        ),
      })
    );
  }

  result.push(
    new Table({
      width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
      columnWidths,
      rows: [headerRow, ...dataRows],
    })
  );

  return result;
}

function renderCorrige(evaluation: Evaluation): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [];

  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "CORRIGÉ – CORRECTION RAPIDE",
          bold: true,
          size: 32,
          color: COLOR_RED,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    })
  );
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "À utiliser pour la correction d'un coup d'œil.",
          italics: true,
          size: 20,
          color: COLOR_GRAY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: COLOR_RED,
          space: 4,
        },
      },
    })
  );

  for (const exercise of evaluation.exercises) {
    const keyEntry = evaluation.answerKey.find(
      (k) => k.exerciseNumber === exercise.number
    );
    const isWarning = keyEntry?.hasWarning;

    result.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Exercice ${exercise.number} – ${exercise.title}   (${exercise.points} pts)`,
            bold: true,
            size: 22,
            color: isWarning ? COLOR_RED : "000000",
          }),
        ],
        spacing: { before: 120, after: 60 },
      })
    );

    const answerParagraphs = renderCorrigeAnswers(exercise);
    for (const p of answerParagraphs) result.push(p);

    if (keyEntry?.warningNote) {
      result.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `⚠️ ${keyEntry.warningNote}`,
              italics: true,
              size: 19,
              color: COLOR_RED,
            }),
          ],
          spacing: { after: 80 },
        })
      );
    }
  }

  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Total : ${evaluation.totalPoints} points`,
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      border: {
        top: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: COLOR_BLUE,
          space: 4,
        },
      },
      spacing: { before: 240 },
    })
  );

  return result;
}

function renderCorrigeAnswers(exercise: Exercise): Paragraph[] {
  switch (exercise.type) {
    case "fill_in_blank": {
      const answers = exercise.items
        .map((it, i) => `${String.fromCharCode(97 + i)}) ${it.answer}`)
        .join("   |   ");
      return [
        new Paragraph({
          children: [new TextRun({ text: answers, size: 20 })],
          spacing: { after: 80 },
        }),
      ];
    }
    case "true_false": {
      return exercise.items.map(
        (it, i) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${String.fromCharCode(97 + i)}) ${it.answer ? "VRAI" : "FAUX"} – ${it.explanation}`,
                size: 20,
              }),
            ],
            spacing: { after: 30 },
          })
      );
    }
    case "multiple_choice": {
      return exercise.items.map(
        (it, i) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${i + 1}) ${it.options[it.answerIndex]}`,
                size: 20,
              }),
            ],
            spacing: { after: 30 },
          })
      );
    }
    case "open_question": {
      return exercise.items.map(
        (it, i) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${String.fromCharCode(97 + i)}) ${it.answer}`,
                size: 20,
              }),
            ],
            spacing: { after: 60 },
          })
      );
    }
    case "table_fill": {
      return exercise.table.rows.map(
        (row) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${row.rowLabel} : ${row.answers.join(" | ")}`,
                size: 20,
              }),
            ],
            spacing: { after: 30 },
          })
      );
    }
    case "matching": {
      return exercise.pairs.map(
        (p) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${p.left}  →  ${p.right}`, size: 20 }),
            ],
            spacing: { after: 30 },
          })
      );
    }
    case "circle_correct": {
      const corrects = exercise.items.filter((i) => i.isCorrect);
      const wrongs = exercise.items.filter((i) => !i.isCorrect);
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: "À ENTOURER (correct) : ",
              bold: true,
              size: 20,
            }),
            new TextRun({
              text: corrects
                .map((c) => `${c.text}${c.hint ? ` ${c.hint}` : ""}`)
                .join(" | "),
              size: 19,
            }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "À ne pas entourer (faux) : ",
              bold: true,
              size: 20,
              color: COLOR_RED,
            }),
            new TextRun({
              text: wrongs
                .map((w) => `${w.text}${w.hint ? ` ${w.hint}` : ""}`)
                .join(" | "),
              size: 19,
            }),
          ],
          spacing: { after: 80 },
        }),
      ];
    }
    case "color_if_wrong": {
      const toColor = exercise.items.filter((i) => !i.isCorrect);
      const dontColor = exercise.items.filter((i) => i.isCorrect);
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: "À COLORIER (faux) : ",
              bold: true,
              size: 20,
            }),
            new TextRun({
              text: toColor
                .map((t) => `${t.text}${t.hint ? ` ${t.hint}` : ""}`)
                .join(" | "),
              size: 19,
            }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "⚠️ NE PAS colorier (vrai – pièges) : ",
              bold: true,
              size: 20,
              color: COLOR_RED,
            }),
            new TextRun({
              text: dontColor
                .map((d) => `${d.text}${d.hint ? ` ${d.hint}` : ""}`)
                .join(" | "),
              size: 19,
            }),
          ],
          spacing: { after: 80 },
        }),
      ];
    }
    case "color_labels": {
      return exercise.items.map(
        (it) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${it.text}  →  ${it.expectedColor.toUpperCase()}${it.hint ? `  (${it.hint})` : ""}`,
                size: 20,
              }),
            ],
            spacing: { after: 30 },
          })
      );
    }
    case "checkbox_list": {
      const result: Paragraph[] = [];
      for (const group of exercise.groups) {
        result.push(
          new Paragraph({
            children: [
              new TextRun({ text: group.title, bold: true, size: 20 }),
            ],
            spacing: { before: 40, after: 30 },
          })
        );
        for (const opt of group.options) {
          result.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${opt.isCorrect ? "✅" : "❌"} ${opt.text}${opt.hint ? ` — ${opt.hint}` : ""}`,
                  size: 19,
                  color: opt.isCorrect ? "000000" : COLOR_RED,
                }),
              ],
              spacing: { after: 20 },
            })
          );
        }
      }
      return result;
    }
    case "calculation": {
      const lines = exercise.items
        .map((it) => `${it.problem} ${it.answer}`)
        .join("   |   ");
      return [
        new Paragraph({
          children: [new TextRun({ text: lines, size: 20 })],
          spacing: { after: 80 },
        }),
      ];
    }
    case "word_analysis": {
      const result: Paragraph[] = [];
      for (const s of exercise.sentences) {
        result.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `« ${s.sentence} » : `,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { before: 40, after: 20 },
          })
        );
        const wordLines = s.words.map(
          (w) => `${w.word} : ${w.nature}, ${w.attrs}`
        );
        result.push(
          new Paragraph({
            children: [
              new TextRun({ text: wordLines.join("  |  "), size: 18 }),
            ],
            spacing: { after: 40 },
          })
        );
      }
      return result;
    }
    case "classification": {
      const byCategory: Record<string, string[]> = {};
      for (const cat of exercise.categories) byCategory[cat] = [];
      for (const item of exercise.items) {
        if (byCategory[item.category]) byCategory[item.category].push(item.value);
      }
      return Object.entries(byCategory).map(
        ([cat, vals]) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${cat} : `, bold: true, size: 20 }),
              new TextRun({ text: vals.join(", "), size: 20 }),
            ],
            spacing: { after: 30 },
          })
      );
    }
  }
}
